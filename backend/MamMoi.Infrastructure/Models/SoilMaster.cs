using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class SoilMaster
{
    public int SoilMasterId { get; set; }

    public string SoilName { get; set; } = null!;

    public string? Texture { get; set; }

    public string? Drainage { get; set; }

    public decimal? OrganicMatterPct { get; set; }

    public decimal? EcDSM { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<GardenSoil> GardenSoils { get; set; } = new List<GardenSoil>();

    public virtual ICollection<TreeType> TreeTypes { get; set; } = new List<TreeType>();
}
