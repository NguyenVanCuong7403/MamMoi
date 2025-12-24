using MamMoi.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace MamMoi.Infrastructure.Services.Sms;

/// <summary>
/// SMS Service - Supports Twilio, SpeedSMS, Vonage, and Console mode
/// </summary>
public class SmsService : ISmsService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmsService> _logger;
    private readonly HttpClient _httpClient;
    
    private readonly string _provider;
    private readonly bool _enabled;
    
    // Twilio
    private readonly string _twilioAccountSid;
    private readonly string _twilioAuthToken;
    private readonly string _twilioFromNumber;
    
    // Vonage
    private readonly string _vonageApiKey;
    private readonly string _vonageApiSecret;
    private readonly string _vonageFromName;

    public SmsService(IConfiguration configuration, ILogger<SmsService> logger, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient("SmsClient");
        
        // Load configuration
        _provider = configuration["SmsSettings:Provider"] ?? "Console";
        _enabled = bool.Parse(configuration["SmsSettings:Enabled"] ?? "false");
        
        // Twilio config
        _twilioAccountSid = configuration["SmsSettings:AccountSid"] ?? "";
        _twilioAuthToken = configuration["SmsSettings:AuthToken"] ?? "";
        _twilioFromNumber = configuration["SmsSettings:FromNumber"] ?? "";
        
        // Vonage config
        _vonageApiKey = configuration["SmsSettings:VonageApiKey"] ?? "";
        _vonageApiSecret = configuration["SmsSettings:VonageApiSecret"] ?? "";
        _vonageFromName = configuration["SmsSettings:VonageFromName"] ?? "MamMoi";
    }

    public async Task SendSmsAsync(string phoneNumber, string message)
    {
        if (!_enabled)
        {
            _logger.LogInformation("[SMS-DISABLED] Would send to {Phone}: {Message}", phoneNumber, message);
            return;
        }

        var normalizedPhone = NormalizePhoneNumber(phoneNumber);
        
        if (_provider.Equals("Console", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation("[SMS-CONSOLE] To: {Phone}, Message: {Message}", normalizedPhone, message);
            Console.WriteLine($"\n[SMS OTP] To: {normalizedPhone}\nMessage: {message}\n");
            return;
        }

        if (_provider.Equals("Twilio", StringComparison.OrdinalIgnoreCase))
        {
            await SendViaTwilioAsync(normalizedPhone, message);
            return;
        }

        if (_provider.Equals("Vonage", StringComparison.OrdinalIgnoreCase))
        {
            await SendViaVonageAsync(normalizedPhone, message);
            return;
        }

        _logger.LogWarning("Unknown SMS provider: {Provider}", _provider);
    }

    public async Task SendOtpSmsAsync(string phoneNumber, string otpCode)
    {
        var message = $"Ma xac thuc MamMoi cua ban la: {otpCode}. Ma co hieu luc trong 5 phut.";
        await SendSmsAsync(phoneNumber, message);
    }

    public async Task SendOverdueTaskReminderSmsAsync(string phoneNumber, string userName, int taskCount)
    {
        var message = $"[MamMoi] Xin chao {userName}, ban co {taskCount} cong viec cham soc cay da qua han. Hay vao ung dung de kiem tra.";
        await SendSmsAsync(phoneNumber, message);
        _logger.LogInformation("Sent overdue task SMS to {Phone} for {Count} tasks", phoneNumber, taskCount);
    }

    public async Task SendSubscriptionExpirySmsAsync(string phoneNumber, string userName, string planName, int daysUntilExpiry)
    {
        string message;
        if (daysUntilExpiry <= 0)
        {
            message = $"[MamMoi] Goi {planName} cua ban da het han. Gia han ngay de tiep tuc su dung!";
        }
        else if (daysUntilExpiry == 1)
        {
            message = $"[MamMoi] Goi {planName} cua ban se het han vao ngay mai. Gia han ngay!";
        }
        else
        {
            message = $"[MamMoi] Goi {planName} cua ban se het han trong {daysUntilExpiry} ngay.";
        }
        await SendSmsAsync(phoneNumber, message);
        _logger.LogInformation("Sent subscription expiry SMS to {Phone}, plan: {Plan}, days: {Days}", phoneNumber, planName, daysUntilExpiry);
    }

    private async Task SendViaTwilioAsync(string toPhone, string message)
    {
        try
        {
            var twilioUrl = $"https://api.twilio.com/2010-04-01/Accounts/{_twilioAccountSid}/Messages.json";
            
            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("To", toPhone),
                new KeyValuePair<string, string>("From", _twilioFromNumber),
                new KeyValuePair<string, string>("Body", message)
            });

            var authValue = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_twilioAccountSid}:{_twilioAuthToken}"));
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authValue);

            var response = await _httpClient.PostAsync(twilioUrl, content);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("SMS sent via Twilio to {Phone}", toPhone);
            }
            else
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to send SMS via Twilio. Status: {Status}, Error: {Error}", 
                    response.StatusCode, errorBody);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending SMS via Twilio to {Phone}", toPhone);
        }
    }

    private async Task SendViaVonageAsync(string toPhone, string message)
    {
        try
        {
            // Vonage SMS API
            var vonageUrl = "https://rest.nexmo.com/sms/json";
            
            // Remove + from phone number for Vonage
            var cleanPhone = toPhone.Replace("+", "");
            
            var payload = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("api_key", _vonageApiKey),
                new KeyValuePair<string, string>("api_secret", _vonageApiSecret),
                new KeyValuePair<string, string>("to", cleanPhone),
                new KeyValuePair<string, string>("from", _vonageFromName),
                new KeyValuePair<string, string>("text", message),
                new KeyValuePair<string, string>("type", "unicode") // Support Vietnamese characters
            });

            var response = await _httpClient.PostAsync(vonageUrl, payload);
            var responseBody = await response.Content.ReadAsStringAsync();
            
            // Parse Vonage response
            using var doc = JsonDocument.Parse(responseBody);
            var messages = doc.RootElement.GetProperty("messages");
            var firstMessage = messages.EnumerateArray().FirstOrDefault();
            var status = firstMessage.GetProperty("status").GetString();
            
            if (status == "0")
            {
                _logger.LogInformation("SMS sent via Vonage to {Phone}", toPhone);
            }
            else
            {
                var errorText = firstMessage.TryGetProperty("error-text", out var err) ? err.GetString() : "Unknown error";
                _logger.LogError("Failed to send SMS via Vonage. Status: {Status}, Error: {Error}", status, errorText);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending SMS via Vonage to {Phone}", toPhone);
        }
    }

    private string NormalizePhoneNumber(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return phone;
        
        phone = phone.Trim().Replace(" ", "").Replace("-", "");
        
        // Vietnamese number starting with 0 -> +84
        if (phone.StartsWith("0") && phone.Length >= 10)
        {
            phone = "+84" + phone.Substring(1);
        }
        
        if (!phone.StartsWith("+"))
        {
            phone = "+" + phone;
        }
        
        return phone;
    }
}


