using MamMoi.Application.DTOs.Admin;

namespace MamMoi.Application.Interfaces.Admin;

/// <summary>
/// Service interface for admin user management
/// </summary>
public interface IAdminUserService
{
    /// <summary>
    /// Get all users with pagination and filters
    /// </summary>
    Task<(List<AdminUserListDto> users, int totalCount)> GetAllUsersAsync(
        int page = 1,
        int pageSize = 20,
        string? searchTerm = null,
        int? roleId = null,
        bool? isActive = null);

    /// <summary>
    /// Get user details by ID
    /// </summary>
    Task<AdminUserDetailDto?> GetUserByIdAsync(int userId);

    /// <summary>
    /// Update user information
    /// </summary>
    Task<AdminUserDetailDto?> UpdateUserAsync(int userId, AdminUpdateUserDto dto);

    /// <summary>
    /// Activate a user account
    /// </summary>
    Task<bool> ActivateUserAsync(int userId);

    /// <summary>
    /// Deactivate a user account
    /// </summary>
    Task<bool> DeactivateUserAsync(int userId);

    /// <summary>
    /// Update user's subscription plan
    /// </summary>
    Task<bool> UpdateUserSubscriptionPlanAsync(int userId, string? planType, DateOnly? startDate, DateOnly? endDate);

    /// <summary>
    /// Reset user password (admin only)
    /// </summary>
    Task<bool> ResetUserPasswordAsync(int userId, string newPassword);
}

