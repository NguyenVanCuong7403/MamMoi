using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class Tree
{
    public int TreeId { get; set; }

    public int GardenId { get; set; }

    public int UserId { get; set; }

    public int TreeTypeId { get; set; }

    public int StageId { get; set; }

    public string? TreeCode { get; set; }

    public string? TreeName { get; set; }

    public DateOnly? PlantDate { get; set; }

    public decimal? HeightMeters { get; set; }

    public string HealthStatus { get; set; } = null!;

    public decimal? HealthScore { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public string? Location { get; set; }

    public DateTime? LastWateredAt { get; set; }

    public DateTime? NextWateringAt { get; set; }

    public int? WateringFrequencyDays { get; set; }

    public decimal? LastWateringAmountLiters { get; set; }

    public int? MinWateringIntervalDays { get; set; }

    public int? MaxWateringIntervalDays { get; set; }

    public DateTime? LastFertilizedAt { get; set; }

    public DateTime? NextFertilizingAt { get; set; }

    public int? FertilizingFrequencyDays { get; set; }

    public string? LastFertilizerType { get; set; }

    public decimal? LastFertilizerAmountGrams { get; set; }

    public int? GardenSoilId { get; set; }

    public bool? IsActive { get; set; }

    public bool? IsFruiting { get; set; }

    public DateOnly? ExpectedHarvestDate { get; set; }

    public DateOnly? LastHarvestDate { get; set; }

    public decimal? TotalHarvestedKg { get; set; }

    public decimal? AverageYieldPerYearKg { get; set; }

    public string? Notes { get; set; }

    public string? QrcodeUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();

    public virtual ICollection<Aiconsultation> Aiconsultations { get; set; } = new List<Aiconsultation>();

    public virtual ICollection<Airecommendation> Airecommendations { get; set; } = new List<Airecommendation>();

    public virtual ICollection<CareSchedule> CareSchedules { get; set; } = new List<CareSchedule>();

    public virtual Garden Garden { get; set; } = null!;

    public virtual GardenSoil? GardenSoil { get; set; }

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual TreeGrowthStage Stage { get; set; } = null!;

    public virtual ICollection<SupportRequest> SupportRequests { get; set; } = new List<SupportRequest>();

    public virtual ICollection<TreeImage> TreeImages { get; set; } = new List<TreeImage>();

    public virtual TreeType TreeType { get; set; } = null!;

    public virtual User User { get; set; } = null!;

    public virtual ICollection<WeatherAlert> WeatherAlerts { get; set; } = new List<WeatherAlert>();

    public virtual ICollection<WeatherHistory> WeatherHistories { get; set; } = new List<WeatherHistory>();

    public virtual ICollection<DiseaseLibrary> Diseases { get; set; } = new List<DiseaseLibrary>();
}
