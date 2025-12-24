using MamMoi.Application.Interfaces;
using MamMoi.Application.Interfaces.Auth;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace MamMoi.Infrastructure.Services.CareSchedules;

/// <summary>
/// Background service that checks for overdue care schedules and sends email notifications
/// Runs daily at configured time (default: 8:00 AM)
/// </summary>
public class OverdueTaskNotificationService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<OverdueTaskNotificationService> _logger;
    private readonly IConfiguration _configuration;
    private readonly TimeSpan _checkInterval;

    public OverdueTaskNotificationService(
        IServiceProvider serviceProvider,
        ILogger<OverdueTaskNotificationService> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;

        // Read check interval from configuration (default: daily at 8:00 AM)
        // For now, we'll check every 24 hours
        _checkInterval = TimeSpan.FromHours(24);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Overdue Task Notification Service started");

        // Wait until the configured time to start (8:00 AM)
        await WaitUntilScheduledTime(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Starting overdue task check at {Time}", DateTime.UtcNow);
                await CheckAndNotifyOverdueTasksAsync();
                _logger.LogInformation("Completed overdue task check at {Time}", DateTime.UtcNow);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking overdue tasks");
            }

            // Wait for next check interval
            await Task.Delay(_checkInterval, stoppingToken);
        }
    }

    private async Task WaitUntilScheduledTime(CancellationToken stoppingToken)
    {
        var now = DateTime.Now;
        var scheduledHour = int.Parse(_configuration["EmailNotifications:OverdueTaskCheckHour"] ?? "8");
        var scheduledTime = new DateTime(now.Year, now.Month, now.Day, scheduledHour, 0, 0);

        // If scheduled time has passed today, schedule for tomorrow
        if (now > scheduledTime)
        {
            scheduledTime = scheduledTime.AddDays(1);
        }

        var delay = scheduledTime - now;
        _logger.LogInformation("Next overdue task check scheduled at {Time}", scheduledTime);

        if (delay.TotalMilliseconds > 0)
        {
            await Task.Delay(delay, stoppingToken);
        }
    }

    private async Task CheckAndNotifyOverdueTasksAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<MamMoiDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
        var smsService = scope.ServiceProvider.GetRequiredService<ISmsService>();

        try
        {
            // Get all overdue tasks (not completed and scheduled date is in the past)
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var overdueTasks = await dbContext.CareSchedules
                .Include(cs => cs.Tree)
                .ThenInclude(t => t.User)
                .Where(cs => cs.Status != "Completed" && cs.ScheduledDate < today)
                .ToListAsync();

            if (!overdueTasks.Any())
            {
                _logger.LogInformation("No overdue tasks found");
                return;
            }

            _logger.LogInformation("Found {Count} overdue tasks", overdueTasks.Count);

            // Group tasks by user
            var tasksByUser = overdueTasks
                .GroupBy(cs => cs.Tree.UserId)
                .ToList();

            foreach (var userTasks in tasksByUser)
            {
                try
                {
                    var userId = userTasks.Key;
                    var user = userTasks.First().Tree.User;

                    // Convert to OverdueTaskInfo DTOs
                    var overdueTaskInfos = userTasks.Select(cs => new Application.Interfaces.Auth.OverdueTaskInfo
                    {
                        TaskName = cs.TaskName ?? "Công việc chăm sóc",
                        TaskType = cs.TaskType ?? "Chưa phân loại",
                        ScheduledDate = cs.ScheduledDate ?? today,
                        DaysOverdue = today.DayNumber - (cs.ScheduledDate?.DayNumber ?? today.DayNumber),
                        TreeName = cs.Tree.TreeName ?? "Cây chưa đặt tên",
                        Priority = cs.Priority ?? "Normal"
                    }).ToList();

                    // Send email notification if user has email
                    if (!string.IsNullOrEmpty(user.Email))
                    {
                        await emailService.SendOverdueTaskReminderAsync(
                            user.Email,
                            user.FullName ?? user.Email,
                            overdueTaskInfos
                        );
                        _logger.LogInformation(
                            "Sent overdue task email to user {UserId} ({Email}) for {TaskCount} tasks",
                            userId, user.Email, overdueTaskInfos.Count);
                    }

                    // Send SMS notification if user has phone number
                    if (!string.IsNullOrEmpty(user.Phone))
                    {
                        try
                        {
                            await smsService.SendOverdueTaskReminderSmsAsync(
                                user.Phone,
                                user.FullName ?? "bạn",
                                overdueTaskInfos.Count
                            );
                            _logger.LogInformation(
                                "Sent overdue task SMS to user {UserId} ({Phone}) for {TaskCount} tasks",
                                userId, user.Phone, overdueTaskInfos.Count);
                        }
                        catch (Exception smsEx)
                        {
                            _logger.LogError(smsEx, "Error sending SMS to user {UserId}", userTasks.Key);
                            // Continue - email may have worked
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending notification to user {UserId}", userTasks.Key);
                    // Continue with next user
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in CheckAndNotifyOverdueTasksAsync");
            throw;
        }
    }

    public override async Task StopAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Overdue Task Notification Service is stopping");
        await base.StopAsync(stoppingToken);
    }
}
