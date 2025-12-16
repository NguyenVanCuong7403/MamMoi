// Infrastructure/Models/Tree.cs
using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class Tree
{
    public int TreeId { get; set; }
    public int GardenId { get; set; }
    public int UserId { get; set; }
    public int TreeTypeId { get; set; }
    public int? VarietyId { get; set; }
    public int StageId { get; set; }

    public string? TreeCode { get; set; }
    public string? TreeName { get; set; }
    public DateOnly? PlantDate { get; set; }

    public string? Location { get; set; }
    public int? GardenSoilId { get; set; }

    public bool? IsActive { get; set; } = true;
    public bool? IsFruiting { get; set; }

    public int? preMonths { get; set; }
    // Virtual age in months used as a minimum "expected" age for lifecycle calculations
    // This is set when a user manually overrides a tree's stage so we don't modify the real age.
    public int? VirtualAgeMonths { get; set; }

    public DateOnly? ExpectedHarvestDate { get; set; }

    public bool LifecycleAutoEnabled { get; set; } = true;

    public DateTime? LifecycleAutoDisabledAt { get; set; }

    // Số chu kỳ sinh trưởng đã hoàn thành (được FE quản lý & hiển thị)
    // Mặc định = 0. Được cập nhật thông qua API /api/trees/{id}/lifecycle.
    public int CycleCount { get; set; } = 0;

    public string? Notes { get; set; }
    public string? QrcodeUrl { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // ======= Bổ sung 4 trạng thái theo thiết kế UI =======
    public string? LeafStatus { get; set; } = "Bình thường";
    public string? BranchStatus { get; set; } = "Bình thường";
    public string? FlowerStatus { get; set; } = "Bình thường";
    public string? FruitStatus { get; set; } = "Bình thường";

    // ======= Navigations =======
    public virtual Garden Garden { get; set; } = null!;
    public virtual GardenSoil? GardenSoil { get; set; }
    public virtual TreeGrowthStage Stage { get; set; } = null!;
    public virtual TreeType TreeType { get; set; } = null!;
    public virtual TreeVariety TreeVariety { get; set; } = null!;
    public virtual User User { get; set; } = null!;

    public virtual ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
    public virtual ICollection<Aiconsultation> Aiconsultations { get; set; } = new List<Aiconsultation>();
    public virtual ICollection<Airecommendation> Airecommendations { get; set; } = new List<Airecommendation>();
    public virtual ICollection<CareSchedule> CareSchedules { get; set; } = new List<CareSchedule>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public virtual ICollection<SupportRequest> SupportRequests { get; set; } = new List<SupportRequest>();
    public virtual ICollection<TreeImage> TreeImages { get; set; } = new List<TreeImage>();
    public virtual ICollection<WeatherAlert> WeatherAlerts { get; set; } = new List<WeatherAlert>();
    public virtual ICollection<WeatherHistory> WeatherHistories { get; set; } = new List<WeatherHistory>();
    public virtual ICollection<DiseaseLibrary> Diseases { get; set; } = new List<DiseaseLibrary>();
}
