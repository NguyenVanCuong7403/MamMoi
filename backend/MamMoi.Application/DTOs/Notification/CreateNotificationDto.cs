namespace MamMoi.Application.DTOs.Notification;

/// <summary>
/// DTO for creating a notification
/// </summary>
public class CreateNotificationDto
{
    public int UserId { get; set; }
    public int? TreeId { get; set; }
    public string Title { get; set; } = null!;
    public string? Message { get; set; }
    public string? NotificationType { get; set; }
    public string Priority { get; set; } = "Normal";
    public string? Category { get; set; }
    public string? ActionUrl { get; set; }
    public string? ActionLabel { get; set; }
    public bool RequiresAction { get; set; }
    public DateTime? ActionDeadline { get; set; }
    public string? RelatedEntityType { get; set; }
    public int? RelatedEntityId { get; set; }
    public string? ImageUrl { get; set; }
    public string? IconName { get; set; }
}

