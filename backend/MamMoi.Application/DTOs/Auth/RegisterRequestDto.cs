using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Auth;

/// <summary>
/// DTO cho yêu cầu đăng ký tài khoản mới.
/// Client gửi thông tin này để tạo user.
/// Có thể đăng ký bằng Email hoặc Phone (hoặc cả hai).
/// </summary>
public class RegisterRequestDto : IValidatableObject
{
    /// <summary>
    /// Email của user - optional nếu đã có Phone
    /// </summary>
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string? Email { get; set; }

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
    /// Số điện thoại - optional nếu đã có Email
    /// </summary>
    [Phone(ErrorMessage = "Invalid phone number format")]
    public string? Phone { get; set; }

    /// <summary>
    /// Custom validation: phải có ít nhất Email hoặc Phone
    /// </summary>
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrWhiteSpace(Email) && string.IsNullOrWhiteSpace(Phone))
        {
            yield return new ValidationResult(
                "Phải có ít nhất Email hoặc Số điện thoại để đăng ký.",
                new[] { nameof(Email), nameof(Phone) });
        }
    }
}
