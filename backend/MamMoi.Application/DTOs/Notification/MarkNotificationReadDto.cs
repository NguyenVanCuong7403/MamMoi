namespace MamMoi.Application.DTOs.Notification;

/// <summary>
/// DTO for marking notification as read
/// </summary>
public class MarkNotificationReadDto
{
    public List<int> NotificationIds { get; set; } = new();
}

