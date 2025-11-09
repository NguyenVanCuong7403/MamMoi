using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

[Index("SettingKey", Name = "UQ__SystemSe__01E719ADB02B422D", IsUnique = true)]
public partial class SystemSettings
{
    [Key]
    public int SettingID { get; set; }

    public int UserID { get; set; }

    [StringLength(100)]
    public string SettingKey { get; set; } = null!;

    public string? SettingValue { get; set; }

    [StringLength(20)]
    public string? DataType { get; set; }

    [StringLength(50)]
    public string? Category { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    public bool IsPublic { get; set; }

    [Precision(0)]
    public DateTime UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    [ForeignKey("UserID")]
    [InverseProperty("SystemSettings")]
    public virtual Users User { get; set; } = null!;
}
