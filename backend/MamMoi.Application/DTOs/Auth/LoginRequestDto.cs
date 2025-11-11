using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Auth;

/// <summary>
/// DTO cho yêu cầu đăng nhập
/// </summary>
public class LoginRequestDto
{
    /// <summary>
    /// Email đăng nhập
    /// </summary>
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Mật khẩu
    /// </summary>
    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = string.Empty;
}
