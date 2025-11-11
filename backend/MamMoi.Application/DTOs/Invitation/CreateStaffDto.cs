using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Invitation;

/// <summary>
/// DTO để Farmer tạo tài khoản Staff và add vào vườn
/// </summary>
public class CreateStaffDto
{
    /// <summary>
    /// Email của Staff
    /// </summary>
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [MaxLength(100, ErrorMessage = "Email must not exceed 100 characters")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Tên đầy đủ của Staff
    /// </summary>
    [Required(ErrorMessage = "Full name is required")]
    [MaxLength(100, ErrorMessage = "Full name must not exceed 100 characters")]
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Số điện thoại (optional)
    /// </summary>
    [MaxLength(20, ErrorMessage = "Phone must not exceed 20 characters")]
    public string? Phone { get; set; }

    /// <summary>
    /// Địa chỉ (optional)
    /// </summary>
    [MaxLength(255, ErrorMessage = "Address must not exceed 255 characters")]
    public string? Address { get; set; }
}