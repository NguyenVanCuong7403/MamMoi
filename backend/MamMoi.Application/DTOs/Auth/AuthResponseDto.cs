namespace MamMoi.Application.DTOs.Auth;

/// <summary>
/// DTO trả về sau khi đăng ký hoặc đăng nhập thành công.
/// Chứa thông tin user và tokens (nếu đã verify).
/// </summary>
public class AuthResponseDto
{
    /// <summary>
    /// Trạng thái thành công hay thất bại
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// ID của user
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Email của user
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Tên đầy đủ
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// User đã verify email chưa
    /// </summary>
    public bool IsEmailVerified { get; set; }

    /// <summary>
    /// Access token (JWT) - chỉ có khi đã verify email
    /// </summary>
    public string? AccessToken { get; set; }

    /// <summary>
    /// Refresh token - để làm mới access token khi hết hạn
    /// </summary>
    public string? RefreshToken { get; set; }

    /// <summary>
    /// Thời gian token hết hạn (UTC)
    /// </summary>
    public DateTime? TokenExpiresAt { get; set; }

    /// <summary>
    /// Message thông báo cho user
    /// </summary>
    public string Message { get; set; } = string.Empty;
}
