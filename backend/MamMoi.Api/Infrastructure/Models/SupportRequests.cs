using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

[Index("UserID", Name = "IX_Support_UserID")]
public partial class SupportRequests
{
    [Key]
    public int RequestID { get; set; }

    public int UserID { get; set; }

    public int? TreeID { get; set; }

    [Precision(0)]
    public DateTime RequestDate { get; set; }

    [StringLength(200)]
    public string Subject { get; set; } = null!;

    public string? Description { get; set; }

    [StringLength(50)]
    public string? Category { get; set; }

    [StringLength(20)]
    public string Priority { get; set; } = null!;

    [StringLength(50)]
    public string Status { get; set; } = null!;

    public string? Resolution { get; set; }

    [Precision(0)]
    public DateTime? ResolvedAt { get; set; }

    [Precision(0)]
    public DateTime? ClosedAt { get; set; }

    public int? SatisfactionRating { get; set; }

    [StringLength(1000)]
    public string? Feedback { get; set; }

    [Precision(0)]
    public DateTime? FeedbackDate { get; set; }

    public string? AttachmentUrls { get; set; }

    public int ResponseCount { get; set; }

    [StringLength(50)]
    public string? TicketNumber { get; set; }

    [ForeignKey("TreeID")]
    [InverseProperty("SupportRequests")]
    public virtual Trees? Tree { get; set; }

    [ForeignKey("UserID")]
    [InverseProperty("SupportRequests")]
    public virtual Users User { get; set; } = null!;
}
