using MamMoi.Application.DTOs.Garden;
using MamMoi.Application.Interfaces;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using GardenEntity = MamMoi.Infrastructure.Models.Garden;
using GardenMemberEntity = MamMoi.Infrastructure.Models.GardenMember;

namespace MamMoi.Infrastructure.Services.Gardens;

/// <summary>
/// Garden Service - Xử lý business logic cho quản lý vườn
/// Bao gồm: Tạo vườn, xem danh sách, xem chi tiết, cập nhật vườn
/// </summary>
public class GardenService : IGardenService
{
    private readonly IGardenRepository _gardenRepository;
    private readonly IUserRepository _userRepository;
    private readonly IGardenMemberRepository _gardenMemberRepository;
    private readonly MamMoiDbContext _dbContext;

    public GardenService(
        IGardenRepository gardenRepository,
        IUserRepository userRepository,
        IGardenMemberRepository gardenMemberRepository,
        MamMoiDbContext dbContext)
    {
        _gardenRepository = gardenRepository;
        _userRepository = userRepository;
        _gardenMemberRepository = gardenMemberRepository;
        _dbContext = dbContext;
    }

    /// <summary>
    /// CHỨC NĂNG 1: Tạo vườn mới
    /// - Chỉ Farmer (RoleId = 4) mới được tạo vườn
    /// - Tự động thêm Owner vào GardenMember
    /// </summary>
    public async Task<GardenResponseDto> CreateGardenAsync(int userId, CreateGardenDto dto)
    {
        // 1. Kiểm tra user có tồn tại không
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new UnauthorizedAccessException("User không tồn tại.");
        }

        // 2. Kiểm tra user có phải Farmer không (RoleId = 3)
        var userEntity = (User)user;
        if (userEntity.RoleId != 3)
        {
            throw new UnauthorizedAccessException("Chỉ Farmer mới được tạo vườn.");
        }

        // 3. Tạo Garden entity
        var garden = new GardenEntity
        {
            UserId = userId,
            Name = dto.Name.Trim(),
            Location = dto.Location?.Trim(),
            TimeZone = dto.TimeZone?.Trim(),
            ClimateZone = dto.ClimateZone?.Trim(),
            CreatedAt = DateTime.Now,
            Status = dto.Status,
            CoverUrl = dto.CoverUrl,
        };

        // 4. Lưu vào database
        var createdGardenDynamic = await _gardenRepository.CreateAsync(garden);
        var createdGarden = (Garden)createdGardenDynamic;

        // 5. Tự động thêm Owner vào GardenMember (RoleId = 3 - Farmer làm Owner)
        var gardenMember = new GardenMemberEntity
        {
            GardenId = createdGarden.GardenId,
            UserId = userId,
            RoleId = 3, // Farmer role as Owner
            CreatedAt = DateTime.Now
        };
        await _gardenMemberRepository.AddAsync(gardenMember);

        // 6. Create GardenSoil records from SoilMaster IDs if provided
        if (dto.SoilMasterIds != null && dto.SoilMasterIds.Count > 0)
        {
            // Validate that all SoilMaster IDs exist
            var validSoilMasterIds = await _dbContext.SoilMasters
                .Where(sm => dto.SoilMasterIds.Contains(sm.SoilMasterId))
                .Select(sm => sm.SoilMasterId)
                .ToListAsync();

            // Create GardenSoil records for each valid SoilMaster ID
            var gardenSoils = validSoilMasterIds.Select(soilMasterId => new GardenSoil
            {
                GardenId = createdGarden.GardenId,
                SoilMasterId = soilMasterId,
                CustomLabel = null,
                Notes = null,
                CreatedAt = DateTime.Now
            }).ToList();

            await _dbContext.GardenSoils.AddRangeAsync(gardenSoils);
            await _dbContext.SaveChangesAsync();
        }

        // 7. Reload garden to include GardenSoils
        var reloadedGardenDynamic = await _gardenRepository.GetByIdAsync(createdGarden.GardenId);
        var reloadedGarden = (Garden)reloadedGardenDynamic!;

        // 8. Map sang DTO và return
        return MapToResponseDto(reloadedGarden, userId);
    }

    /// <summary>
    /// CHỨC NĂNG 2: Xem danh sách vườn của user (có phân trang + search)
    /// - Farmer: xem vườn mình sở hữu
    /// - Staff: xem vườn được assign
    /// </summary>
    public async Task<GardenListResponseDto> GetGardensAsync(
        int userId,
        int pageNumber = 1,
        int pageSize = 10,
        string? searchTerm = null)
    {
        // Validate pagination parameters
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100; // Max 100 items per page

        // Get gardens from repository
        var (gardensDynamic, totalCount) = await _gardenRepository.GetGardensByUserIdAsync(
            userId, pageNumber, pageSize, searchTerm);

        // Cast to Garden entities
        var gardens = gardensDynamic.Cast<Garden>().ToList();

        // Map to DTOs
        var gardenDtos = gardens.Select(g => new GardenListDto
        {
            GardenId = g.GardenId,
            Name = g.Name,
            Location = g.Location,
            TimeZone = g.TimeZone,
            ClimateZone = g.ClimateZone,
            CreatedAt = g.CreatedAt,
            TotalTrees = g.Trees?.Count ?? 0,
            IsOwner = g.UserId == userId,
            Status = g.Status,
            CoverUrl = g.CoverUrl,
        }).ToList();

        // Return paginated response
        return new GardenListResponseDto
        {
            Gardens = gardenDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    /// <summary>
    /// CHỨC NĂNG 3: Xem chi tiết 1 vườn
    /// - User phải có quyền truy cập (Owner hoặc Member)
    /// - Bao gồm thống kê cây và nhân viên
    /// </summary>
    public async Task<GardenResponseDto> GetGardenByIdAsync(int gardenId, int userId)
    {
        // 1. Kiểm tra user có quyền truy cập garden không
        var hasAccess = await _gardenRepository.HasAccessAsync(gardenId, userId);
        if (!hasAccess)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền truy cập vườn này.");
        }

        // 2. Lấy garden data
        var gardenDynamic = await _gardenRepository.GetByIdAsync(gardenId);
        if (gardenDynamic == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy vườn với ID {gardenId}.");
        }

        var garden = (Garden)gardenDynamic;

        // 3. Map sang DTO với đầy đủ thống kê
        return MapToResponseDto(garden, userId);
    }

    /// <summary>
    /// CHỨC NĂNG 4: Cập nhật thông tin vườn
    /// - Chỉ Owner mới được update
    /// - Có thể update Name và/hoặc Location
    /// </summary>
    public async Task<GardenResponseDto> UpdateGardenAsync(int gardenId, int userId, UpdateGardenDto dto)
    {
        // 1. Kiểm tra user có phải Owner không
        var isOwner = await _gardenRepository.IsOwnerAsync(gardenId, userId);
        if (!isOwner)
        {
            throw new UnauthorizedAccessException("Chỉ chủ vườn mới có quyền cập nhật thông tin.");
        }

        // 2. Lấy garden hiện tại
        var gardenDynamic = await _gardenRepository.GetByIdAsync(gardenId);
        if (gardenDynamic == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy vườn với ID {gardenId}.");
        }

        var garden = (Garden)gardenDynamic;

        // 3. Update các field nếu có giá trị mới
        if (!string.IsNullOrWhiteSpace(dto.Name))
        {
            garden.Name = dto.Name.Trim();
        }

        if (dto.CoverUrl != null)
        {
            if (!string.IsNullOrWhiteSpace(garden.CoverUrl) &&
                garden.CoverUrl != dto.CoverUrl &&
                garden.CoverUrl.Contains("/uploads/"))
            {
                try
                {
                    var fileName = Path.GetFileName(new Uri(garden.CoverUrl).LocalPath);
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", fileName);

                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }
                catch
                {
                    // Ignore deletion errors, log if needed
                }
            }
            garden.CoverUrl = dto.CoverUrl.Trim();
        }

        if (dto.Status != null)
        {
            garden.Status = dto.Status.Trim();
        }

        if (dto.Location != null) // Allow clearing location
        {
            garden.Location = string.IsNullOrWhiteSpace(dto.Location)
                ? null
                : dto.Location.Trim();
        }

        if (dto.TimeZone != null) // Allow clearing time zone
        {
            garden.TimeZone = string.IsNullOrWhiteSpace(dto.TimeZone)
                ? null
                : dto.TimeZone.Trim();
        }

        if (dto.ClimateZone != null) // Allow clearing climate zone
        {
            garden.ClimateZone = string.IsNullOrWhiteSpace(dto.ClimateZone)
                ? null
                : dto.ClimateZone.Trim();
        }

        // 4. Lưu thay đổi
        await _gardenRepository.UpdateAsync(garden);

        // 5. Update GardenSoil records if SoilMasterIds provided
        if (dto.SoilMasterIds != null)
        {
            // Remove existing GardenSoil records for this garden
            var existingGardenSoils = await _dbContext.GardenSoils
                .Where(gs => gs.GardenId == gardenId)
                .ToListAsync();
            
            if (existingGardenSoils.Any())
            {
                _dbContext.GardenSoils.RemoveRange(existingGardenSoils);
            }

            // Create new GardenSoil records from provided SoilMaster IDs
            if (dto.SoilMasterIds.Count > 0)
            {
                // Validate that all SoilMaster IDs exist
                var validSoilMasterIds = await _dbContext.SoilMasters
                    .Where(sm => dto.SoilMasterIds.Contains(sm.SoilMasterId))
                    .Select(sm => sm.SoilMasterId)
                    .ToListAsync();

                // Create GardenSoil records for each valid SoilMaster ID
                var newGardenSoils = validSoilMasterIds.Select(soilMasterId => new GardenSoil
                {
                    GardenId = gardenId,
                    SoilMasterId = soilMasterId,
                    CustomLabel = null,
                    Notes = null,
                    CreatedAt = DateTime.Now
                }).ToList();

                await _dbContext.GardenSoils.AddRangeAsync(newGardenSoils);
            }

            await _dbContext.SaveChangesAsync();
        }

        // 6. Reload garden với related data và return
        var updatedGardenDynamic = await _gardenRepository.GetByIdAsync(gardenId);
        var updatedGarden = (Garden)updatedGardenDynamic!;
        return MapToResponseDto(updatedGarden, userId);
    }

    #region Private Helper Methods

    /// <summary>
    /// Helper: Map Garden entity sang GardenResponseDto với statistics
    /// </summary>
    private GardenResponseDto MapToResponseDto(Garden garden, int currentUserId)
    {
        // ---- Calculate statistics ----
        var totalTrees = garden.Trees?.Count ?? 0;

        // Healthy nếu cả 4 trạng thái đều “Bình thường”
        var healthyTrees = garden.Trees?.Count(t =>
            t.LeafStatus == "Bình thường" &&
            t.BranchStatus == "Bình thường" &&
            t.FlowerStatus == "Bình thường" &&
            t.FruitStatus == "Bình thường") ?? 0;

        // Cần chú ý nếu có bất kỳ trạng thái nào khác "Bình thường"
        var treesNeedingAttention = garden.Trees?.Count(t =>
            t.LeafStatus != "Bình thường" ||
            t.BranchStatus != "Bình thường" ||
            t.FlowerStatus != "Bình thường" ||
            t.FruitStatus != "Bình thường") ?? 0;

        var totalStaff = garden.GardenMembers?.Count(gm => gm.RoleId == 4) ?? 0; // Staff role = 4

        // ---- Build DTO ----
        return new GardenResponseDto
        {
            GardenId = garden.GardenId,
            UserId = garden.UserId,
            OwnerName = garden.User?.FullName ?? garden.User?.Email ?? "Unknown",
            Name = garden.Name,
            Location = garden.Location,
            CreatedAt = garden.CreatedAt,
            IsOwner = garden.UserId == currentUserId,

            // (Bỏ TimeZone & ClimateZone nếu đã loại khỏi model)
            // TimeZone = garden.TimeZone,
            // ClimateZone = garden.ClimateZone,

            Statistics = new GardenStatistics
            {
                TotalTrees = totalTrees,
                HealthyTrees = healthyTrees,
                TreesNeedingAttention = treesNeedingAttention,
                TotalStaff = totalStaff
            }
        };
    }

    public async Task<GardenResponseDto> UpdateGardenStatusAsync(int gardenId, int userId, string status)
    {
        var isOwner = await _gardenRepository.IsOwnerAsync(gardenId, userId);
        if (!isOwner)
        {
            throw new UnauthorizedAccessException("Chỉ chủ vườn mới có quyền cập nhật trạng thái.");
        }

        var gardenDynamic = await _gardenRepository.GetByIdAsync(gardenId);
        if (gardenDynamic == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy vườn với ID {gardenId}.");
        }

        var garden = (Garden)gardenDynamic;

        // 3. Update status
        garden.Status = status;

        // 4. Save changes
        await _gardenRepository.UpdateAsync(garden);

        // 5. Reload and return DTO
        var updatedGardenDynamic = await _gardenRepository.GetByIdAsync(gardenId);
        var updatedGarden = (Garden)updatedGardenDynamic!;
        return MapToResponseDto(updatedGarden, userId);
    }

    #endregion
}
