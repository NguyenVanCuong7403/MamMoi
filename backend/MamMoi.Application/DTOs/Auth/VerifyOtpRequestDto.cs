using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Auth;

/// <summary>
/// DTO cho yêu cầu xác thực OTP.
/// Client gửi email và mã OTP để verify.
/// </summary>
public class VerifyOtpRequestDto
{
    /// <summary>
    /// Email của user cần verify
    /// </summary>
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Mã OTP (6 số) user nhận được qua email
    /// </summary>
    [Required(ErrorMessage = "OTP code is required")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be exactly 6 digits")]
    public string OtpCode { get; set; } = string.Empty;
}
