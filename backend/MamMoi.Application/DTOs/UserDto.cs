namespace MamMoi.Application.DTOs;

/// <summary>
/// Data Transfer Object for User.
/// Used for API request/response to avoid exposing domain entities.
/// </summary>
public class UserDto
{
    public int UserId { get; set; }
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? ExperienceLevel { get; set; }
    public string? PreferredLanguage { get; set; }
    /// <summary>Account status: true = Active, false = Inactive/Banned</summary>
    public bool IsActive { get; set; }
    public DateTime LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateUserDto
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? FullName { get; set; }
}

public class UpdateUserDto
{
    public string? Email { get; set; }
    public string? FullName { get; set; }
}

/// <summary>
/// DTO for viewing user profile
/// </summary>
public class ProfileViewDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? ExperienceLevel { get; set; }
    public string? PreferredLanguage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

/// <summary>
/// DTO for editing user profile
/// </summary>
public class EditProfileDto
{
    /// <summary>Full name - max 255 characters</summary>
    public string? FullName { get; set; }

    /// <summary>Phone number - max 20 characters, must be valid format</summary>
    public string? Phone { get; set; }

    /// <summary>Address - max 500 characters</summary>
    public string? Address { get; set; }

    /// <summary>Experience level - must be one of: Beginner, Intermediate, Advanced, Expert</summary>
    public string? ExperienceLevel { get; set; }

    /// <summary>Preferred language - language code (vi, en, etc.)</summary>
    public string? PreferredLanguage { get; set; }

    /// <summary>Notification preferences - JSON format</summary>
    public string? NotificationPreferences { get; set; }
}

/// <summary>
/// DTO for avatar upload
/// </summary>
public class AvatarUploadDto
{
    /// <summary>Base64 encoded image or file upload</summary>
    public string? ImageData { get; set; }

    /// <summary>Image MIME type (image/jpeg, image/png, image/webp)</summary>
    public string? MimeType { get; set; }

    /// <summary>Maximum file size in bytes</summary>
    public long MaxFileSize { get; set; } = 5242880; // 5MB
}

/// <summary>
/// DTO for avatar upload response
/// </summary>
public class AvatarUploadResponseDto
{
    public bool Success { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Message { get; set; }
}

/// <summary>
/// DTO for ban/unban account
/// </summary>
public class BanAccountDto
{
    /// <summary>Reason for banning - required</summary>
    public string Reason { get; set; } = string.Empty;

    /// <summary>Ban duration in days (0 for permanent)</summary>
    public int DurationDays { get; set; } = 0;

    /// <summary>Admin notes</summary>
    public string? AdminNotes { get; set; }
}

/// <summary>
/// DTO for delete avatar response
/// </summary>
public class DeleteAvatarResponseDto
{
    public bool Success { get; set; }
    public string? Message { get; set; }
}
