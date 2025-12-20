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

    /// <summary>
    /// Gửi email generic (subject và body tự do)
    /// </summary>
    /// <param name="toEmail">Email người nhận</param>
    /// <param name="subject">Tiêu đề email</param>
    /// <param name="body">Nội dung email (HTML)</param>
    Task SendEmailAsync(string toEmail, string subject, string body);

    /// <summary>
    /// Gửi email nhắc nhở về các công việc chăm sóc quá hạn
    /// </summary>
    /// <param name="toEmail">Email người nhận</param>
    /// <param name="userName">Tên người nhận</param>
    /// <param name="overdueTasks">Danh sách công việc quá hạn</param>
    Task SendOverdueTaskReminderAsync(string toEmail, string userName, List<OverdueTaskInfo> overdueTasks);

    /// <summary>
    /// Gửi email thông báo cho admin khi có support request mới
    /// </summary>
    /// <param name="toEmail">Email admin</param>
    /// <param name="ticketNumber">Số ticket</param>
    /// <param name="userName">Tên người gửi request</param>
    /// <param name="subject">Tiêu đề request</param>
    /// <param name="category">Danh mục</param>
    /// <param name="priority">Độ ưu tiên</param>
    Task SendSupportRequestNotificationAsync(string toEmail, string ticketNumber, string userName, string subject, string category, string priority);

    /// <summary>
    /// Gửi email thông báo cho user khi admin trả lời support request
    /// </summary>
    /// <param name="toEmail">Email user</param>
    /// <param name="userName">Tên user</param>
    /// <param name="ticketNumber">Số ticket</param>
    /// <param name="subject">Tiêu đề request</param>
    /// <param name="resolution">Nội dung trả lời từ admin</param>
    Task SendSupportResponseNotificationAsync(string toEmail, string userName, string ticketNumber, string subject, string resolution);

    /// <summary>
    /// Gửi email hóa đơn thanh toán
    /// </summary>
    /// <param name="toEmail">Email người nhận</param>
    /// <param name="userName">Tên người nhận</param>
    /// <param name="invoiceNumber">Số hóa đơn</param>
    /// <param name="amount">Số tiền</param>
    /// <param name="currency">Đơn vị tiền tệ</param>
    /// <param name="paymentDate">Ngày thanh toán</param>
    /// <param name="paymentMethod">Phương thức thanh toán</param>
    /// <param name="planName">Tên gói dịch vụ</param>
    /// <param name="transactionId">Mã giao dịch</param>
    Task SendPaymentInvoiceAsync(string toEmail, string userName, string invoiceNumber, decimal amount, string currency, DateTime paymentDate, string paymentMethod, string planName, string transactionId);

    /// <summary>
    /// Gửi email thông báo hết hạn gói subscription
    /// </summary>
    /// <param name="toEmail">Email người nhận</param>
    /// <param name="userName">Tên người nhận</param>
    /// <param name="planName">Tên gói subscription</param>
    /// <param name="endDate">Ngày hết hạn</param>
    /// <param name="daysUntilExpiry">Số ngày còn lại (âm nếu đã hết hạn)</param>
    /// <param name="planId">ID của gói đăng ký để tạo link gia hạn</param>
    Task SendSubscriptionExpiryNotificationAsync(string toEmail, string userName, string planName, DateOnly endDate, int daysUntilExpiry, int? planId = null);
}

/// <summary>
/// DTO cho thông tin công việc quá hạn
/// </summary>
public class OverdueTaskInfo
{
    public string TaskName { get; set; } = string.Empty;
    public string TaskType { get; set; } = string.Empty;
    public DateOnly ScheduledDate { get; set; }
    public int DaysOverdue { get; set; }
    public string TreeName { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
}
