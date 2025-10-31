using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class Role
{
    public int RoleId { get; set; }

    public string RoleName { get; set; } = null!;

    public virtual ICollection<GardenMember> GardenMembers { get; set; } = new List<GardenMember>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
