using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace MamMoi.Application.DTOs;

/// <summary>
/// DTO for Activity Log - lịch sử hoạt động của user
/// </summary>
public class ActivityLogDto
{
    public int LogId { get; set; }
    public string ActivityType { get; set; } = string.Empty;
    public string? ActivityDescription { get; set; }
    public string? UserAgent { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for viewing user profile information
/// </summary>
public class UserProfileDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? ExperienceLevel { get; set; }
    public string? PreferredLanguage { get; set; }
    public string? NotificationPreferences { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string RoleName { get; set; } = string.Empty;
}

/// <summary>
/// DTO for editing user profile with full validation
/// </summary>
public class EditUserProfileDto
{
    [Required(ErrorMessage = "Full name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 100 characters")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
    public string Email { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Invalid phone number format")]
    [StringLength(20, ErrorMessage = "Phone number cannot exceed 20 characters")]
    public string? Phone { get; set; }

    [StringLength(200, ErrorMessage = "Address cannot exceed 200 characters")]
    public string? Address { get; set; }

    [StringLength(50, ErrorMessage = "Experience level cannot exceed 50 characters")]
    [RegularExpression("^(Beginner|Intermediate|Advanced|Expert)$",
        ErrorMessage = "Experience level must be: Beginner, Intermediate, Advanced, or Expert")]
    public string? ExperienceLevel { get; set; }

    [StringLength(10, ErrorMessage = "Preferred language cannot exceed 10 characters")]
    [RegularExpression("^(en|vi|fr|es|de)$",
        ErrorMessage = "Preferred language must be: en, vi, fr, es, or de")]
    public string? PreferredLanguage { get; set; }

    [StringLength(500, ErrorMessage = "Notification preferences cannot exceed 500 characters")]
    public string? NotificationPreferences { get; set; }
}

/// <summary>
/// DTO for uploading profile avatar
/// </summary>
public class UploadAvatarDto
{
    [Required(ErrorMessage = "Image file is required")]
    public IFormFile Image { get; set; } = null!;

    [Range(0, 100, ErrorMessage = "Crop X must be between 0 and 100")]
    public int CropX { get; set; }

    [Range(0, 100, ErrorMessage = "Crop Y must be between 0 and 100")]
    public int CropY { get; set; }

    [Range(10, 100, ErrorMessage = "Crop width must be between 10 and 100")]
    public int CropWidth { get; set; }

    [Range(10, 100, ErrorMessage = "Crop height must be between 10 and 100")]
    public int CropHeight { get; set; }
}

/// <summary>
/// Response DTO for avatar upload
/// </summary>
public class AvatarUploadResponseDto
{
    public bool Success { get; set; }
    public string? ImageUrl { get; set; }
    public string? Message { get; set; }
}
