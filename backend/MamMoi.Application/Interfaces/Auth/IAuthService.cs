using MamMoi.Application.DTOs.Auth;

namespace MamMoi.Application.Interfaces.Auth;

/// <summary>
/// Interface cho Authentication Service.
/// Xử lý tất cả logic liên quan đến đăng ký, đăng nhập, OTP.
/// Implementation sẽ ở Infrastructure layer.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Đăng ký user mới và gửi OTP qua email
    /// </summary>
    /// <param name="request">Thông tin đăng ký</param>
    /// <returns>Response chứa thông tin user (chưa có token vì chưa verify)</returns>
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);

    /// <summary>
    /// Xác thực OTP từ email
    /// </summary>
    /// <param name="request">Email và OTP code</param>
    /// <returns>Response chứa token sau khi verify thành công</returns>
    Task<AuthResponseDto> VerifyOtpAsync(VerifyOtpRequestDto request);

    /// <summary>
    /// Gửi lại OTP mới
    /// </summary>
    /// <param name="request">Email cần gửi lại OTP</param>
    /// <returns>Response xác nhận đã gửi</returns>
    Task<AuthResponseDto> ResendOtpAsync(ResendOtpRequestDto request);

    /// <summary>
    /// Đăng nhập với email/password
    /// </summary>
    /// <param name="email">Email</param>
    /// <param name="password">Password</param>
    /// <returns>Response chứa token nếu đăng nhập thành công</returns>
    Task<AuthResponseDto> LoginAsync(string email, string password);

    /// <summary>
    /// Làm mới access token bằng refresh token
    /// </summary>
    /// <param name="refreshToken">Refresh token</param>
    /// <returns>Response chứa access token mới</returns>
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);

    /// <summary>
    /// Đăng xuất (vô hiệu hóa refresh token)
    /// </summary>
    /// <param name="userId">ID của user</param>
    Task LogoutAsync(int userId);
}
