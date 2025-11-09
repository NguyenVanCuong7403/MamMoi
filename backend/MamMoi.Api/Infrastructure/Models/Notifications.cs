using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

[Index("UserID", Name = "IX_Notifications_UserID")]
public partial class Notifications
{
    [Key]
    public int NotificationID { get; set; }

    public int UserID { get; set; }

    public int? TreeID { get; set; }

    [StringLength(200)]
    public string Title { get; set; } = null!;

    [StringLength(1000)]
    public string? Message { get; set; }

    [StringLength(50)]
    public string? NotificationType { get; set; }

    [StringLength(20)]
    public string Priority { get; set; } = null!;

    [StringLength(50)]
    public string? Category { get; set; }

    [StringLength(500)]
    public string? ActionUrl { get; set; }

    [StringLength(100)]
    public string? ActionLabel { get; set; }

    public string? ActionData { get; set; }

    public bool RequiresAction { get; set; }

    [Precision(0)]
    public DateTime? ActionDeadline { get; set; }

    [Precision(0)]
    public DateTime SentAt { get; set; }

    [StringLength(50)]
    public string? DeliveryMethod { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = null!;

    public bool? IsRead { get; set; }

    [Precision(0)]
    public DateTime? ReadAt { get; set; }

    [Precision(0)]
    public DateTime? DeliveredAt { get; set; }

    [Precision(0)]
    public DateTime? ReminderTime { get; set; }

    public bool IsReminder { get; set; }

    public bool ReminderSent { get; set; }

    [StringLength(50)]
    public string? RelatedEntityType { get; set; }

    public int? RelatedEntityID { get; set; }

    [StringLength(100)]
    public string? GroupID { get; set; }

    [Precision(0)]
    public DateTime? ExpiresAt { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [StringLength(50)]
    public string? IconName { get; set; }

    [ForeignKey("TreeID")]
    [InverseProperty("Notifications")]
    public virtual Trees? Tree { get; set; }

    [ForeignKey("UserID")]
    [InverseProperty("Notifications")]
    public virtual Users User { get; set; } = null!;
}
