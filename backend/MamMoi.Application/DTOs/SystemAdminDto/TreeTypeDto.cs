using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs.SystemAdminDto
{
    public class TreeTypeDto
    {
        public int TreeTypeID { get; set; }
        public int SoilMasterID { get; set; }
        public string SoilName { get; set; } 
        public string TreeTypeName { get; set; }
        public string ScientificName { get; set; }
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
    }

    public class TreeTypeCreateUpdateDto
    {
        [Required]
        public int SoilMasterID { get; set; }
        [Required]
        [StringLength(100)]
        public string TreeTypeName { get; set; }
        [Required]
        [StringLength(150)]
        public string ScientificName { get; set; }
        [StringLength(500)]
        public string? Description { get; set; }
        [StringLength(100)]
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
        [StringLength(500)]
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
