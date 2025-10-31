using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class SystemSetting
{
    public int SettingId { get; set; }

    public int UserId { get; set; }

    public string SettingKey { get; set; } = null!;

    public string? SettingValue { get; set; }

    public string? DataType { get; set; }

    public string? Category { get; set; }

    public string? Description { get; set; }

    public bool IsPublic { get; set; }

    public DateTime UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual User User { get; set; } = null!;
}
