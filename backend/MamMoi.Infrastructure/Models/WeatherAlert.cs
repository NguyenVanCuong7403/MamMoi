using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class WeatherAlert
{
    public int AlertId { get; set; }

    public int UserId { get; set; }

    public int TreeId { get; set; }

    public string? AlertType { get; set; }

    public string? Severity { get; set; }

    public string? Title { get; set; }

    public string? Message { get; set; }

    public string? DetailedDescription { get; set; }

    public string? ActionRequired { get; set; }

    public int? ActionPriority { get; set; }

    public DateTime? ActionDeadline { get; set; }

    public string? EstimatedDamageLevel { get; set; }

    public string? ImpactLevel { get; set; }

    public int? AffectedTreeCount { get; set; }

    public string? AffectedGrowthStages { get; set; }

    public decimal? VulnerabilityScore { get; set; }

    public DateTime? AlertStartAt { get; set; }

    public DateTime? AlertEndAt { get; set; }

    public DateTime? PeakTime { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public string Status { get; set; } = null!;

    public bool? IsAcknowledged { get; set; }

    public DateTime? AcknowledgedAt { get; set; }

    public string? UserAction { get; set; }

    public DateTime? ActionCompletedAt { get; set; }

    public string? WeatherApisource { get; set; }

    public decimal? ConfidenceLevel { get; set; }

    public string? RelatedWeatherIds { get; set; }

    public virtual Tree Tree { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
