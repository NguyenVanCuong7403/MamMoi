using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

[Index("UserID", Name = "IX_Gardens_UserID")]
public partial class Gardens
{
    [Key]
    public int GardenID { get; set; }

    public int UserID { get; set; }

    [StringLength(100)]
    public string Name { get; set; } = null!;

    [StringLength(255)]
    public string? Location { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [StringLength(100)]
    public string? TimeZone { get; set; }

    [StringLength(50)]
    public string? ClimateZone { get; set; }

    [InverseProperty("Garden")]
    public virtual ICollection<GardenMembers> GardenMembers { get; set; } = new List<GardenMembers>();

    [InverseProperty("Garden")]
    public virtual ICollection<GardenSoils> GardenSoils { get; set; } = new List<GardenSoils>();

    [InverseProperty("Garden")]
    public virtual ICollection<Trees> Trees { get; set; } = new List<Trees>();

    [ForeignKey("UserID")]
    [InverseProperty("Gardens")]
    public virtual Users User { get; set; } = null!;
}
