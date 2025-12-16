using System;
using MamMoi.Application.DTOs.Notification;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MamMoi.Infrastructure.Services.Notifications;

/// <summary>
/// Notification Service
/// </summary>
public class NotificationService : INotificationService
{
    private readonly MamMoiDbContext _dbContext;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        MamMoiDbContext dbContext,
        ILogger<NotificationService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto dto)
    {
        // Validate user exists
        var user = await _dbContext.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == dto.UserId);
        if (user == null)
            throw new ArgumentException("User not found", nameof(dto.UserId));

        // Validate tree if provided
        if (dto.TreeId.HasValue)
        {
            var tree = await _dbContext.Trees.FindAsync(dto.TreeId.Value);
            if (tree == null)
                throw new ArgumentException("Tree not found", nameof(dto.TreeId));
        }

        var notification = new Notification
        {
            UserId = dto.UserId,
            TreeId = dto.TreeId,
            Title = dto.Title.Trim(),
            Message = dto.Message?.Trim(),
            NotificationType = dto.NotificationType?.Trim(),
            Priority = dto.Priority ?? "Normal",
            Category = dto.Category?.Trim(),
            ActionUrl = dto.ActionUrl?.Trim(),
            ActionLabel = dto.ActionLabel?.Trim(),
            RequiresAction = dto.RequiresAction,
            ActionDeadline = dto.ActionDeadline,
            RelatedEntityType = dto.RelatedEntityType?.Trim(),
            RelatedEntityId = dto.RelatedEntityId,
            ImageUrl = dto.ImageUrl?.Trim(),
            IconName = dto.IconName?.Trim(),
            Status = "Sent",
            IsRead = false,
            SentAt = DateTime.UtcNow,
            DeliveredAt = DateTime.UtcNow
        };

        _dbContext.Notifications.Add(notification);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Notification created: {NotificationId} for user {UserId}", notification.NotificationId, dto.UserId);

        return await GetNotificationByIdAsync(notification.NotificationId, dto.UserId) ??
            throw new InvalidOperationException("Failed to retrieve created notification");
    }

    public async Task<(List<NotificationListItemDto> notifications, int totalCount)> GetUserNotificationsAsync(
        int userId,
        int page = 1,
        int pageSize = 20,
        bool? isRead = null,
        string? notificationType = null)
    {
        var query = _dbContext.Notifications
            .Where(n => n.UserId == userId)
            .AsQueryable();

        if (isRead.HasValue)
            query = query.Where(n => n.IsRead == isRead.Value);

        if (!string.IsNullOrWhiteSpace(notificationType))
            query = query.Where(n => n.NotificationType == notificationType);

        var totalCount = await query.CountAsync();

        var notifications = await query
            .OrderByDescending(n => n.SentAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationListItemDto
            {
                NotificationId = n.NotificationId,
                Title = n.Title,
                Message = n.Message,
                NotificationType = n.NotificationType,
                Priority = n.Priority,
                Category = n.Category,
                SentAt = n.SentAt,
                IsRead = n.IsRead ?? false,
                ReadAt = n.ReadAt,
                ImageUrl = n.ImageUrl,
                IconName = n.IconName,
                ActionUrl = n.ActionUrl,
                ActionLabel = n.ActionLabel,
                RequiresAction = n.RequiresAction
            })
            .ToListAsync();

        return (notifications, totalCount);
    }

    public async Task<NotificationDto?> GetNotificationByIdAsync(int notificationId, int userId)
    {
        var notification = await _dbContext.Notifications
            .Include(n => n.User)
            .Include(n => n.Tree)
            .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);

        if (notification == null)
            return null;

        return new NotificationDto
        {
            NotificationId = notification.NotificationId,
            UserId = notification.UserId,
            UserFullName = notification.User.FullName,
            TreeId = notification.TreeId,
            TreeName = notification.Tree?.TreeName,
            Title = notification.Title,
            Message = notification.Message,
            NotificationType = notification.NotificationType,
            Priority = notification.Priority,
            Category = notification.Category,
            ActionUrl = notification.ActionUrl,
            ActionLabel = notification.ActionLabel,
            RequiresAction = notification.RequiresAction,
            ActionDeadline = notification.ActionDeadline,
            SentAt = notification.SentAt,
            Status = notification.Status,
            IsRead = notification.IsRead ?? false,
            ReadAt = notification.ReadAt,
            RelatedEntityType = notification.RelatedEntityType,
            RelatedEntityId = notification.RelatedEntityId,
            ImageUrl = notification.ImageUrl,
            IconName = notification.IconName
        };
    }

    public async Task<bool> MarkNotificationsAsReadAsync(int userId, List<int> notificationIds)
    {
        var notifications = await _dbContext.Notifications
            .Where(n => n.UserId == userId && notificationIds.Contains(n.NotificationId))
            .ToListAsync();

        if (!notifications.Any())
            return false;

        var now = DateTime.UtcNow;
        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = now;
        }

        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("Marked {Count} notifications as read for user {UserId}", notifications.Count, userId);

        return true;
    }

    public async Task<bool> MarkAllNotificationsAsReadAsync(int userId)
    {
        var notifications = await _dbContext.Notifications
            .Where(n => n.UserId == userId && (n.IsRead == null || n.IsRead == false))
            .ToListAsync();

        if (!notifications.Any())
            return false;

        var now = DateTime.UtcNow;
        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = now;
        }

        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("Marked all notifications as read for user {UserId}", userId);

        return true;
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _dbContext.Notifications
            .CountAsync(n => n.UserId == userId && (n.IsRead == null || n.IsRead == false));
    }

    public async Task<int> BroadcastNotificationAsync(BroadcastNotificationDto dto)
    {
        // Validate required fields
        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException("Title is required", nameof(dto));

        if (string.IsNullOrWhiteSpace(dto.Message))
            throw new ArgumentException("Message is required", nameof(dto));

        // Get all active users
        var users = await _dbContext.Users
            .Where(u => u.IsActive)
            .Select(u => u.UserId)
            .ToListAsync();

        if (!users.Any())
        {
            _logger.LogWarning("No active users found for broadcast notification");
            return 0;
        }

        var notifications = users.Select(userId => new Notification
        {
            UserId = userId,
            Title = dto.Title.Trim(),
            Message = dto.Message.Trim(),
            NotificationType = dto.NotificationType ?? "Broadcast",
            Priority = dto.Priority ?? "Normal",
            Category = dto.Category?.Trim(),
            ActionUrl = dto.ActionUrl?.Trim(),
            ActionLabel = dto.ActionLabel?.Trim(),
            ImageUrl = dto.ImageUrl?.Trim(),
            IconName = dto.IconName?.Trim(),
            Status = "Sent",
            IsRead = false,
            SentAt = DateTime.UtcNow,
            DeliveredAt = DateTime.UtcNow,
            ExpiresAt = dto.ExpiresAt,
            GroupId = $"Broadcast-{DateTime.UtcNow:yyyyMMddHHmmss}"
        }).ToList();

        _dbContext.Notifications.AddRange(notifications);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Broadcast notification sent to {Count} users with GroupId {GroupId}", notifications.Count, notifications.First().GroupId);

        return notifications.Count;
    }

    public async Task<int> SendNotificationToUsersAsync(SendNotificationToUsersDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (dto.UserIds == null || !dto.UserIds.Any())
            throw new ArgumentException("UserIds are required", nameof(dto.UserIds));

        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException("Title is required", nameof(dto.Title));

        if (string.IsNullOrWhiteSpace(dto.Message))
            throw new ArgumentException("Message is required", nameof(dto.Message));

        // Validate and get only active users that exist
        var users = await _dbContext.Users
            .Where(u => dto.UserIds.Contains(u.UserId) && u.IsActive)
            .Select(u => u.UserId)
            .ToListAsync();

        if (!users.Any())
        {
            _logger.LogWarning("No valid active users found for send-to-users notification");
            return 0;
        }

        var groupId = $"SendToUsers-{DateTime.UtcNow:yyyyMMddHHmmss}";

        var notifications = users.Select(userId => new Notification
        {
            UserId = userId,
            Title = dto.Title.Trim(),
            Message = dto.Message.Trim(),
            NotificationType = dto.NotificationType ?? "Direct",
            Priority = dto.Priority ?? "Normal",
            Category = dto.Category?.Trim(),
            ActionUrl = dto.ActionUrl?.Trim(),
            ActionLabel = dto.ActionLabel?.Trim(),
            ImageUrl = dto.ImageUrl?.Trim(),
            IconName = dto.IconName?.Trim(),
            Status = "Sent",
            IsRead = false,
            SentAt = DateTime.UtcNow,
            DeliveredAt = DateTime.UtcNow,
            ExpiresAt = dto.ExpiresAt,
            GroupId = groupId
        }).ToList();

        _dbContext.Notifications.AddRange(notifications);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Sent notification to {Count} specified users with GroupId {GroupId}", notifications.Count, groupId);

        return notifications.Count;
    }

    public async Task<bool> UpdateBroadcastNotificationAsync(string groupId, UpdateBroadcastNotificationDto dto)
    {
        if (string.IsNullOrWhiteSpace(groupId))
            throw new ArgumentException("GroupId is required", nameof(groupId));

        var notifications = await _dbContext.Notifications
            .Where(n => n.GroupId == groupId && n.NotificationType == "Broadcast")
            .ToListAsync();

        if (!notifications.Any())
            return false;

        // Prevent updating notifications that have already been sent
        if (notifications.Any(n => n.SentAt != default(DateTime)))
        {
            throw new InvalidOperationException("Cannot update notifications that have already been sent");
        }

        foreach (var notification in notifications)
        {
            if (!string.IsNullOrWhiteSpace(dto.Title))
                notification.Title = dto.Title.Trim();

            if (dto.Message != null)
                notification.Message = dto.Message.Trim();

            if (!string.IsNullOrWhiteSpace(dto.NotificationType))
                notification.NotificationType = dto.NotificationType.Trim();

            if (!string.IsNullOrWhiteSpace(dto.Priority))
                notification.Priority = dto.Priority;

            if (dto.Category != null)
                notification.Category = dto.Category?.Trim();

            if (dto.ActionUrl != null)
                notification.ActionUrl = dto.ActionUrl?.Trim();

            if (dto.ActionLabel != null)
                notification.ActionLabel = dto.ActionLabel?.Trim();

            if (dto.ImageUrl != null)
                notification.ImageUrl = dto.ImageUrl?.Trim();

            if (dto.IconName != null)
                notification.IconName = dto.IconName?.Trim();

            if (dto.ExpiresAt.HasValue)
                notification.ExpiresAt = dto.ExpiresAt;
        }

        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("Updated broadcast notification group {GroupId} ({Count} notifications)", groupId, notifications.Count);

        return true;
    }

    public async Task<bool> DeleteBroadcastNotificationAsync(string groupId)
    {
        if (string.IsNullOrWhiteSpace(groupId))
            throw new ArgumentException("GroupId is required", nameof(groupId));

        var notifications = await _dbContext.Notifications
            .Where(n => n.GroupId == groupId && n.NotificationType == "Broadcast")
            .ToListAsync();

        if (!notifications.Any())
            return false;

        // Check if notifications have been sent (SentAt is set)
        if (notifications.Any(n => n.SentAt != default(DateTime)))
        {
            throw new InvalidOperationException("Cannot delete notifications that have already been sent");
        }

        _dbContext.Notifications.RemoveRange(notifications);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Deleted broadcast notification group {GroupId} ({Count} notifications)", groupId, notifications.Count);

        return true;
    }

    public async Task<List<(string GroupId, DateTime SentAt, int RecipientCount, string Title, string? Message, string? NotificationType, string Priority, string? Category, string? ActionUrl, string? ActionLabel, string? ImageUrl, string? IconName, DateTime? ExpiresAt)>> GetBroadcastNotificationsAsync()
    {
        // First, get all notifications with GroupId that starts with "Broadcast-"
        var allNotifications = await _dbContext.Notifications
            .Where(n => n.GroupId != null && n.GroupId != "")
            .ToListAsync();

        _logger.LogInformation("Total notifications with GroupId: {Count}", allNotifications.Count);

        // Filter and group in memory for more flexibility
        var broadcastGroups = allNotifications
            .Where(n =>
                (!string.IsNullOrEmpty(n.GroupId) && n.GroupId.StartsWith("Broadcast-")) ||
                (n.NotificationType != null && n.NotificationType.Equals("Broadcast", StringComparison.OrdinalIgnoreCase)))
            .GroupBy(n => n.GroupId!)
            .Select(g => new
            {
                GroupId = g.Key,
                SentAt = g.Min(n => n.SentAt),
                RecipientCount = g.Count(),
                Title = g.First().Title ?? "No Title",
                Message = g.First().Message,
                NotificationType = g.First().NotificationType,
                Priority = g.First().Priority,
                Category = g.First().Category,
                ActionUrl = g.First().ActionUrl,
                ActionLabel = g.First().ActionLabel,
                ImageUrl = g.First().ImageUrl,
                IconName = g.First().IconName,
                ExpiresAt = g.First().ExpiresAt
            })
            .OrderByDescending(x => x.SentAt)
            .ToList();

        _logger.LogInformation("Broadcast notification groups found: {Count}", broadcastGroups.Count);

        return broadcastGroups.Select(b => (b.GroupId, b.SentAt, b.RecipientCount, b.Title, b.Message, b.NotificationType, b.Priority, b.Category, b.ActionUrl, b.ActionLabel, b.ImageUrl, b.IconName, b.ExpiresAt)).ToList();
    }

    public async Task<List<(int UserId, string FullName, string Email, string? Phone, bool IsRead, DateTime? ReadAt)>> GetBroadcastRecipientsAsync(string groupId)
    {
        if (string.IsNullOrWhiteSpace(groupId))
            throw new ArgumentException("GroupId is required", nameof(groupId));

        var recipients = await _dbContext.Notifications
            .Include(n => n.User)
            .Where(n => n.GroupId == groupId)
            .Select(n => new
            {
                n.UserId,
                n.User.FullName,
                n.User.Email,
                n.User.Phone,
                IsRead = n.IsRead ?? false,
                n.ReadAt
            })
            .OrderBy(r => r.FullName)
            .ToListAsync();

        _logger.LogInformation("Found {Count} recipients for broadcast notification group {GroupId}", recipients.Count, groupId);

        return recipients.Select(r => (r.UserId, r.FullName, r.Email, r.Phone, r.IsRead, r.ReadAt)).ToList();
    }

    public async Task NotifyAdminOnSupportRequestAsync(int requestId, int userId, string subject)
    {
        // Get all admin users (SystemAdmin and BusinessAdmin)
        var adminUsers = await _dbContext.Users
            .Include(u => u.Role)
            .Where(u => u.IsActive && (u.Role.RoleName == "SystemAdmin" || u.Role.RoleName == "BusinessAdmin"))
            .Select(u => u.UserId)
            .ToListAsync();

        if (!adminUsers.Any())
        {
            _logger.LogWarning("No admin users found to notify about support request {RequestId}", requestId);
            return;
        }

        // Get admin roles to set correct ActionUrl based on role
        var adminUsersWithRoles = await _dbContext.Users
            .Include(u => u.Role)
            .Where(u => u.IsActive && (u.Role.RoleName == "SystemAdmin" || u.Role.RoleName == "BusinessAdmin"))
            .Select(u => new { u.UserId, u.Role.RoleName })
            .ToListAsync();

        if (!adminUsersWithRoles.Any())
        {
            _logger.LogWarning("No admin users found to notify about support request {RequestId}", requestId);
            return;
        }

        var notifications = adminUsersWithRoles.Select(admin => new Notification
        {
            UserId = admin.UserId,
            Title = "Yêu cầu hỗ trợ mới",
            Message = $"Người dùng đã gửi yêu cầu hỗ trợ: {subject}",
            NotificationType = "SupportRequest",
            Priority = "High",
            Category = "Support",
            // Set ActionUrl to null to let frontend route based on RelatedEntityType and user role
            // Frontend will route to /admin/reports for SystemAdmin or /admin/business/reports for BusinessAdmin
            ActionUrl = null,
            ActionLabel = "Xem báo cáo",
            RelatedEntityType = "SupportRequest",
            RelatedEntityId = requestId,
            Status = "Sent",
            IsRead = false,
            SentAt = DateTime.UtcNow,
            DeliveredAt = DateTime.UtcNow,
            IconName = "alert-circle"
        }).ToList();

        _dbContext.Notifications.AddRange(notifications);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Notified {Count} admins about support request {RequestId}", notifications.Count, requestId);
    }

    public async Task NotifyUserOnSupportRequestResponseAsync(int requestId, int userId, string resolution)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = "Phản hồi yêu cầu hỗ trợ",
            Message = $"Admin đã phản hồi yêu cầu hỗ trợ của bạn: {resolution}",
            NotificationType = "SupportRequest",
            Priority = "Normal",
            Category = "Support",
            ActionUrl = $"/support-requests/{requestId}",
            ActionLabel = "Xem phản hồi",
            RelatedEntityType = "SupportRequest",
            RelatedEntityId = requestId,
            Status = "Sent",
            IsRead = false,
            SentAt = DateTime.UtcNow,
            DeliveredAt = DateTime.UtcNow,
            IconName = "message-circle"
        };

        _dbContext.Notifications.Add(notification);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Notified user {UserId} about support request response {RequestId}", userId, requestId);
    }

    public async Task NotifyUserOnSupportRequestResolvedAsync(int requestId, int userId, string? resolution)
    {
        var message = "Yêu cầu hỗ trợ của bạn đã được đánh dấu là hoàn thành.";
        if (!string.IsNullOrWhiteSpace(resolution))
        {
            message += $" {resolution}";
        }

        var notification = new Notification
        {
            UserId = userId,
            Title = "Yêu cầu hỗ trợ đã hoàn thành",
            Message = message,
            NotificationType = "SupportRequest",
            Priority = "Normal",
            Category = "Support",
            ActionUrl = $"/support-requests/{requestId}",
            ActionLabel = "Xem chi tiết",
            RelatedEntityType = "SupportRequest",
            RelatedEntityId = requestId,
            Status = "Sent",
            IsRead = false,
            SentAt = DateTime.UtcNow,
            DeliveredAt = DateTime.UtcNow,
            IconName = "check-circle"
        };

        _dbContext.Notifications.Add(notification);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Notified user {UserId} about support request resolved {RequestId}", userId, requestId);
    }

    public async Task NotifyUserOnSupportRequestClosedAsync(int requestId, int userId, string? reason)
    {
        var message = "Yêu cầu hỗ trợ của bạn đã bị đóng/từ chối.";
        if (!string.IsNullOrWhiteSpace(reason))
        {
            message += $" Lý do: {reason}";
        }

        var notification = new Notification
        {
            UserId = userId,
            Title = "Yêu cầu hỗ trợ đã bị đóng",
            Message = message,
            NotificationType = "SupportRequest",
            Priority = "Normal",
            Category = "Support",
            ActionUrl = $"/support-requests/{requestId}",
            ActionLabel = "Xem chi tiết",
            RelatedEntityType = "SupportRequest",
            RelatedEntityId = requestId,
            Status = "Sent",
            IsRead = false,
            SentAt = DateTime.UtcNow,
            DeliveredAt = DateTime.UtcNow,
            IconName = "x-circle"
        };

        _dbContext.Notifications.Add(notification);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Notified user {UserId} about support request closed {RequestId}", userId, requestId);
    }

    public async Task CheckAndSendTaskExpirationNotificationsAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var expirationDate = today.AddDays(7);

        // Find tasks that expire in 7 days and haven't been completed
        var expiringTasks = await _dbContext.CareSchedules
            .Include(c => c.Tree)
            .ThenInclude(t => t.User)
            .Where(c => c.ScheduledDate == expirationDate &&
                       (c.Status == "Pending" || c.Status == "InProgress") &&
                       (c.NotificationSent == null || c.NotificationSent == false))
            .ToListAsync();

        if (!expiringTasks.Any())
        {
            _logger.LogInformation("No expiring tasks found for notification");
            return;
        }

        var notifications = new List<Notification>();
        var now = DateTime.UtcNow;

        foreach (var task in expiringTasks)
        {
            // Check if we already sent a notification for this task today
            var existingNotification = await _dbContext.Notifications
                .Where(n => n.UserId == task.Tree.UserId &&
                           n.RelatedEntityType == "CareSchedule" &&
                           n.RelatedEntityId == task.ScheduleId &&
                           n.SentAt.Date == now.Date)
                .FirstOrDefaultAsync();

            if (existingNotification != null)
                continue;

            var notification = new Notification
            {
                UserId = task.Tree.UserId,
                TreeId = task.TreeId,
                Title = "Nhiệm vụ sắp hết hạn",
                Message = $"Nhiệm vụ '{task.TaskName}' sẽ hết hạn sau 7 ngày (ngày {task.ScheduledDate:dd/MM/yyyy})",
                NotificationType = "TaskExpiration",
                Priority = "Medium",
                Category = "Task",
                ActionUrl = $"/tasks/{task.ScheduleId}",
                ActionLabel = "Xem nhiệm vụ",
                RelatedEntityType = "CareSchedule",
                RelatedEntityId = task.ScheduleId,
                Status = "Sent",
                IsRead = false,
                SentAt = now,
                DeliveredAt = now,
                IconName = "clock"
            };

            notifications.Add(notification);

            // Mark task as notification sent
            task.NotificationSent = true;
            task.NotificationSentAt = now;
        }

        if (notifications.Any())
        {
            _dbContext.Notifications.AddRange(notifications);
            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("Sent {Count} task expiration notifications", notifications.Count);
        }
    }
}

