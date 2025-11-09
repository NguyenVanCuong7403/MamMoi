using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

[Index("SoilMasterID", Name = "IX_TreeTypes_SoilMasterID")]
public partial class TreeTypes
{
    [Key]
    public int TreeTypeID { get; set; }

    public int SoilMasterID { get; set; }

    [StringLength(100)]
    public string TreeTypeName { get; set; } = null!;

    [StringLength(150)]
    public string ScientificName { get; set; } = null!;

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(100)]
    public string? Category { get; set; }

    public int? AverageLifespanYears { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? OptimalTemperatureMin { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? OptimalTemperatureMax { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? OptimalHumidityMin { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
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

    public bool IsActive { get; set; }

    [ForeignKey("SoilMasterID")]
    [InverseProperty("TreeTypes")]
    public virtual SoilMaster SoilMaster { get; set; } = null!;

    [InverseProperty("TreeType")]
    public virtual ICollection<TreeGrowthStages> TreeGrowthStages { get; set; } = new List<TreeGrowthStages>();

    [InverseProperty("TreeType")]
    public virtual ICollection<Trees> Trees { get; set; } = new List<Trees>();
}
