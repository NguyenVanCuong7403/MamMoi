using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class GardenMember
{
    public int MemberId { get; set; }

    public int GardenId { get; set; }

    public int UserId { get; set; }

    public int RoleId { get; set; }

    public DateTime JoinedAt { get; set; }

    public virtual Garden Garden { get; set; } = null!;

    public virtual Role Role { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
