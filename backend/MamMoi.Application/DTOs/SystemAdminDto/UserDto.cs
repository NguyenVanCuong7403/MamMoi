using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.SystemAdminDto;

/// <summary>
/// Data Transfer Object for User.
/// Used for API request/response to avoid exposing domain entities.
/// </summary>
public class UserDto
{
    public Guid Id { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class UserDetailDto
{
    public Guid Id { get; set; }
    public string RoleName { get; set; } = string.Empty;
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
}

public class CreateUserDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    public int RoleId { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }
    [MaxLength(255)]
    public string? Address { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? PreferredLanguage { get; set; }
}

public class AdminUpdateUserDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    public int RoleId { get; set; }

    public bool IsActive { get; set; }
    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(255)]
    public string? Address { get; set; }
}

public class UpdateUserDto
{
    public string? Email { get; set; }
    public string? FullName { get; set; }
}

public class AdminResetPasswordDto
{
    [Required]
    [MinLength(6, ErrorMessage = "Mật khẩu mới phải có ít nhất 6 ký tự")]
    public string NewPassword { get; set; } = string.Empty;
}
