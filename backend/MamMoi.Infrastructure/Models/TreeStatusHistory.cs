// Infrastructure/Models/TreeStatusHistory.cs
using System;

namespace MamMoi.Infrastructure.Models;

public partial class TreeStatusHistory
{
    public int HistoryId { get; set; }
    public int TreeId { get; set; }
    public int UserId { get; set; }
    public string StatusField { get; set; } = null!; // 'LeafStatus', 'BranchStatus', 'FlowerStatus', 'FruitStatus'
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public DateTime ChangedAt { get; set; }

    // ======= Navigations =======
    public virtual Tree Tree { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}

