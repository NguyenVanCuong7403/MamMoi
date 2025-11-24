using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Admin;

/// <summary>
/// DTO for creating a new tree type
/// </summary>
public class CreateTreeTypeDto
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "SoilMasterId is required")]
    public int SoilMasterId { get; set; }

    [Required]
    [StringLength(100)]
    public string TreeTypeName { get; set; } = null!;

    [Required]
    [StringLength(150)]
    public string ScientificName { get; set; } = null!;

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(100)]
    public string? Category { get; set; }

    [Range(1, 1000)]
    public int? AverageLifespanYears { get; set; }

    [Range(-50, 50)]
    public decimal? OptimalTemperatureMin { get; set; }

    [Range(-50, 50)]
    public decimal? OptimalTemperatureMax { get; set; }

    [Range(0, 100)]
    public decimal? OptimalHumidityMin { get; set; }

    [Range(0, 100)]
    public decimal? OptimalHumidityMax { get; set; }

    [StringLength(20)]
    public string? DroughtTolerance { get; set; }

    [StringLength(20)]
    public string? FloodTolerance { get; set; }

    [StringLength(20)]
    public string? FrostTolerance { get; set; }

    [StringLength(20)]
    public string? WindTolerance { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;

    // New fields for PlantDetail page
    public string? CareGuide { get; set; } // JSON array of care instruction strings

    [StringLength(500)]
    public string? LightRequirement { get; set; }

    [StringLength(500)]
    public string? WaterRequirement { get; set; }

    public string? Pests { get; set; } // JSON array of pest objects

    public string? SeasonalRoadmap { get; set; } // JSON array of roadmap objects
}

/// <summary>
/// DTO for updating a tree type
/// </summary>
public class UpdateTreeTypeDto
{
    [Range(1, int.MaxValue)]
    public int? SoilMasterId { get; set; }

    [StringLength(100)]
    public string? TreeTypeName { get; set; }

    [StringLength(150)]
    public string? ScientificName { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(100)]
    public string? Category { get; set; }

    [Range(1, 1000)]
    public int? AverageLifespanYears { get; set; }

    [Range(-50, 50)]
    public decimal? OptimalTemperatureMin { get; set; }

    [Range(-50, 50)]
    public decimal? OptimalTemperatureMax { get; set; }

    [Range(0, 100)]
    public decimal? OptimalHumidityMin { get; set; }

    [Range(0, 100)]
    public decimal? OptimalHumidityMax { get; set; }

    [StringLength(20)]
    public string? DroughtTolerance { get; set; }

    [StringLength(20)]
    public string? FloodTolerance { get; set; }

    [StringLength(20)]
    public string? FrostTolerance { get; set; }

    [StringLength(20)]
    public string? WindTolerance { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    public bool? IsActive { get; set; }

    // New fields for PlantDetail page
    public string? CareGuide { get; set; } // JSON array of care instruction strings

    [StringLength(500)]
    public string? LightRequirement { get; set; }

    [StringLength(500)]
    public string? WaterRequirement { get; set; }

    public string? Pests { get; set; } // JSON array of pest objects

    public string? SeasonalRoadmap { get; set; } // JSON array of roadmap objects
}

/// <summary>
/// DTO for tree type details
/// </summary>
public class TreeTypeDetailDto
{
    public int TreeTypeId { get; set; }
    public int SoilMasterId { get; set; }
    public string SoilMasterName { get; set; } = null!;
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
    // New fields for PlantDetail page
    public string? CareGuide { get; set; } // JSON array of care instruction strings
    public string? LightRequirement { get; set; }
    public string? WaterRequirement { get; set; }
    public string? Pests { get; set; } // JSON array of pest objects
    public string? SeasonalRoadmap { get; set; } // JSON array of roadmap objects
    public int VarietiesCount { get; set; }
    public int TreesCount { get; set; }
    public int GrowthStagesCount { get; set; }
}

/// <summary>
/// DTO for tree type list item
/// </summary>
public class TreeTypeListItemDto
{
    public int TreeTypeId { get; set; }
    public int SoilMasterId { get; set; }
    public string SoilMasterName { get; set; } = null!;
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
    // New fields for PlantDetail page (optional in list view)
    public string? CareGuide { get; set; } // JSON array of care instruction strings
    public string? LightRequirement { get; set; }
    public string? WaterRequirement { get; set; }
    public string? Pests { get; set; } // JSON array of pest objects
    public string? SeasonalRoadmap { get; set; } // JSON array of roadmap objects
    public int VarietiesCount { get; set; }
    public int TreesCount { get; set; }
    public int GrowthStagesCount { get; set; }
}

