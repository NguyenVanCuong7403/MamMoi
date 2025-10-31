using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class Notification
{
    public int NotificationId { get; set; }

    public int UserId { get; set; }

    public int? TreeId { get; set; }

    public string Title { get; set; } = null!;

    public string? Message { get; set; }

    public string? NotificationType { get; set; }

    public string Priority { get; set; } = null!;

    public string? Category { get; set; }

    public string? ActionUrl { get; set; }

    public string? ActionLabel { get; set; }

    public string? ActionData { get; set; }

    public bool RequiresAction { get; set; }

    public DateTime? ActionDeadline { get; set; }

    public DateTime SentAt { get; set; }

    public string? DeliveryMethod { get; set; }

    public string Status { get; set; } = null!;

    public bool? IsRead { get; set; }

    public DateTime? ReadAt { get; set; }

    public DateTime? DeliveredAt { get; set; }

    public DateTime? ReminderTime { get; set; }

    public bool IsReminder { get; set; }

    public bool ReminderSent { get; set; }

    public string? RelatedEntityType { get; set; }

    public int? RelatedEntityId { get; set; }

    public string? GroupId { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public string? ImageUrl { get; set; }

    public string? IconName { get; set; }

    public virtual Tree? Tree { get; set; }

    public virtual User User { get; set; } = null!;
}
