using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs.SystemAdmin
{
    
    public class TreeTypeDropdownDto
    {
        public int TreeTypeID { get; set; }
        public string TreeTypeName { get; set; }
    }

    public class GrowthStageDto
    {
        public int StageID { get; set; }

        public int TreeTypeID { get; set; }
        public string TreeTypeName { get; set; }

        public string StageName { get; set; }
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
        public bool IsActive { get; set; }
    }

    public class GrowthStageCreateUpdateDto
    {
        [Required]
        public int TreeTypeID { get; set; }

        [Required]
        [StringLength(100)]
        public string StageName { get; set; }

        [Required]
        public int StageOrder { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public int? MinAgeInMonths { get; set; }
        public int? MaxAgeInMonths { get; set; }
        public int? WateringFrequencyDays { get; set; }
        public decimal? WateringAmountLiters { get; set; }
        public int? FertilizingFrequencyDays { get; set; }
        public string? FertilizerType { get; set; }
        public decimal? FertilizerAmountGrams { get; set; }
        public int? PruningFrequencyDays { get; set; }
        public string? CareInstructions { get; set; } // (nvarchar(max))
        public string? CommonIssues { get; set; }
        public string? CriticalWeatherFactors { get; set; }
        public int VulnerabilityLevel { get; set; } = 5; // (Default 100% "clear")

        [StringLength(500)]
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; }
    }
}
