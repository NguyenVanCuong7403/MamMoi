using MamMoi.Application.Interfaces.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using System.Net;
using System.Net.Mail;

namespace MamMoi.Infrastructure.Services.Auth;

/// <summary>
/// Email Service - Gửi email qua SMTP (Gmail, Outlook, MailTrap...)
/// Cấu hình SMTP trong appsettings.json
/// </summary>
public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly IHostEnvironment _hostEnvironment;
    private readonly string _templatePath;

    public EmailService(IConfiguration configuration, IHostEnvironment hostEnvironment)
    {
        _configuration = configuration;
        _hostEnvironment = hostEnvironment;
        _templatePath = Path.Combine(_hostEnvironment.ContentRootPath, "EmailTemplates");
    }

    /// <summary>
    /// Load email template from file and replace placeholders
    /// </summary>
    private string LoadTemplate(string templateName, Dictionary<string, string> replacements)
    {
        var templateFile = Path.Combine(_templatePath, templateName);
        
        if (!File.Exists(templateFile))
        {
            throw new FileNotFoundException($"Email template not found: {templateFile}");
        }

        var template = File.ReadAllText(templateFile);
        
        foreach (var replacement in replacements)
        {
            template = template.Replace($"{{{{{replacement.Key}}}}}", replacement.Value);
        }

        return template;
    }

    /// <summary>
    /// Gửi email chứa OTP code (6 số)
    /// </summary>
    public async Task SendOtpEmailAsync(string toEmail, string userName, string otpCode)
    {
        var subject = "Xác thực tài khoản MamMoi - Mã OTP của bạn";
        
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Xin chào {userName}!</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản MamMoi.</p>
                <p>Mã OTP của bạn là:</p>
                <h1 style='color: #4CAF50; font-size: 32px; letter-spacing: 5px;'>{otpCode}</h1>
                <p>Mã này có hiệu lực trong <strong>5 phút</strong>.</p>
                <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
                <br>
                <p>Trân trọng,</p>
                <p><strong>Đội ngũ MamMoi</strong></p>
            </body>
            </html>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }

    /// <summary>
    /// Gửi email chào mừng sau khi verify thành công
    /// </summary>
    public async Task SendWelcomeEmailAsync(string toEmail, string userName)
    {
        var subject = "Chào mừng bạn đến với MamMoi! 🌱";
        
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Xin chào {userName}!</h2>
                <p>Chúc mừng! Tài khoản của bạn đã được xác thực thành công.</p>
                <p>Bạn đã sẵn sàng khám phá MamMoi và quản lý khu vườn của mình.</p>
                <br>
                <p>Hãy bắt đầu ngay:</p>
                <ul>
                    <li>Tạo vườn đầu tiên của bạn</li>
                    <li>Thêm cây trồng</li>
                    <li>Theo dõi lịch chăm sóc</li>
                </ul>
                <br>
                <p>Trân trọng,</p>
                <p><strong>Đội ngũ MamMoi</strong></p>
            </body>
            </html>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }

    /// <summary>
    /// Gửi email reset password
    /// </summary>
    public async Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetToken)
    {
        var subject = "Đặt lại mật khẩu MamMoi";
        
        var body = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Xin chào {userName}!</h2>
                <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản MamMoi.</p>
                <p>Mã xác thực của bạn là:</p>
                <h1 style='color: #FF5722; font-size: 32px; letter-spacing: 5px;'>{resetToken}</h1>
                <p>Mã này có hiệu lực trong <strong>15 phút</strong>.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                <br>
                <p>Trân trọng,</p>
                <p><strong>Đội ngũ MamMoi</strong></p>
            </body>
            </html>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }

    /// <summary>
    /// Gửi email generic (public method cho invitation và các mục đích khác)
    /// </summary>
    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var smtpHost = _configuration["MailSettings:Host"];
        var smtpPort = int.Parse(_configuration["MailSettings:Port"] ?? "587");
        var fromEmail = _configuration["MailSettings:From"];
        var fromName = _configuration["MailSettings:DisplayName"];
        var username = _configuration["MailSettings:UserName"];
        var password = _configuration["MailSettings:Password"];
        var enableSsl = bool.Parse(_configuration["MailSettings:EnableSsl"] ?? "true");

        try
        {
            // Validate configuration
            if (string.IsNullOrWhiteSpace(smtpHost))
                throw new InvalidOperationException("SMTP Host is not configured in MailSettings");
            if (string.IsNullOrWhiteSpace(username))
                throw new InvalidOperationException("SMTP UserName is not configured in MailSettings");
            if (string.IsNullOrWhiteSpace(password))
                throw new InvalidOperationException("SMTP Password is not configured in MailSettings");
            if (string.IsNullOrWhiteSpace(fromEmail))
                throw new InvalidOperationException("From email is not configured in MailSettings");

            // Tạo email message
            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName ?? "MamMoi"),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            // Cấu hình SMTP client
            using var smtpClient = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = enableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false
            };

            // Gửi email
            await smtpClient.SendMailAsync(mailMessage);
        }
        catch (SmtpException smtpEx)
        {
            var errorMessage = $"SMTP Error sending email to {toEmail}";
            
            // Provide specific guidance for common Gmail errors
            if (smtpEx.Message.Contains("5.7.0") || smtpEx.Message.Contains("Authentication Required"))
            {
                errorMessage += "\n\n⚠️ Gmail Authentication Error - Please check:\n" +
                    "1. You are using a Gmail App Password (not your regular password)\n" +
                    "2. 2-Step Verification is enabled on your Gmail account\n" +
                    "3. Generate a new App Password at: https://myaccount.google.com/apppasswords\n" +
                    "4. Update the 'MailSettings:Password' in appsettings.json with the 16-character App Password\n\n" +
                    $"Current SMTP Config: Host={smtpHost}, Port={smtpPort}, SSL={enableSsl}, User={username}";
            }
            else if (smtpEx.Message.Contains("5.5.1"))
            {
                errorMessage += "\n\n⚠️ Authentication failed - Invalid username or password";
            }
            
            throw new InvalidOperationException($"{errorMessage}\n\nOriginal error: {smtpEx.Message}", smtpEx);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                $"Failed to send email to {toEmail}. " +
                $"SMTP: {smtpHost}:{smtpPort}, SSL: {enableSsl}, User: {username}\n" +
                $"Error: {ex.Message}", 
                ex);
        }
    }

    /// <summary>
    /// Gửi email nhắc nhở về các công việc chăm sóc quá hạn
    /// </summary>
    public async Task SendOverdueTaskReminderAsync(string toEmail, string userName, List<Application.Interfaces.Auth.OverdueTaskInfo> overdueTasks)
    {
        var subject = "⚠️ Nhắc nhở: Bạn có công việc chăm sóc cây quá hạn - MamMoi";
        
        var taskRows = string.Join("", overdueTasks.Select(task => $@"
                    <tr>
                        <td style='padding: 12px; border-bottom: 1px solid #eee;'>{task.TreeName}</td>
                        <td style='padding: 12px; border-bottom: 1px solid #eee;'>{task.TaskName}</td>
                        <td style='padding: 12px; border-bottom: 1px solid #eee;'>{task.TaskType}</td>
                        <td style='padding: 12px; border-bottom: 1px solid #eee;'>{task.ScheduledDate:dd/MM/yyyy}</td>
                        <td style='padding: 12px; border-bottom: 1px solid #eee; color: #e74c3c; font-weight: bold;'>{task.DaysOverdue} ngày</td>
                    </tr>"));

        var replacements = new Dictionary<string, string>
        {
            { "UserName", userName },
            { "TaskCount", overdueTasks.Count.ToString() },
            { "TaskRows", taskRows }
        };

        var body = LoadTemplate("OverdueTaskReminder.html", replacements);
        await SendEmailAsync(toEmail, subject, body);
    }

    /// <summary>
    /// Gửi email thông báo cho admin khi có support request mới
    /// </summary>
    public async Task SendSupportRequestNotificationAsync(string toEmail, string ticketNumber, string userName, string subject, string category, string priority)
    {
        var emailSubject = $"🆕 Support Request mới #{ticketNumber} - MamMoi Admin";
        
        var priorityColor = priority?.ToLower() switch
        {
            "high" => "#e74c3c",
            "urgent" => "#c0392b",
            "normal" => "#3498db",
            "low" => "#95a5a6",
            _ => "#3498db"
        };

        var replacements = new Dictionary<string, string>
        {
            { "TicketNumber", ticketNumber },
            { "UserName", userName },
            { "Subject", subject },
            { "Category", category ?? "Chưa phân loại" },
            { "Priority", priority },
            { "PriorityColor", priorityColor }
        };

        var body = LoadTemplate("SupportRequestNotification.html", replacements);
        await SendEmailAsync(toEmail, emailSubject, body);
    }

    /// <summary>
    /// Gửi email thông báo cho user khi admin trả lời support request
    /// </summary>
    public async Task SendSupportResponseNotificationAsync(string toEmail, string userName, string ticketNumber, string subject, string resolution)
    {
        var emailSubject = $"✅ Admin đã trả lời yêu cầu #{ticketNumber} - MamMoi";
        
        var replacements = new Dictionary<string, string>
        {
            { "UserName", userName },
            { "TicketNumber", ticketNumber },
            { "Subject", subject },
            { "Resolution", resolution }
        };

        var body = LoadTemplate("SupportResponseNotification.html", replacements);
        await SendEmailAsync(toEmail, emailSubject, body);
    }

    /// <summary>
    /// Gửi email hóa đơn thanh toán
    /// </summary>
    public async Task SendPaymentInvoiceAsync(string toEmail, string userName, string invoiceNumber, decimal amount, string currency, DateTime paymentDate, string paymentMethod, string planName, string transactionId)
    {
        var emailSubject = $"🧾 Hóa đơn thanh toán #{invoiceNumber} - MamMoi";
        
        var formattedAmount = currency.ToUpper() == "VND" 
            ? $"{amount:N0} ₫" 
            : $"{amount:N2} {currency}";

        var replacements = new Dictionary<string, string>
        {
            { "InvoiceNumber", invoiceNumber },
            { "PaymentDate", paymentDate.ToString("dd/MM/yyyy HH:mm") },
            { "TransactionId", transactionId },
            { "UserName", userName },
            { "PlanName", planName },
            { "PaymentMethod", paymentMethod },
            { "Amount", formattedAmount }
        };

        var body = LoadTemplate("PaymentInvoice.html", replacements);
        await SendEmailAsync(toEmail, emailSubject, body);
    }

    /// <summary>
    /// Gửi email thông báo hết hạn gói subscription
    /// </summary>
    public async Task SendSubscriptionExpiryNotificationAsync(string toEmail, string userName, string planName, DateOnly endDate, int daysUntilExpiry, int? planId = null)
    {
        var emailSubject = daysUntilExpiry > 0 
            ? $"⚠️ Gói dịch vụ {planName} sắp hết hạn - MamMoi"
            : $"⚠️ Gói dịch vụ {planName} đã hết hạn - MamMoi";

        // Determine expiry status and messages based on days remaining
        string expiryStatus, expiryMessage, statusMessage, renewalLink;
        
        if (daysUntilExpiry > 0)
        {
            expiryStatus = "sắp hết hạn";
            expiryMessage = $"sẽ hết hạn trong <strong>{daysUntilExpiry} ngày</strong>";
            statusMessage = $"<span style='color: #ffc107;'>⏰ Còn {daysUntilExpiry} ngày</span>";
        }
        else if (daysUntilExpiry == 0)
        {
            expiryStatus = "hết hạn hôm nay";
            expiryMessage = "sẽ <strong>hết hạn vào hôm nay</strong>";
            statusMessage = "<span style='color: #ff9800;'>⏰ Hết hạn hôm nay</span>";
        }
        else
        {
            var daysExpired = Math.Abs(daysUntilExpiry);
            expiryStatus = "đã hết hạn";
            expiryMessage = $"đã hết hạn <strong>{daysExpired} ngày</strong> trước";
            statusMessage = $"<span style='color: #e74c3c;'>❌ Đã hết hạn {daysExpired} ngày</span>";
        }

        // Build dynamic checkout renewal link using FrontendBaseUrl and planId
        var frontendBaseUrl = _configuration["EmailNotifications:FrontendBaseUrl"] ?? "http://localhost:5174";
        renewalLink = planId.HasValue 
            ? $"{frontendBaseUrl}/checkout?planId={planId}" 
            : $"{frontendBaseUrl}/price";

        var replacements = new Dictionary<string, string>
        {
            { "UserName", userName },
            { "PlanName", planName },
            { "EndDate", endDate.ToString("dd/MM/yyyy") },
            { "ExpiryStatus", expiryStatus },
            { "ExpiryMessage", expiryMessage },
            { "StatusMessage", statusMessage },
            { "RenewalLink", renewalLink }
        };

        var body = LoadTemplate("SubscriptionExpiry.html", replacements);
        await SendEmailAsync(toEmail, emailSubject, body);
    }
}
