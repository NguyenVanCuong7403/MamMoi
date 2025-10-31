using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class GardenSoil
{
    public int GardenSoilId { get; set; }

    public int GardenId { get; set; }

    public int SoilMasterId { get; set; }

    public string? CustomLabel { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Garden Garden { get; set; } = null!;

    public virtual SoilMaster SoilMaster { get; set; } = null!;

    public virtual ICollection<Tree> Trees { get; set; } = new List<Tree>();
}
