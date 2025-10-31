using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class ActivityLog
{
    public int LogId { get; set; }

    public int UserId { get; set; }

    public int? TreeId { get; set; }

    public string ActivityType { get; set; } = null!;

    public string? ActivityDescription { get; set; }

    public string? EntityType { get; set; }

    public int? EntityId { get; set; }

    public string? ActionData { get; set; }

    public string? OldValue { get; set; }

    public string? NewValue { get; set; }

    public string? UserAgent { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Tree? Tree { get; set; }

    public virtual User User { get; set; } = null!;
}
