namespace MamMoi.Application.DTOs.Notification;

/// <summary>
/// DTO for updating a broadcast notification
/// </summary>
public class UpdateBroadcastNotificationDto
{
    public string? Title { get; set; }
    public string? Message { get; set; }
    public string? NotificationType { get; set; }
    public string? Priority { get; set; }
    public string? Category { get; set; }
    public string? ActionUrl { get; set; }
    public string? ActionLabel { get; set; }
    public string? ImageUrl { get; set; }
    public string? IconName { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

