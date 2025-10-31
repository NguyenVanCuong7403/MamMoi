using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class Garden
{
    public int GardenId { get; set; }

    public int UserId { get; set; }

    public string Name { get; set; } = null!;

    public string? Location { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<GardenMember> GardenMembers { get; set; } = new List<GardenMember>();

    public virtual ICollection<GardenSoil> GardenSoils { get; set; } = new List<GardenSoil>();

    public virtual ICollection<Tree> Trees { get; set; } = new List<Tree>();

    public virtual User User { get; set; } = null!;
}
