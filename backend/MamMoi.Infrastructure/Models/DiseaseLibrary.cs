using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class DiseaseLibrary
{
    public int DiseaseId { get; set; }

    public string DiseaseName { get; set; } = null!;

    public string? ScientificName { get; set; }

    public string? Category { get; set; }

    public string? Symptoms { get; set; }

    public string? Causes { get; set; }

    public string? AffectedParts { get; set; }

    public string? Severity { get; set; }

    public string? SpreadRate { get; set; }

    public string? Treatment { get; set; }

    public string? Prevention { get; set; }

    public string? OrganicTreatment { get; set; }

    public string? ChemicalTreatment { get; set; }

    public string? RecoveryTime { get; set; }

    public bool IsContagious { get; set; }

    public string? ImageUrls { get; set; }

    public string? ReferenceLinks { get; set; }

    public virtual ICollection<Tree> Trees { get; set; } = new List<Tree>();
}
