using MamMoi.Application.DTOs.Admin;
using MamMoi.Application.Interfaces.Admin;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

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
            query = query.Where(u =>
                u.FullName.Contains(searchTerm) ||
                u.Email.Contains(searchTerm) ||
                (u.Phone != null && u.Phone.Contains(searchTerm)));
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

        // Get paginated results
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new AdminUserListDto
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
                TreesCount = u.Trees.Count
            })
            .ToListAsync();

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
            var roleExists = await _dbContext.Roles.AnyAsync(r => r.RoleId == dto.RoleId.Value);
            if (!roleExists)
                throw new InvalidOperationException("Role not found");

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
}

