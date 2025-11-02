namespace MamMoi.Application.Interfaces.Auth;

/// <summary>
/// Interface cho Email Service.
/// Xử lý việc gửi email (OTP, reset password, notifications...).
/// Implementation sẽ ở Infrastructure layer.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Gửi email chứa OTP code
    /// </summary>
    /// <param name="toEmail">Email người nhận</param>
    /// <param name="userName">Tên người nhận</param>
    /// <param name="otpCode">Mã OTP (6 số)</param>
    Task SendOtpEmailAsync(string toEmail, string userName, string otpCode);

    /// <summary>
    /// Gửi email chào mừng sau khi verify thành công
    /// </summary>
    /// <param name="toEmail">Email người nhận</param>
    /// <param name="userName">Tên người nhận</param>
    Task SendWelcomeEmailAsync(string toEmail, string userName);

    /// <summary>
    /// Gửi email reset password
    /// </summary>
    /// <param name="toEmail">Email người nhận</param>
    /// <param name="userName">Tên người nhận</param>
    /// <param name="resetToken">Token để reset password</param>
    Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetToken);
}
