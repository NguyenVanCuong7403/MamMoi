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

    /// <summary>
    /// Gửi mã reset password qua email
    /// </summary>
    /// <param name="request">Email cần reset password</param>
    /// <returns>Response xác nhận đã gửi</returns>
    Task<AuthResponseDto> ForgotPasswordAsync(ForgotPasswordRequestDto request);

    /// <summary>
    /// Reset password với token từ email
    /// </summary>
    /// <param name="request">Email, reset token và password mới</param>
    /// <returns>Response xác nhận đã reset thành công</returns>
    Task<AuthResponseDto> ResetPasswordAsync(ResetPasswordRequestDto request);

    /// <summary>
    /// Xác thực OTP reset password (không đổi password, chỉ verify OTP)
    /// </summary>
    /// <param name="email">Email của user</param>
    /// <param name="resetToken">Mã OTP reset password</param>
    /// <returns>Response xác nhận OTP hợp lệ</returns>
    Task<AuthResponseDto> VerifyResetOtpAsync(string email, string resetToken);

    /// <summary>
    /// Đổi password khi user đã đăng nhập
    /// </summary>
    /// <param name="userId">ID của user</param>
    /// <param name="request">Password hiện tại và password mới</param>
    /// <returns>Response xác nhận đã đổi thành công</returns>
    Task<AuthResponseDto> ChangePasswordAsync(int userId, ChangePasswordRequestDto request);

    /// <summary>
    /// Đăng nhập hoặc đăng ký với Google OAuth
    /// </summary>
    /// <param name="idToken">Google ID token</param>
    /// <returns>Response chứa token nếu đăng nhập thành công</returns>
    Task<AuthResponseDto> LoginWithGoogleAsync(string idToken);

    /// <summary>
    /// Gửi OTP qua SMS cho xác thực số điện thoại
    /// </summary>
    /// <param name="request">Số điện thoại cần gửi OTP</param>
    /// <returns>Response xác nhận đã gửi</returns>
    Task<AuthResponseDto> SendPhoneOtpAsync(SendPhoneOtpRequestDto request);

    /// <summary>
    /// Xác thực OTP từ SMS
    /// </summary>
    /// <param name="request">Số điện thoại và mã OTP</param>
    /// <returns>Response xác nhận thành công</returns>
    Task<AuthResponseDto> VerifyPhoneOtpAsync(VerifyPhoneOtpRequestDto request);

    /// <summary>
    /// Đăng nhập bằng số điện thoại và mật khẩu
    /// </summary>
    /// <param name="phone">Số điện thoại</param>
    /// <param name="password">Mật khẩu</param>
    /// <returns>Response chứa token nếu đăng nhập thành công</returns>
    Task<AuthResponseDto> LoginWithPhoneAsync(string phone, string password);
}

