namespace MamMoi.Application.DTOs.Notification;

/// <summary>
/// DTO for admin to broadcast notification to all users
/// </summary>
public class BroadcastNotificationDto
{
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string? NotificationType { get; set; }
    public string Priority { get; set; } = "Normal";
    public string? Category { get; set; }
    public string? ActionUrl { get; set; }
    public string? ActionLabel { get; set; }
    public string? ImageUrl { get; set; }
    public string? IconName { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

