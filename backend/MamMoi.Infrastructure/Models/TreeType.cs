using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class TreeType
{
    public int TreeTypeId { get; set; }

    public int SoilMasterId { get; set; }

    public string TreeTypeName { get; set; } = null!;

    public string ScientificName { get; set; } = null!;

    public string? Description { get; set; }

    public string? Category { get; set; }

    public int? AverageLifespanYears { get; set; }

    public decimal? OptimalTemperatureMin { get; set; }

    public decimal? OptimalTemperatureMax { get; set; }

    public decimal? OptimalHumidityMin { get; set; }

    public decimal? OptimalHumidityMax { get; set; }

    public string? DroughtTolerance { get; set; }

    public string? FloodTolerance { get; set; }

    public string? FrostTolerance { get; set; }

    public string? WindTolerance { get; set; }

    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; }

    public virtual SoilMaster SoilMaster { get; set; } = null!;

    public virtual ICollection<TreeGrowthStage> TreeGrowthStages { get; set; } = new List<TreeGrowthStage>();

    public virtual ICollection<Tree> Trees { get; set; } = new List<Tree>();

    public virtual ICollection<TreeVariety> TreeVarieties { get; set; } = new List<TreeVariety>();
}
