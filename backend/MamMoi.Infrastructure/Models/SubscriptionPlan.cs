using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class SubscriptionPlan
{
    public int PlanId { get; set; }

    public string PlanName { get; set; } = null!;

    public string? PlanType { get; set; }

    public decimal Price { get; set; }

    public string Currency { get; set; } = null!;

    public string? Description { get; set; }

    public string? Features { get; set; }

    public int? MaxGardens { get; set; }

    public int? MaxTreesPerGarden { get; set; }

    public int? DurationInMonths { get; set; }

    public bool IsActive { get; set; }
}

