using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class TreeGrowthStage
{
    public int StageId { get; set; }

    public int TreeTypeId { get; set; }

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

    public virtual TreeType TreeType { get; set; } = null!;

    public virtual ICollection<Tree> Trees { get; set; } = new List<Tree>();
}
