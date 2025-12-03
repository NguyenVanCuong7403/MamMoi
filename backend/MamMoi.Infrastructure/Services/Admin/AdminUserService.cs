using System;
using MamMoi.Application.DTOs.Admin;
using MamMoi.Application.Interfaces.Admin;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace MamMoi.Infrastructure.Services.Admin;

/// <summary>
/// Service for admin user management
/// </summary>
public class AdminUserService : IAdminUserService
{
    private readonly MamMoiDbContext _dbContext;
    private readonly ILogger<AdminUserService> _logger;

    public AdminUserService(
        MamMoiDbContext dbContext,
        ILogger<AdminUserService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<(List<AdminUserListDto> users, int totalCount)> GetAllUsersAsync(
        int page = 1,
        int pageSize = 20,
        string? searchTerm = null,
        int? roleId = null,
        bool? isActive = null)
    {
        var query = _dbContext.Users
            .Include(u => u.Role)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            // Trim search term
            var trimmedSearchTerm = searchTerm.Trim();
            
            // Case-insensitive search across multiple fields (FullName, Email, Phone)
            // EF.Functions.Like is case-insensitive by default in SQL Server with CI collation
            query = query.Where(u =>
                (u.FullName != null && EF.Functions.Like(u.FullName, $"%{trimmedSearchTerm}%")) ||
                (u.Email != null && EF.Functions.Like(u.Email, $"%{trimmedSearchTerm}%")) ||
                (u.Phone != null && EF.Functions.Like(u.Phone, $"%{trimmedSearchTerm}%"))
            );
        }

        if (roleId.HasValue)
        {
            query = query.Where(u => u.RoleId == roleId.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Get paginated user IDs first (preserve order)
        var userIdsOrdered = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new { u.UserId, u.CreatedAt })
            .ToListAsync();

        var userIds = userIdsOrdered.Select(x => x.UserId).ToList();
        var userIdToOrder = userIdsOrdered.ToDictionary(x => x.UserId, x => x.CreatedAt);

        // Get users with subscriptions
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var usersWithSubscriptions = await _dbContext.Users
            .Include(u => u.Role)
            .Include(u => u.Subscriptions)
            .Include(u => u.Gardens)
            .Include(u => u.Trees)
            .Where(u => userIds.Contains(u.UserId))
            .ToListAsync();

        // Get active subscriptions for all users in one query
        var activeSubscriptions = await _dbContext.Subscriptions
            .Where(s => userIds.Contains(s.UserId) &&
                       s.Status == "Active" &&
                       (s.EndDate == null || s.EndDate >= today))
            .GroupBy(s => s.UserId)
            .Select(g => new { UserId = g.Key, Subscription = g.OrderByDescending(s => s.StartDate).First() })
            .ToDictionaryAsync(x => x.UserId, x => x.Subscription);

        // Map to DTOs, preserving the original order
        var users = userIds
            .Select(userId =>
            {
                var u = usersWithSubscriptions.First(usr => usr.UserId == userId);
                var activeSubscription = activeSubscriptions.GetValueOrDefault(u.UserId);
                // Map database PlanType ("plan1", "plan2", "plan3") to frontend format ("seedling", "orchard", "harvest")
                var planType = activeSubscription?.PlanType != null
                    ? MapPlanTypeToFrontend(activeSubscription.PlanType)
                    : null;
                return new AdminUserListDto
                {
                    UserId = u.UserId,
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
                    RoleName = u.Role.RoleName,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    LastLoginAt = u.LastLoginAt,
                    GardensCount = u.Gardens.Count,
                    TreesCount = u.Trees.Count,
                    PlanType = planType, // "seedling", "orchard", "harvest", or null
                    PlanStartDate = activeSubscription?.StartDate.ToDateTime(TimeOnly.MinValue),
                    PlanEndDate = activeSubscription?.EndDate?.ToDateTime(TimeOnly.MinValue)
                };
            })
            .ToList();

        return (users, totalCount);
    }

    public async Task<AdminUserDetailDto?> GetUserByIdAsync(int userId)
    {
        var user = await _dbContext.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null)
            return null;

        return new AdminUserDetailDto
        {
            UserId = user.UserId,
            RoleId = user.RoleId,
            RoleName = user.Role.RoleName,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            ProfileImageUrl = user.ProfileImageUrl,
            ExperienceLevel = user.ExperienceLevel,
            PreferredLanguage = user.PreferredLanguage,
            NotificationPreferences = user.NotificationPreferences,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            LastLoginAt = user.LastLoginAt,
            GardensCount = await _dbContext.Gardens.CountAsync(g => g.UserId == userId),
            TreesCount = await _dbContext.Trees.CountAsync(t => t.UserId == userId),
            SubscriptionsCount = await _dbContext.Subscriptions.CountAsync(s => s.UserId == userId),
            PaymentsCount = await _dbContext.Payments.CountAsync(p => p.UserId == userId)
        };
    }

    public async Task<AdminUserDetailDto?> UpdateUserAsync(int userId, AdminUpdateUserDto dto)
    {
        var user = await _dbContext.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null)
            return null;

        // Update fields if provided
        if (!string.IsNullOrWhiteSpace(dto.FullName))
            user.FullName = dto.FullName;

        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            // Check if email already exists for another user
            var emailExists = await _dbContext.Users
                .AnyAsync(u => u.Email == dto.Email && u.UserId != userId);
            if (emailExists)
                throw new InvalidOperationException("Email already exists");

            user.Email = dto.Email;
        }

        if (dto.Phone != null)
            user.Phone = dto.Phone;

        if (dto.Address != null)
            user.Address = dto.Address;

        if (dto.ExperienceLevel != null)
            user.ExperienceLevel = dto.ExperienceLevel;

        if (dto.PreferredLanguage != null)
            user.PreferredLanguage = dto.PreferredLanguage;

        if (dto.RoleId.HasValue)
        {
            // Không cho phép chuyển đổi thành role SystemAdmin (RoleId = 3)
            if (dto.RoleId.Value == 3)
            {
                throw new InvalidOperationException("Không thể chuyển đổi vai trò thành Quản trị hệ thống.");
            }

            // Kiểm tra nếu user hiện tại có role SystemAdmin (RoleId = 3)
            // thì không cho phép thay đổi role sang bất kỳ role nào khác
            if (user.RoleId == 3)
            {
                throw new InvalidOperationException("Không thể thay đổi vai trò của Quản trị hệ thống.");
            }

            // Kiểm tra role có tồn tại không
            var roleExists = await _dbContext.Roles.AnyAsync(r => r.RoleId == dto.RoleId.Value);
            if (!roleExists)
                throw new InvalidOperationException("Role not found");

            // Cập nhật role
            user.RoleId = dto.RoleId.Value;
        }

        user.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return await GetUserByIdAsync(userId);
    }

    public async Task<bool> ActivateUserAsync(int userId)
    {
        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
            return false;

        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeactivateUserAsync(int userId)
    {
        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
            return false;

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<bool> UpdateUserSubscriptionPlanAsync(
        int userId,
        string? planType,
        DateOnly? startDate,
        DateOnly? endDate)
    {
        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
            return false;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var effectiveStartDate = startDate ?? today;

        if (endDate.HasValue && endDate.Value < effectiveStartDate)
        {
            throw new InvalidOperationException("Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.");
        }

        // Đóng subscription active hiện tại nếu có
        var activeSubscriptions = await _dbContext.Subscriptions
            .Where(s => s.UserId == userId &&
                       s.Status == "Active" &&
                       (s.EndDate == null || s.EndDate >= today))
            .ToListAsync();

        var closingDate = effectiveStartDate.AddDays(-1);
        foreach (var subscription in activeSubscriptions)
        {
            subscription.Status = "Inactive";
            var adjustedClosing = closingDate < subscription.StartDate
                ? subscription.StartDate
                : closingDate;
            subscription.EndDate = adjustedClosing;
        }

        // Nếu planType là null hoặc "free", chỉ cần đóng subscription hiện tại
        if (string.IsNullOrWhiteSpace(planType) || planType.ToLower() == "free")
        {
            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("User {UserId} subscription plan changed to free", userId);
            return true;
        }

        // Map planType từ frontend sang PlanType trong database
        // Frontend uses: "seedling", "orchard", "harvest"
        // Database has: "plan1", "plan2", "plan3"
        string? dbPlanType = planType.ToLower() switch
        {
            "seedling" => "plan1",
            "orchard" => "plan2",
            "harvest" => "plan3",
            _ => null
        };

        if (string.IsNullOrWhiteSpace(dbPlanType))
        {
            _logger.LogWarning("Invalid planType: '{PlanType}'", planType);
            throw new InvalidOperationException($"Invalid plan type: '{planType}'. Valid values are: seedling, orchard, harvest, or free");
        }

        // Tìm subscription plan theo PlanType (ưu tiên) hoặc PlanName (fallback)
        var subscriptionPlan = await _dbContext.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.PlanType != null && 
                                     p.PlanType.ToLower() == dbPlanType.ToLower() && 
                                     p.IsActive);

        // Nếu không tìm thấy theo PlanType, thử tìm theo PlanName (fallback cho tương thích ngược)
        if (subscriptionPlan == null)
        {
            string? planName = planType.ToLower() switch
            {
                "seedling" => "Gói 1",
                "orchard" => "Gói 2",
                "harvest" => "Gói 3",
                _ => null
            };

            if (!string.IsNullOrWhiteSpace(planName))
            {
                subscriptionPlan = await _dbContext.SubscriptionPlans
                    .FirstOrDefaultAsync(p => p.PlanName == planName && p.IsActive);
                
                if (subscriptionPlan != null)
                {
                    _logger.LogInformation(
                        "Found subscription plan by PlanName '{PlanName}' instead of PlanType '{PlanType}'. Using plan: {FoundPlanName}",
                        planName, dbPlanType, subscriptionPlan.PlanName);
                }
            }
        }

        if (subscriptionPlan == null)
        {
            // Log tất cả các plans có sẵn để debug
            var availablePlans = await _dbContext.SubscriptionPlans
                .Select(p => new { p.PlanName, p.PlanType, p.IsActive })
                .ToListAsync();
            
            var activePlans = availablePlans.Where(p => p.IsActive).ToList();
            var inactivePlans = availablePlans.Where(p => !p.IsActive).ToList();
            
            _logger.LogWarning(
                "Subscription plan not found. Requested PlanType (frontend): '{FrontendPlanType}', PlanType (database): '{DbPlanType}'. " +
                "Active plans in database: {ActivePlans}. Inactive plans: {InactivePlans}",
                planType, dbPlanType,
                string.Join(", ", activePlans.Select(p => $"{p.PlanName} ({p.PlanType})")),
                string.Join(", ", inactivePlans.Select(p => $"{p.PlanName} ({p.PlanType})")));

            var errorMessage = $"Subscription plan '{planType}' (type: '{dbPlanType}') not found or is inactive. ";
            if (activePlans.Any())
            {
                errorMessage += $"Available active plans: {string.Join(", ", activePlans.Select(p => p.PlanName))}";
            }
            else
            {
                errorMessage += "No active subscription plans found in database.";
            }
            
            throw new InvalidOperationException(errorMessage);
        }

        // Tạo subscription mới
        var calculatedEndDate = endDate
            ?? (subscriptionPlan.DurationInMonths.HasValue
                ? effectiveStartDate.AddMonths(subscriptionPlan.DurationInMonths.Value)
                : null);

        var newSubscription = new Subscription
        {
            UserId = userId,
            PlanName = subscriptionPlan.PlanName,
            PlanType = subscriptionPlan.PlanType,
            StartDate = effectiveStartDate,
            EndDate = calculatedEndDate,
            Status = "Active",
            Price = subscriptionPlan.Price,
            Currency = subscriptionPlan.Currency
        };

        _dbContext.Subscriptions.Add(newSubscription);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} subscription plan changed to {PlanType} (Plan: {PlanName})",
            userId, planType, subscriptionPlan.PlanName);

        return true;
    }

    public async Task<bool> ResetUserPasswordAsync(int userId, string newPassword)
    {
        // Validate password length
        if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 10)
        {
            throw new InvalidOperationException("Mật khẩu phải có tối thiểu 10 ký tự.");
        }

        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
            return false;

        // Hash password mới (sử dụng cùng phương thức như AuthService)
        var passwordHash = HashPassword(newPassword);

        // Cập nhật password trong DB
        user.PasswordHash = passwordHash;
        user.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Admin reset password for user {UserId}", userId);

        return true;
    }

    /// <summary>
    /// Hash password bằng SHA256 (giống như AuthService)
    /// </summary>
    private byte[] HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        return sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
    }

    /// <summary>
    /// Map PlanType từ database format ("plan1", "plan2", "plan3") sang frontend format ("seedling", "orchard", "harvest")
    /// </summary>
    private string? MapPlanTypeToFrontend(string? dbPlanType)
    {
        if (string.IsNullOrWhiteSpace(dbPlanType))
            return null;

        return dbPlanType.ToLower() switch
        {
            "plan1" => "seedling",
            "plan2" => "orchard",
            "plan3" => "harvest",
            // Nếu đã là frontend format, trả về nguyên giá trị
            "seedling" => "seedling",
            "orchard" => "orchard",
            "harvest" => "harvest",
            // Nếu không khớp, trả về null (sẽ hiển thị "Người dùng Free")
            _ => null
        };
    }
}

