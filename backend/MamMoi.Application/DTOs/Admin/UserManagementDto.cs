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

