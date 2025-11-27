using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Auth;

/// <summary>
/// DTO cho yêu cầu đăng nhập với Google OAuth
/// </summary>
public class GoogleLoginRequestDto
{
    /// <summary>
    /// Google ID token từ Google Identity Services
    /// </summary>
    [Required(ErrorMessage = "Google ID token is required")]
    public string IdToken { get; set; } = string.Empty;
}

