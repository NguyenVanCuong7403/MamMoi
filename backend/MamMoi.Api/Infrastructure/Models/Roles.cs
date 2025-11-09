using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

public partial class Roles
{
    [Key]
    public int RoleID { get; set; }

    [StringLength(100)]
    public string RoleName { get; set; } = null!;

    [InverseProperty("Role")]
    public virtual ICollection<GardenMembers> GardenMembers { get; set; } = new List<GardenMembers>();

    [InverseProperty("Role")]
    public virtual ICollection<Users> Users { get; set; } = new List<Users>();
}
