using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

public partial class WeatherAlerts
{
    [Key]
    public int AlertID { get; set; }

    public int UserID { get; set; }

    public int TreeID { get; set; }

    [StringLength(50)]
    public string? AlertType { get; set; }

    [StringLength(20)]
    public string? Severity { get; set; }

    [StringLength(200)]
    public string? Title { get; set; }

    public string? Message { get; set; }

    public string? DetailedDescription { get; set; }

    public string? ActionRequired { get; set; }

    public int? ActionPriority { get; set; }

    [Precision(0)]
    public DateTime? ActionDeadline { get; set; }

    [StringLength(50)]
    public string? EstimatedDamageLevel { get; set; }

    [StringLength(50)]
    public string? ImpactLevel { get; set; }

    public int? AffectedTreeCount { get; set; }

    [StringLength(200)]
    public string? AffectedGrowthStages { get; set; }

    [Column(TypeName = "decimal(4, 1)")]
    public decimal? VulnerabilityScore { get; set; }

    [Precision(0)]
    public DateTime? AlertStartAt { get; set; }

    [Precision(0)]
    public DateTime? AlertEndAt { get; set; }

    [Precision(0)]
    public DateTime? PeakTime { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [Precision(0)]
    public DateTime? ExpiresAt { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = null!;

    public bool? IsAcknowledged { get; set; }

    [Precision(0)]
    public DateTime? AcknowledgedAt { get; set; }

    [StringLength(500)]
    public string? UserAction { get; set; }

    [Precision(0)]
    public DateTime? ActionCompletedAt { get; set; }

    [StringLength(100)]
    public string? WeatherAPISource { get; set; }

    [Column(TypeName = "decimal(4, 2)")]
    public decimal? ConfidenceLevel { get; set; }

    [StringLength(500)]
    public string? RelatedWeatherIDs { get; set; }

    [ForeignKey("TreeID")]
    [InverseProperty("WeatherAlerts")]
    public virtual Trees Tree { get; set; } = null!;

    [ForeignKey("UserID")]
    [InverseProperty("WeatherAlerts")]
    public virtual Users User { get; set; } = null!;
}
