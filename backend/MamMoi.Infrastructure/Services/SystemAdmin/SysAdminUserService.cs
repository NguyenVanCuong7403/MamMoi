
using MamMoi.Application.DTOs.SystemAdmin;
using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.Services.SystemAdmin
{
    public class SysAdminUserService : ISysAdminUserService
    {
        private readonly MamMoiDbContext _context;

        public SysAdminUserService(MamMoiDbContext context)
        {
            _context = context;
        }

        // 1. GET ALL
        public async Task<PagedResult<SysUserDto>> GetUsersAsync(SysUserFilterDto filter)
        {
            var query = _context.Users
                .Include(u => u.Role)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                string term = filter.SearchTerm.Trim().ToLower();
                query = query.Where(u => u.FullName.Contains(term) || u.Email.Contains(term));
            }

            // Fix CS0019: So sánh int với int là OK
            if (filter.RoleId.HasValue && filter.RoleId > 0)
                query = query.Where(u => u.RoleId == filter.RoleId.Value);

            if (filter.IsActive.HasValue)
                query = query.Where(u => u.IsActive == filter.IsActive.Value);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(u => new SysUserDto
                {
                    UserId = u.UserId, // UserId trong DB là int -> OK
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
                    Address = u.Address,
                    PreferredLanguage = u.PreferredLanguage,
                    ExperienceLevel = u.ExperienceLevel,
                    RoleId = u.RoleId,
                    RoleName = u.Role.RoleName,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                })
                .ToListAsync();

            return new PagedResult<SysUserDto>
            {
                Items = items,
                Total = totalCount,
                Page = filter.PageNumber,
                PageSize = filter.PageSize
            };
        }

        // 2. CREATE (Fix CS0029)
        public async Task<SysUserDto> CreateUserAsync(SysUserCreateDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                throw new Exception("Email này đã tồn tại.");

            if (!await _context.Roles.AnyAsync(r => r.RoleId == dto.RoleId))
                throw new Exception("RoleID không hợp lệ.");

            var newUser = new User
            {
                // BỎ DÒNG UserId = Guid.NewGuid(); 
                // Để SQL tự tăng ID (Identity)
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = HashPassword(dto.Password),
                RoleId = dto.RoleId,
                Phone = dto.Phone,
                Address = dto.Address,
                ProfileImageUrl = dto.ProfileImageUrl,
                PreferredLanguage = dto.PreferredLanguage ?? "vi",
                ExperienceLevel = dto.ExperienceLevel,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            var role = await _context.Roles.FindAsync(dto.RoleId);
            newUser.Role = role;

            return MapToDto(newUser);
        }

        // 3. UPDATE (Dùng int id)
        public async Task<bool> UpdateUserAsync(int id, SysUserUpdateDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return false;

            user.FullName = dto.FullName;
            user.Phone = dto.Phone;
            user.Address = dto.Address;
            user.ProfileImageUrl = dto.ProfileImageUrl;
            user.PreferredLanguage = dto.PreferredLanguage;
            user.ExperienceLevel = dto.ExperienceLevel;
            user.RoleId = dto.RoleId;
            user.IsActive = dto.IsActive;
            user.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        // 4. GET BY ID (Dùng int id)
        public async Task<SysUserDto?> GetUserByIdAsync(int id)
        {
            var u = await _context.Users
                .Include(u => u.Role)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (u == null) return null;
            return MapToDto(u);
        }

        public async Task<SysUserDetailDto?> GetUserDetailAsync(int id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Gardens)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null) return null;

            // Get tree counts for each garden without including full tree entities
            var gardenTreeCounts = await _context.Trees
                .Where(t => t.UserId == id)
                .GroupBy(t => t.GardenId)
                .Select(g => new { GardenId = g.Key, TreeCount = g.Count() })
                .ToDictionaryAsync(g => g.GardenId, g => g.TreeCount);

            var gardens = user.Gardens.Select(g => new GardenSummaryDto
            {
                GardenId = g.GardenId.ToString(),
                GardenName = g.Name,
                TreeCount = gardenTreeCounts.ContainsKey(g.GardenId) ? gardenTreeCounts[g.GardenId] : 0,
                Province = g.Location ?? "Chưa xác định"
            }).ToList();

            return new SysUserDetailDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Address = user.Address,
                PreferredLanguage = user.PreferredLanguage,
                ExperienceLevel = user.ExperienceLevel,
                ProfileImageUrl = user.ProfileImageUrl,
                RoleId = user.RoleId,
                RoleName = user.Role.RoleName,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                TotalGardens = user.Gardens.Count,
                TotalTrees = gardenTreeCounts.Values.Sum(),
                Gardens = gardens,
                PlanName = "Free" // Có thể lấy từ subscription table sau
            };
        }

        // 5. TOGGLE (Dùng int id)
        public async Task<bool> ToggleUserStatusAsync(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return false;
            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();
            return true;
        }

        // 6. DELETE (Dùng int id)
        public async Task<bool> DeleteUserPermanentAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;
            try
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return true;
            }
            catch { return false; }
        }

        private SysUserDto MapToDto(User u)
        {
            return new SysUserDto
            {
                UserId = u.UserId,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                Address = u.Address,
                ProfileImageUrl = u.ProfileImageUrl,
                PreferredLanguage = u.PreferredLanguage,
                ExperienceLevel = u.ExperienceLevel,
                RoleId = u.RoleId,
                RoleName = u.Role?.RoleName ?? "Unknown",
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            };
        }

        private byte[] HashPassword(string password)
        {
            using var hmac = new HMACSHA512();
            return hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }
    }
}