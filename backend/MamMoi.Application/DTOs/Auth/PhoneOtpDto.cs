using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Auth;

/// <summary>
/// DTO cho yêu cầu gửi OTP qua SMS
/// </summary>
public class SendPhoneOtpRequestDto
{
    /// <summary>
    /// Số điện thoại cần gửi OTP (format: 0xxx hoặc +84xxx)
    /// </summary>
    [Required(ErrorMessage = "Phone number is required")]
    [Phone(ErrorMessage = "Invalid phone number format")]
    public string Phone { get; set; } = string.Empty;
}

/// <summary>
/// DTO cho yêu cầu xác thực OTP từ SMS
/// </summary>
public class VerifyPhoneOtpRequestDto
{
    /// <summary>
    /// Số điện thoại
    /// </summary>
    [Required(ErrorMessage = "Phone number is required")]
    [Phone(ErrorMessage = "Invalid phone number format")]
    public string Phone { get; set; } = string.Empty;

    /// <summary>
    /// Mã OTP 6 số từ SMS
    /// </summary>
    [Required(ErrorMessage = "OTP code is required")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP code must be 6 digits")]
    public string OtpCode { get; set; } = string.Empty;
}
