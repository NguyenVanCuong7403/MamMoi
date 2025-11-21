using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class TreeVariety
{
    public int VarietyId { get; set; }

    public int? TreeTypeId { get; set; }

    public string? VarietyName { get; set; }

    public string? VarietyDescription { get; set; }

    public virtual TreeType? TreeType { get; set; }

    public virtual ICollection<Tree> Trees { get; set; } = new List<Tree>();
}
