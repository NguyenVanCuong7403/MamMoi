using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Admin;

/// <summary>
/// DTO for creating a new tree growth stage
/// </summary>
public class CreateTreeGrowthStageDto
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "TreeTypeId is required")]
    public int TreeTypeId { get; set; }

    [Required]
    [StringLength(100)]
    public string StageName { get; set; } = null!;

    [Range(1, int.MaxValue)]
    public int? StageOrder { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [Range(0, 1000)]
    public int? MinAgeInMonths { get; set; }

    [Range(0, 1000)]
    public int? MaxAgeInMonths { get; set; }

    [Range(1, 365)]
    public int? WateringFrequencyDays { get; set; }

    [Range(0, 1000)]
    public decimal? WateringAmountLiters { get; set; }

    [Range(1, 365)]
    public int? FertilizingFrequencyDays { get; set; }

    [StringLength(50)]
    public string? FertilizerType { get; set; }

    [Range(0, 10000)]
    public decimal? FertilizerAmountGrams { get; set; }

    [Range(1, 365)]
    public int? PruningFrequencyDays { get; set; }

    [StringLength(int.MaxValue)]
    public string? CareInstructions { get; set; }

    [StringLength(int.MaxValue)]
    public string? CommonIssues { get; set; }

    [StringLength(int.MaxValue)]
    public string? CriticalWeatherFactors { get; set; }

    [Range(1, 10)]
    public int VulnerabilityLevel { get; set; } = 5;

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [StringLength(255)]
    public string? Icon { get; set; }

    [StringLength(32)]
    public string? NodeColor { get; set; }

    [StringLength(32)]
    public string? LineColor { get; set; }
}

/// <summary>
/// DTO for updating a tree growth stage
/// </summary>
public class UpdateTreeGrowthStageDto
{
    [Range(1, int.MaxValue)]
    public int? TreeTypeId { get; set; }

    [StringLength(100)]
    public string? StageName { get; set; }

    [Range(1, int.MaxValue)]
    public int? StageOrder { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [Range(0, 1000)]
    public int? MinAgeInMonths { get; set; }

    [Range(0, 1000)]
    public int? MaxAgeInMonths { get; set; }

    [Range(1, 365)]
    public int? WateringFrequencyDays { get; set; }

    [Range(0, 1000)]
    public decimal? WateringAmountLiters { get; set; }

    [Range(1, 365)]
    public int? FertilizingFrequencyDays { get; set; }

    [StringLength(50)]
    public string? FertilizerType { get; set; }

    [Range(0, 10000)]
    public decimal? FertilizerAmountGrams { get; set; }

    [Range(1, 365)]
    public int? PruningFrequencyDays { get; set; }

    [StringLength(int.MaxValue)]
    public string? CareInstructions { get; set; }

    [StringLength(int.MaxValue)]
    public string? CommonIssues { get; set; }

    [StringLength(int.MaxValue)]
    public string? CriticalWeatherFactors { get; set; }

    [Range(1, 10)]
    public int? VulnerabilityLevel { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [StringLength(255)]
    public string? Icon { get; set; }

    [StringLength(32)]
    public string? NodeColor { get; set; }

    [StringLength(32)]
    public string? LineColor { get; set; }
}

/// <summary>
/// DTO for tree growth stage details
/// </summary>
public class TreeGrowthStageDetailDto
{
    public int StageId { get; set; }
    public int TreeTypeId { get; set; }
    public string TreeTypeName { get; set; } = null!;
    public string StageName { get; set; } = null!;
    public int StageOrder { get; set; }
    public string? Description { get; set; }
    public int? MinAgeInMonths { get; set; }
    public int? MaxAgeInMonths { get; set; }
    public int? WateringFrequencyDays { get; set; }
    public decimal? WateringAmountLiters { get; set; }
    public int? FertilizingFrequencyDays { get; set; }
    public string? FertilizerType { get; set; }
    public decimal? FertilizerAmountGrams { get; set; }
    public int? PruningFrequencyDays { get; set; }
    public string? CareInstructions { get; set; }
    public string? CommonIssues { get; set; }
    public string? CriticalWeatherFactors { get; set; }
    public int VulnerabilityLevel { get; set; }
    public string? ImageUrl { get; set; }
    public string? Icon { get; set; }
    public string? NodeColor { get; set; }
    public string? LineColor { get; set; }
    public int TreesCount { get; set; }
}

/// <summary>
/// DTO for tree growth stage list item
/// </summary>
public class TreeGrowthStageListItemDto
{
    public int StageId { get; set; }
    public int TreeTypeId { get; set; }
    public string TreeTypeName { get; set; } = null!;
    public string StageName { get; set; } = null!;
    public int StageOrder { get; set; }
    public string? Description { get; set; }
    public int? MinAgeInMonths { get; set; }
    public int? MaxAgeInMonths { get; set; }
    public int VulnerabilityLevel { get; set; }
    public string? Icon { get; set; }
    public string? NodeColor { get; set; }
    public string? LineColor { get; set; }
    public int TreesCount { get; set; }
}

