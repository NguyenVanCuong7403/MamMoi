using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

public partial class TreeImages
{
    [Key]
    public int ImageID { get; set; }

    public int TreeID { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [StringLength(500)]
    public string? ThumbnailUrl { get; set; }

    [StringLength(50)]
    public string? ImageType { get; set; }

    [Precision(0)]
    public DateTime? UploadedAt { get; set; }

    [Precision(0)]
    public DateTime? CapturedAt { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(500)]
    public string? Tags { get; set; }

    [StringLength(50)]
    public string? AIAnalysisStatus { get; set; }

    public string? AIAnalysisResult { get; set; }

    [Precision(0)]
    public DateTime? ProcessedAt { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? AnalysisConfidence { get; set; }

    public string? DetectedIssues { get; set; }

    [Column(TypeName = "decimal(4, 1)")]
    public decimal? HealthScore { get; set; }

    [StringLength(50)]
    public string? HealthStatus { get; set; }

    [StringLength(100)]
    public string? DiseaseName { get; set; }

    [StringLength(150)]
    public string? DiseaseScientificName { get; set; }

    public string? DiseaseSymptoms { get; set; }

    [StringLength(50)]
    public string? DiseaseSeverity { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? DiseaseConfidence { get; set; }

    [StringLength(100)]
    public string? AffectedArea { get; set; }

    public string? Treatment { get; set; }

    [StringLength(20)]
    public string? TreatmentPriority { get; set; }

    [Precision(0)]
    public DateTime? DetectedAt { get; set; }

    public bool? IsTreated { get; set; }

    [Precision(0)]
    public DateTime? TreatmentStartAt { get; set; }

    [Precision(0)]
    public DateTime? TreatmentEndAt { get; set; }

    [StringLength(1000)]
    public string? TreatmentNotes { get; set; }

    public long? FileSizeBytes { get; set; }

    [StringLength(20)]
    public string? Resolution { get; set; }

    public string? ExifData { get; set; }

    public bool? IsPublic { get; set; }

    public int? ViewCount { get; set; }

    [ForeignKey("TreeID")]
    [InverseProperty("TreeImages")]
    public virtual Trees Tree { get; set; } = null!;
}
