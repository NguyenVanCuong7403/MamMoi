using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

[Index("DiseaseName", Name = "UQ__DiseaseL__5112584DC574F6B5", IsUnique = true)]
public partial class DiseaseLibrary
{
    [Key]
    public int DiseaseID { get; set; }

    [StringLength(100)]
    public string DiseaseName { get; set; } = null!;

    [StringLength(150)]
    public string? ScientificName { get; set; }

    [StringLength(50)]
    public string? Category { get; set; }

    public string? Symptoms { get; set; }

    public string? Causes { get; set; }

    [StringLength(200)]
    public string? AffectedParts { get; set; }

    [StringLength(20)]
    public string? Severity { get; set; }

    [StringLength(20)]
    public string? SpreadRate { get; set; }

    public string? Treatment { get; set; }

    public string? Prevention { get; set; }

    public string? OrganicTreatment { get; set; }

    public string? ChemicalTreatment { get; set; }

    [StringLength(100)]
    public string? RecoveryTime { get; set; }

    public bool IsContagious { get; set; }

    public string? ImageUrls { get; set; }

    public string? ReferenceLinks { get; set; }

    [ForeignKey("DiseaseID")]
    [InverseProperty("Disease")]
    public virtual ICollection<Trees> Tree { get; set; } = new List<Trees>();
}
