using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

[Index("GardenID", Name = "IX_Trees_GardenID")]
[Index("StageID", Name = "IX_Trees_StageID")]
[Index("TreeTypeID", Name = "IX_Trees_TreeTypeID")]
[Index("UserID", Name = "IX_Trees_UserID")]
public partial class Trees
{
    [Key]
    public int TreeID { get; set; }

    public int GardenID { get; set; }

    public int UserID { get; set; }

    public int TreeTypeID { get; set; }

    public int StageID { get; set; }

    [StringLength(50)]
    public string? TreeCode { get; set; }

    [StringLength(100)]
    public string? TreeName { get; set; }

    public DateOnly? PlantDate { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? HeightMeters { get; set; }

    [StringLength(50)]
    public string HealthStatus { get; set; } = null!;

    [Column(TypeName = "decimal(4, 1)")]
    public decimal? HealthScore { get; set; }

    [Column(TypeName = "decimal(10, 8)")]
    public decimal? Latitude { get; set; }

    [Column(TypeName = "decimal(10, 8)")]
    public decimal? Longitude { get; set; }

    [StringLength(255)]
    public string? Location { get; set; }

    [Precision(0)]
    public DateTime? LastWateredAt { get; set; }

    [Precision(0)]
    public DateTime? NextWateringAt { get; set; }

    public int? WateringFrequencyDays { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? LastWateringAmountLiters { get; set; }

    public int? MinWateringIntervalDays { get; set; }

    public int? MaxWateringIntervalDays { get; set; }

    [Precision(0)]
    public DateTime? LastFertilizedAt { get; set; }

    [Precision(0)]
    public DateTime? NextFertilizingAt { get; set; }

    public int? FertilizingFrequencyDays { get; set; }

    [StringLength(100)]
    public string? LastFertilizerType { get; set; }

    [Column(TypeName = "decimal(6, 2)")]
    public decimal? LastFertilizerAmountGrams { get; set; }

    public int? GardenSoilID { get; set; }

    public bool? IsActive { get; set; }

    public bool? IsFruiting { get; set; }

    public DateOnly? ExpectedHarvestDate { get; set; }

    public DateOnly? LastHarvestDate { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal? TotalHarvestedKg { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal? AverageYieldPerYearKg { get; set; }

    public string? Notes { get; set; }

    [StringLength(500)]
    public string? QRCodeUrl { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [Precision(0)]
    public DateTime? UpdatedAt { get; set; }

    [InverseProperty("Tree")]
    public virtual ICollection<AIConsultations> AIConsultations { get; set; } = new List<AIConsultations>();

    [InverseProperty("Tree")]
    public virtual ICollection<AIRecommendations> AIRecommendations { get; set; } = new List<AIRecommendations>();

    [InverseProperty("Tree")]
    public virtual ICollection<ActivityLogs> ActivityLogs { get; set; } = new List<ActivityLogs>();

    [InverseProperty("Tree")]
    public virtual ICollection<CareSchedules> CareSchedules { get; set; } = new List<CareSchedules>();

    [ForeignKey("GardenID")]
    [InverseProperty("Trees")]
    public virtual Gardens Garden { get; set; } = null!;

    [ForeignKey("GardenSoilID")]
    [InverseProperty("Trees")]
    public virtual GardenSoils? GardenSoil { get; set; }

    [InverseProperty("Tree")]
    public virtual ICollection<Notifications> Notifications { get; set; } = new List<Notifications>();

    [ForeignKey("StageID")]
    [InverseProperty("Trees")]
    public virtual TreeGrowthStages Stage { get; set; } = null!;

    [InverseProperty("Tree")]
    public virtual ICollection<SupportRequests> SupportRequests { get; set; } = new List<SupportRequests>();

    [InverseProperty("Tree")]
    public virtual ICollection<TreeImages> TreeImages { get; set; } = new List<TreeImages>();

    [ForeignKey("TreeTypeID")]
    [InverseProperty("Trees")]
    public virtual TreeTypes TreeType { get; set; } = null!;

    [ForeignKey("UserID")]
    [InverseProperty("Trees")]
    public virtual Users User { get; set; } = null!;

    [InverseProperty("Tree")]
    public virtual ICollection<WeatherAlerts> WeatherAlerts { get; set; } = new List<WeatherAlerts>();

    [InverseProperty("Tree")]
    public virtual ICollection<WeatherHistories> WeatherHistories { get; set; } = new List<WeatherHistories>();

    [ForeignKey("TreeID")]
    [InverseProperty("Tree")]
    public virtual ICollection<DiseaseLibrary> Disease { get; set; } = new List<DiseaseLibrary>();
}
