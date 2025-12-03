using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Admin;

/// <summary>
/// DTO for listing users in admin panel
/// </summary>
public class AdminUserListDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string RoleName { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public int GardensCount { get; set; }
    public int TreesCount { get; set; }
    public string? PlanType { get; set; } // "seedling", "orchard", "harvest", or null for free users
    public DateTime? PlanStartDate { get; set; }
    public DateTime? PlanEndDate { get; set; }
}

/// <summary>
/// DTO for updating user by admin
/// </summary>
public class AdminUpdateUserDto
{
    [StringLength(100)]
    public string? FullName { get; set; }

    [EmailAddress]
    [StringLength(254)]
    public string? Email { get; set; }

    [StringLength(20)]
    public string? Phone { get; set; }

    [StringLength(255)]
    public string? Address { get; set; }

    [StringLength(50)]
    public string? ExperienceLevel { get; set; }

    [StringLength(10)]
    public string? PreferredLanguage { get; set; }

    public int? RoleId { get; set; }
}

/// <summary>
/// DTO for user details in admin panel
/// </summary>
public class AdminUserDetailDto
{
    public int UserId { get; set; }
    public int RoleId { get; set; }
    public string RoleName { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? ExperienceLevel { get; set; }
    public string? PreferredLanguage { get; set; }
    public string? NotificationPreferences { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public int GardensCount { get; set; }
    public int TreesCount { get; set; }
    public int SubscriptionsCount { get; set; }
    public int PaymentsCount { get; set; }
}

/// <summary>
/// DTO for updating user's subscription plan
/// </summary>
public class UpdateUserSubscriptionPlanDto
{
    /// <summary>
    /// Plan type: "seedling", "orchard", "harvest", or null/"free" for free users
    /// </summary>
    [StringLength(50)]
    public string? PlanType { get; set; }

    /// <summary>
    /// Optional start date (ISO 8601). Defaults to today when omitted.
    /// </summary>
    public DateTime? StartDate { get; set; }

    /// <summary>
    /// Optional end date (ISO 8601). When omitted we auto-calculate using plan duration.
    /// </summary>
    public DateTime? EndDate { get; set; }
}

/// <summary>
/// DTO for admin to reset user password
/// </summary>
public class AdminResetPasswordDto
{
    [Required(ErrorMessage = "New password is required")]
    [MinLength(10, ErrorMessage = "Password must be at least 10 characters")]
    public string NewPassword { get; set; } = null!;
}

