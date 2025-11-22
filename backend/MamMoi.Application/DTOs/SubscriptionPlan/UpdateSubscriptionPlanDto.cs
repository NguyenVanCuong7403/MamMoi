using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.SubscriptionPlan;

/// <summary>
/// DTO for updating an existing subscription plan
/// NOTE: For fixed subscription plans, only PlanName, Price, and DurationInMonths can be updated.
/// Description and Features are read-only and cannot be modified.
/// MaxGardens and MaxTreesPerGarden define the plan structure and cannot be changed.
/// </summary>
public class UpdateSubscriptionPlanDto
{
    /// <summary>
    /// Plan name (optional, 3-100 characters, must be unique)
    /// Only PlanName, Price, and DurationInMonths can be updated for fixed plans
    /// </summary>
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Plan name must be between 3 and 100 characters")]
    public string? PlanName { get; set; }

    /// <summary>
    /// Price (optional, must be >= 0)
    /// Only PlanName, Price, and DurationInMonths can be updated for fixed plans
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "Price must be greater than or equal to 0")]
    public decimal? Price { get; set; }

    /// <summary>
    /// Duration in months (optional, must be >= 1)
    /// Only PlanName, Price, and DurationInMonths can be updated for fixed plans
    /// </summary>
    [Range(1, int.MaxValue, ErrorMessage = "Duration must be at least 1 month")]
    public int? DurationInMonths { get; set; }

    // NOTE: Description and Features are intentionally NOT included in this DTO
    // They are read-only fields and cannot be updated for fixed subscription plans
}

