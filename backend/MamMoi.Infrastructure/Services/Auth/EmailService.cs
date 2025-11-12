using MamMoi.Application.Interfaces.Auth;
using Microsoft.Extensions.Configuration;
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

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
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
        try
        {
            // Đọc config từ appsettings.json
            var smtpHost = _configuration["Email:SmtpHost"];
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var fromEmail = _configuration["Email:FromEmail"];
            var fromName = _configuration["Email:FromName"];
            var username = _configuration["Email:Username"];
            var password = _configuration["Email:Password"];

            // Tạo email message
            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail ?? "", fromName ?? "MamMoi"),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            // Cấu hình SMTP client
            using var smtpClient = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true
            };

            // Gửi email
            await smtpClient.SendMailAsync(mailMessage);
        }
        catch (Exception ex)
        {
            // Log error (có thể dùng ILogger)
            throw new InvalidOperationException($"Failed to send email to {toEmail}: {ex.Message}", ex);
        }
    }
}
