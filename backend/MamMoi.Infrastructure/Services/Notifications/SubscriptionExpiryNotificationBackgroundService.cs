using MamMoi.Application.DTOs.Notification;
using MamMoi.Application.Interfaces;
using MamMoi.Application.Interfaces.Auth;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace MamMoi.Infrastructure.Services.Notifications;

/// <summary>
/// Background service to check and send subscription expiry notifications daily
/// Sends notifications for subscriptions that are expiring soon or have already expired
/// </summary>
public class SubscriptionExpiryNotificationBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SubscriptionExpiryNotificationBackgroundService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromDays(1); // Check once per day
    private const int WARNING_DAYS = 7; // Send warning 7 days before expiry

    public SubscriptionExpiryNotificationBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<SubscriptionExpiryNotificationBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Subscription Expiry Notification Background Service started");

        // Wait a bit before first execution to allow the application to fully start
        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndSendExpiryNotificationsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in subscription expiry notification background service");
            }

            // Wait for the check interval before next execution
            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("Subscription Expiry Notification Background Service stopped");
    }

    private async Task CheckAndSendExpiryNotificationsAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<MamMoiDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
        var smsService = scope.ServiceProvider.GetRequiredService<ISmsService>();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        _logger.LogInformation("Checking for expiring subscriptions...");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var warningDate = today.AddDays(WARNING_DAYS);

        // Find subscriptions that are:
        // 1. Active status
        // 2. Have an end date
        // 3. End date is within warning period OR already expired
        var expiringSubscriptions = await dbContext.Subscriptions
            .Include(s => s.User)
            .Where(s => s.Status == "Active" && 
                       s.EndDate.HasValue && 
                       s.EndDate.Value <= warningDate)
            .ToListAsync();

        _logger.LogInformation("Found {Count} subscriptions to notify", expiringSubscriptions.Count);

        // Get frontend base URL for renewal links
        var frontendBaseUrl = configuration["EmailNotifications:FrontendBaseUrl"] ?? "http://localhost:5174";

        int successCount = 0;
        int failureCount = 0;

        foreach (var subscription in expiringSubscriptions)
        {
            try
            {
                var daysUntilExpiry = subscription.EndDate!.Value.DayNumber - today.DayNumber;
                
                // Lookup PlanId from SubscriptionPlans using PlanName
                var plan = await dbContext.SubscriptionPlans
                    .FirstOrDefaultAsync(p => p.PlanName == subscription.PlanName && p.IsActive);
                var planId = plan?.PlanId;

                // Build expiry message for notification
                string expiryMessage;
                if (daysUntilExpiry > 0)
                    expiryMessage = $"sẽ hết hạn trong {daysUntilExpiry} ngày";
                else if (daysUntilExpiry == 0)
                    expiryMessage = "hết hạn hôm nay";
                else
                    expiryMessage = $"đã hết hạn {Math.Abs(daysUntilExpiry)} ngày trước";

                // Send notification email with planId for dynamic renewal link
                if (!string.IsNullOrEmpty(subscription.User.Email))
                {
                    await emailService.SendSubscriptionExpiryNotificationAsync(
                        subscription.User.Email,
                        subscription.User.FullName ?? subscription.User.Email,
                        subscription.PlanName,
                        subscription.EndDate.Value,
                        daysUntilExpiry,
                        planId
                    );
                }

                // Send SMS notification if user has phone
                if (!string.IsNullOrEmpty(subscription.User.Phone))
                {
                    try
                    {
                        await smsService.SendSubscriptionExpirySmsAsync(
                            subscription.User.Phone,
                            subscription.User.FullName ?? "bạn",
                            subscription.PlanName,
                            daysUntilExpiry
                        );
                        _logger.LogInformation(
                            "Sent subscription expiry SMS to {Phone} for plan {PlanName}",
                            subscription.User.Phone,
                            subscription.PlanName
                        );
                    }
                    catch (Exception smsEx)
                    {
                        _logger.LogError(smsEx, "Error sending subscription expiry SMS to user {UserId}", subscription.User.UserId);
                        // Continue - email may have worked
                    }
                }

                // Build renewal link for in-app notification
                var renewalLink = planId.HasValue 
                    ? $"{frontendBaseUrl}/checkout?planId={planId}" 
                    : $"{frontendBaseUrl}/price";

                // Create in-app notification
                await notificationService.CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = subscription.User.UserId,
                    Title = daysUntilExpiry < 0 ? "Gói dịch vụ đã hết hạn" : "Gói dịch vụ sắp hết hạn",
                    Message = $"Gói {subscription.PlanName} {expiryMessage}. Gia hạn ngay để tiếp tục sử dụng!",
                    NotificationType = "SubscriptionExpiry",
                    Priority = daysUntilExpiry < 0 ? "Critical" : "High",
                    Category = "Subscription",
                    ActionUrl = renewalLink,
                    ActionLabel = "Gia hạn ngay",
                    RequiresAction = true,
                    RelatedEntityType = "Subscription",
                    RelatedEntityId = subscription.SubscriptionId,
                    IconName = "alert-triangle"
                });

                // Update subscription status to "Expired" if it has already expired
                if (daysUntilExpiry < 0 && subscription.Status == "Active")
                {
                    subscription.Status = "Expired";
                    _logger.LogInformation(
                        "Updated subscription {SubscriptionId} status to Expired (User: {UserEmail}, Plan: {PlanName})",
                        subscription.SubscriptionId,
                        subscription.User.Email,
                        subscription.PlanName
                    );
                }

                successCount++;
                _logger.LogInformation(
                    "Sent expiry notification (email + in-app) to {Email} for subscription {SubscriptionId} (Plan: {PlanName}, Days until expiry: {Days})",
                    subscription.User.Email,
                    subscription.SubscriptionId,
                    subscription.PlanName,
                    daysUntilExpiry
                );
            }
            catch (Exception ex)
            {
                failureCount++;
                _logger.LogError(
                    ex,
                    "Failed to send expiry notification for subscription {SubscriptionId} (User: {UserEmail})",
                    subscription.SubscriptionId,
                    subscription.User.Email
                );
            }
        }

        // Save any status updates
        if (expiringSubscriptions.Any(s => s.Status == "Expired"))
        {
            await dbContext.SaveChangesAsync();
        }

        _logger.LogInformation(
            "Subscription expiry check completed. Success: {Success}, Failures: {Failures}. Next check in 24 hours.",
            successCount,
            failureCount
        );
    }
}
