namespace MamMoi.Application.Interfaces;

/// <summary>
/// SMS Service Interface - Gửi tin nhắn SMS
/// Hỗ trợ OTP verification và thông báo
/// </summary>
public interface ISmsService
{
    /// <summary>
    /// Gửi tin nhắn SMS generic
    /// </summary>
    /// <param name="phoneNumber">Số điện thoại (format: +84xxxxxxxxx)</param>
    /// <param name="message">Nội dung tin nhắn</param>
    Task SendSmsAsync(string phoneNumber, string message);

    /// <summary>
    /// Gửi OTP qua SMS cho việc xác thực số điện thoại
    /// </summary>
    /// <param name="phoneNumber">Số điện thoại</param>
    /// <param name="otpCode">Mã OTP 6 số</param>
    Task SendOtpSmsAsync(string phoneNumber, string otpCode);

    /// <summary>
    /// Gửi thông báo nhắc nhở công việc quá hạn
    /// </summary>
    Task SendOverdueTaskReminderSmsAsync(string phoneNumber, string userName, int taskCount);

    /// <summary>
    /// Gửi thông báo gói subscription sắp hết hạn
    /// </summary>
    Task SendSubscriptionExpirySmsAsync(string phoneNumber, string userName, string planName, int daysUntilExpiry);
}
