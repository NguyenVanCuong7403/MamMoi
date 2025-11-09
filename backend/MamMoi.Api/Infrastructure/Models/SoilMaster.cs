using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

[Index("SoilName", Name = "UQ_SoilMaster_SoilName", IsUnique = true)]
public partial class SoilMaster
{
    [Key]
    public int SoilMasterID { get; set; }

    [StringLength(100)]
    public string SoilName { get; set; } = null!;

    [StringLength(20)]
    public string? Texture { get; set; }

    [StringLength(20)]
    public string? Drainage { get; set; }

    [Column(TypeName = "decimal(4, 1)")]
    public decimal? OrganicMatterPct { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? EC_dS_m { get; set; }

    [StringLength(255)]
    public string? Notes { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [Precision(0)]
    public DateTime? UpdatedAt { get; set; }

    [InverseProperty("SoilMaster")]
    public virtual ICollection<GardenSoils> GardenSoils { get; set; } = new List<GardenSoils>();

    [InverseProperty("SoilMaster")]
    public virtual ICollection<TreeTypes> TreeTypes { get; set; } = new List<TreeTypes>();
}
