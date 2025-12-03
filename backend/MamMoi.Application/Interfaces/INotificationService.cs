using MamMoi.Application.DTOs.Notification;

namespace MamMoi.Application.Interfaces;

/// <summary>
/// Interface for Notification Service
/// </summary>
public interface INotificationService
{
    /// <summary>
    /// Create a notification for a specific user
    /// </summary>
    Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto dto);

    /// <summary>
    /// Get user's notifications with pagination
    /// </summary>
    Task<(List<NotificationListItemDto> notifications, int totalCount)> GetUserNotificationsAsync(
        int userId,
        int page = 1,
        int pageSize = 20,
        bool? isRead = null,
        string? notificationType = null);

    /// <summary>
    /// Get notification by ID
    /// </summary>
    Task<NotificationDto?> GetNotificationByIdAsync(int notificationId, int userId);

    /// <summary>
    /// Mark notifications as read
    /// </summary>
    Task<bool> MarkNotificationsAsReadAsync(int userId, List<int> notificationIds);

    /// <summary>
    /// Mark all user notifications as read
    /// </summary>
    Task<bool> MarkAllNotificationsAsReadAsync(int userId);

    /// <summary>
    /// Get unread notification count for user
    /// </summary>
    Task<int> GetUnreadCountAsync(int userId);

    /// <summary>
    /// Broadcast notification to all users (SystemAdmin only)
    /// </summary>
    Task<int> BroadcastNotificationAsync(BroadcastNotificationDto dto);

    /// <summary>
    /// Update broadcast notifications by group ID (SystemAdmin only)
    /// </summary>
    Task<bool> UpdateBroadcastNotificationAsync(string groupId, UpdateBroadcastNotificationDto dto);

    /// <summary>
    /// Delete broadcast notifications by group ID (SystemAdmin only)
    /// </summary>
    Task<bool> DeleteBroadcastNotificationAsync(string groupId);

    /// <summary>
    /// Get broadcast notifications list (SystemAdmin only)
    /// </summary>
    Task<List<(string GroupId, DateTime SentAt, int RecipientCount, string Title, string? Message, string? NotificationType, string Priority, string? Category, string? ActionUrl, string? ActionLabel, string? ImageUrl, string? IconName, DateTime? ExpiresAt)>> GetBroadcastNotificationsAsync();

    /// <summary>
    /// Create notification when user sends support request (notify admin)
    /// </summary>
    Task NotifyAdminOnSupportRequestAsync(int requestId, int userId, string subject);

    /// <summary>
    /// Create notification when admin responds to support request (notify user)
    /// </summary>
    Task NotifyUserOnSupportRequestResponseAsync(int requestId, int userId, string resolution);

    /// <summary>
    /// Create notification when support request status changes to Resolved (notify user)
    /// </summary>
    Task NotifyUserOnSupportRequestResolvedAsync(int requestId, int userId, string? resolution);

    /// <summary>
    /// Create notification when support request status changes to Closed/Rejected (notify user)
    /// </summary>
    Task NotifyUserOnSupportRequestClosedAsync(int requestId, int userId, string? reason);

    /// <summary>
    /// Check and send task expiration notifications (7 days before expiration)
    /// </summary>
    Task CheckAndSendTaskExpirationNotificationsAsync();
}

