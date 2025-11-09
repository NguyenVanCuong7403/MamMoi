using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

[Index("GardenID", Name = "IX_GardenSoils_GardenID")]
[Index("GardenID", "SoilMasterID", Name = "UX_GardenSoils_Garden_Soil", IsUnique = true)]
public partial class GardenSoils
{
    [Key]
    public int GardenSoilID { get; set; }

    public int GardenID { get; set; }

    public int SoilMasterID { get; set; }

    [StringLength(100)]
    public string? CustomLabel { get; set; }

    [StringLength(255)]
    public string? Notes { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("GardenID")]
    [InverseProperty("GardenSoils")]
    public virtual Gardens Garden { get; set; } = null!;

    [ForeignKey("SoilMasterID")]
    [InverseProperty("GardenSoils")]
    public virtual SoilMaster SoilMaster { get; set; } = null!;

    [InverseProperty("GardenSoil")]
    public virtual ICollection<Trees> Trees { get; set; } = new List<Trees>();
}
