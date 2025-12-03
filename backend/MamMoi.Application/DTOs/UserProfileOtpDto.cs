using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs;

/// <summary>
/// DTO for sending OTP to verify profile update (email/phone change)
/// </summary>
public class SendProfileOtpRequestDto
{
    /// <summary>
    /// Type of update: "email" or "phone"
    /// </summary>
    [Required(ErrorMessage = "Update type is required")]
    [RegularExpression("^(email|phone)$", ErrorMessage = "Update type must be 'email' or 'phone'")]
    public string UpdateType { get; set; } = string.Empty;

    /// <summary>
    /// New email (required if UpdateType is "email")
    /// </summary>
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string? NewEmail { get; set; }

    /// <summary>
    /// New phone (required if UpdateType is "phone")
    /// </summary>
    public string? NewPhone { get; set; }
}

/// <summary>
/// DTO for verifying OTP for profile update
/// </summary>
public class VerifyProfileOtpRequestDto
{
    /// <summary>
    /// User ID
    /// </summary>
    [Required(ErrorMessage = "User ID is required")]
    public int UserId { get; set; }

    /// <summary>
    /// Type of update: "email" or "phone"
    /// </summary>
    [Required(ErrorMessage = "Update type is required")]
    [RegularExpression("^(email|phone)$", ErrorMessage = "Update type must be 'email' or 'phone'")]
    public string UpdateType { get; set; } = string.Empty;

    /// <summary>
    /// OTP code (6 digits)
    /// </summary>
    [Required(ErrorMessage = "OTP code is required")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be exactly 6 digits")]
    public string OtpCode { get; set; } = string.Empty;

    /// <summary>
    /// New email (required if UpdateType is "email")
    /// </summary>
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string? NewEmail { get; set; }

    /// <summary>
    /// New phone (required if UpdateType is "phone")
    /// </summary>
    public string? NewPhone { get; set; }
}

