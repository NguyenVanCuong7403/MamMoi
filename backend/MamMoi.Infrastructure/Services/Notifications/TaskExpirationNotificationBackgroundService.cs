using MamMoi.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace MamMoi.Infrastructure.Services.Notifications;

/// <summary>
/// Background service to check and send task expiration notifications daily
/// </summary>
public class TaskExpirationNotificationBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TaskExpirationNotificationBackgroundService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromDays(1); // Check once per day

    public TaskExpirationNotificationBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<TaskExpirationNotificationBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Task Expiration Notification Background Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Create a scope to get scoped services
                using var scope = _serviceProvider.CreateScope();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                _logger.LogInformation("Checking for expiring tasks...");
                await notificationService.CheckAndSendTaskExpirationNotificationsAsync();

                _logger.LogInformation("Task expiration check completed. Next check in 24 hours.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in task expiration notification background service");
            }

            // Wait for the check interval before next execution
            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("Task Expiration Notification Background Service stopped");
    }
}

