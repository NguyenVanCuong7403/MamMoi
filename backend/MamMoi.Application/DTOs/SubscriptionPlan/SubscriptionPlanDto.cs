namespace MamMoi.Application.DTOs.SubscriptionPlan;

/// <summary>
/// DTO for subscription plan response
/// </summary>
public class SubscriptionPlanDto
{
    public int PlanId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string? PlanType { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Features { get; set; }
    public bool IsActive { get; set; }
}

