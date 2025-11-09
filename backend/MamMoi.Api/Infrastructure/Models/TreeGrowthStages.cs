using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

[Index("TreeTypeID", Name = "IX_TreeGrowth_TreeTypeID")]
[Index("TreeTypeID", "StageOrder", Name = "UX_TreeGrowthStages_TreeType_StageOrder", IsUnique = true)]
public partial class TreeGrowthStages
{
    [Key]
    public int StageID { get; set; }

    public int TreeTypeID { get; set; }

    [StringLength(100)]
    public string StageName { get; set; } = null!;

    public int StageOrder { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    public int? MinAgeInMonths { get; set; }

    public int? MaxAgeInMonths { get; set; }

    public int? WateringFrequencyDays { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? WateringAmountLiters { get; set; }

    public int? FertilizingFrequencyDays { get; set; }

    [StringLength(50)]
    public string? FertilizerType { get; set; }

    [Column(TypeName = "decimal(6, 2)")]
    public decimal? FertilizerAmountGrams { get; set; }

    public int? PruningFrequencyDays { get; set; }

    public string? CareInstructions { get; set; }

    public string? CommonIssues { get; set; }

    public string? CriticalWeatherFactors { get; set; }

    public int VulnerabilityLevel { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [ForeignKey("TreeTypeID")]
    [InverseProperty("TreeGrowthStages")]
    public virtual TreeTypes TreeType { get; set; } = null!;

    [InverseProperty("Stage")]
    public virtual ICollection<Trees> Trees { get; set; } = new List<Trees>();
}
