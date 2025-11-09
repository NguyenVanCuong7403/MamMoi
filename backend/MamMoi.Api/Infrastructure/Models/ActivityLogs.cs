using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

public partial class ActivityLogs
{
    [Key]
    public int LogID { get; set; }

    public int UserID { get; set; }

    public int? TreeID { get; set; }

    [StringLength(50)]
    public string ActivityType { get; set; } = null!;

    [StringLength(500)]
    public string? ActivityDescription { get; set; }

    [StringLength(50)]
    public string? EntityType { get; set; }

    public int? EntityID { get; set; }

    public string? ActionData { get; set; }

    public string? OldValue { get; set; }

    public string? NewValue { get; set; }

    [StringLength(500)]
    public string? UserAgent { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("TreeID")]
    [InverseProperty("ActivityLogs")]
    public virtual Trees? Tree { get; set; }

    [ForeignKey("UserID")]
    [InverseProperty("ActivityLogs")]
    public virtual Users User { get; set; } = null!;
}
