using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Auth;

/// <summary>
/// DTO cho yêu cầu xác thực OTP.
/// Client gửi email HOẶC phone và mã OTP để verify.
/// </summary>
public class VerifyOtpRequestDto : IValidatableObject
{
    /// <summary>
    /// Email của user cần verify (optional nếu có Phone)
    /// </summary>
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string? Email { get; set; }

    /// <summary>
    /// Phone của user cần verify (optional nếu có Email)
    /// </summary>
    [Phone(ErrorMessage = "Invalid phone format")]
    public string? Phone { get; set; }

    /// <summary>
    /// Mã OTP (6 số) user nhận được qua email hoặc SMS
    /// </summary>
    [Required(ErrorMessage = "OTP code is required")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be exactly 6 digits")]
    public string OtpCode { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrWhiteSpace(Email) && string.IsNullOrWhiteSpace(Phone))
        {
            yield return new ValidationResult(
                "Phải có Email hoặc Phone để xác thực OTP.",
                new[] { nameof(Email), nameof(Phone) });
        }
    }
}
