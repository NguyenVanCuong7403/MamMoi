using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class TreeImage
{
    public int ImageId { get; set; }

    public int TreeId { get; set; }

    public string? ImageUrl { get; set; }

    public string? ThumbnailUrl { get; set; }

    public string? ImageType { get; set; }

    public DateTime? UploadedAt { get; set; }

    public DateTime? CapturedAt { get; set; }

    public string? Description { get; set; }

    public string? Tags { get; set; }

    public string? AianalysisStatus { get; set; }

    public string? AianalysisResult { get; set; }

    public DateTime? ProcessedAt { get; set; }

    public decimal? AnalysisConfidence { get; set; }

    public string? DetectedIssues { get; set; }

    public decimal? HealthScore { get; set; }

    public string? HealthStatus { get; set; }

    public string? DiseaseName { get; set; }

    public string? DiseaseScientificName { get; set; }

    public string? DiseaseSymptoms { get; set; }

    public string? DiseaseSeverity { get; set; }

    public decimal? DiseaseConfidence { get; set; }

    public string? AffectedArea { get; set; }

    public string? Treatment { get; set; }

    public string? TreatmentPriority { get; set; }

    public DateTime? DetectedAt { get; set; }

    public bool? IsTreated { get; set; }

    public DateTime? TreatmentStartAt { get; set; }

    public DateTime? TreatmentEndAt { get; set; }

    public string? TreatmentNotes { get; set; }

    public long? FileSizeBytes { get; set; }

    public string? Resolution { get; set; }

    public string? ExifData { get; set; }

    public bool? IsPublic { get; set; }

    public int? ViewCount { get; set; }

    public virtual Tree Tree { get; set; } = null!;
}
