using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Auth;

/// <summary>
/// DTO cho yêu cầu gửi lại OTP.
/// Client gửi email để nhận OTP mới.
/// </summary>
public class ResendOtpRequestDto
{
    /// <summary>
    /// Email của user cần nhận lại OTP
    /// </summary>
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;
}
