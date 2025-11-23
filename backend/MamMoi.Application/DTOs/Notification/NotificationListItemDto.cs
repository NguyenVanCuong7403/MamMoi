namespace MamMoi.Application.DTOs.Notification;

/// <summary>
/// DTO for notification list item
/// </summary>
public class NotificationListItemDto
{
    public int NotificationId { get; set; }
    public string Title { get; set; } = null!;
    public string? Message { get; set; }
    public string? NotificationType { get; set; }
    public string Priority { get; set; } = null!;
    public string? Category { get; set; }
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public string? ImageUrl { get; set; }
    public string? IconName { get; set; }
    public string? ActionUrl { get; set; }
    public string? ActionLabel { get; set; }
    public bool RequiresAction { get; set; }
}

