using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Auth;

/// <summary>
/// DTO cho yêu cầu đăng ký tài khoản mới.
/// Client gửi thông tin này để tạo user.
/// </summary>
public class RegisterRequestDto
{
    /// <summary>
    /// Email của user - phải unique và hợp lệ
    /// </summary>
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Mật khẩu - tối thiểu 6 ký tự
    /// </summary>
    [Required(ErrorMessage = "Password is required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Tên đầy đủ của user
    /// </summary>
    [Required(ErrorMessage = "Full name is required")]
    [MinLength(2, ErrorMessage = "Full name must be at least 2 characters")]
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Số điện thoại (optional)
    /// </summary>
    [Phone(ErrorMessage = "Invalid phone number format")]
    public string? Phone { get; set; }
}
