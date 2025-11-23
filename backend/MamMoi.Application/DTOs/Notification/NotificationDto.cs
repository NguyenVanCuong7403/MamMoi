namespace MamMoi.Application.DTOs.Notification;

/// <summary>
/// DTO for notification details
/// </summary>
public class NotificationDto
{
    public int NotificationId { get; set; }
    public int UserId { get; set; }
    public string? UserFullName { get; set; }
    public int? TreeId { get; set; }
    public string? TreeName { get; set; }
    public string Title { get; set; } = null!;
    public string? Message { get; set; }
    public string? NotificationType { get; set; }
    public string Priority { get; set; } = null!;
    public string? Category { get; set; }
    public string? ActionUrl { get; set; }
    public string? ActionLabel { get; set; }
    public bool RequiresAction { get; set; }
    public DateTime? ActionDeadline { get; set; }
    public DateTime SentAt { get; set; }
    public string Status { get; set; } = null!;
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public string? RelatedEntityType { get; set; }
    public int? RelatedEntityId { get; set; }
    public string? ImageUrl { get; set; }
    public string? IconName { get; set; }
}

