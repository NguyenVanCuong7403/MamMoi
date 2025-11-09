using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

[Index("GardenID", "UserID", Name = "UX_GardenMembers_Garden_User", IsUnique = true)]
public partial class GardenMembers
{
    [Key]
    public int MemberID { get; set; }

    public int GardenID { get; set; }

    public int UserID { get; set; }

    public int RoleID { get; set; }

    [Precision(0)]
    public DateTime JoinedAt { get; set; }

    [ForeignKey("GardenID")]
    [InverseProperty("GardenMembers")]
    public virtual Gardens Garden { get; set; } = null!;

    [ForeignKey("RoleID")]
    [InverseProperty("GardenMembers")]
    public virtual Roles Role { get; set; } = null!;

    [ForeignKey("UserID")]
    [InverseProperty("GardenMembers")]
    public virtual Users User { get; set; } = null!;
}
