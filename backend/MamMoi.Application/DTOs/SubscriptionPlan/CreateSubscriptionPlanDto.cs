using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.SubscriptionPlan;

/// <summary>
/// DTO for creating a new subscription plan
/// </summary>
public class CreateSubscriptionPlanDto
{
    /// <summary>
    /// Plan name (required, 3-100 characters, must be unique)
    /// </summary>
    [Required(ErrorMessage = "Plan name is required")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Plan name must be between 3 and 100 characters")]
    public string PlanName { get; set; } = string.Empty;

    /// <summary>
    /// Plan type (optional, max 50 characters)
    /// </summary>
    [StringLength(50, ErrorMessage = "Plan type cannot exceed 50 characters")]
    public string? PlanType { get; set; }

    /// <summary>
    /// Price (required, must be >= 0)
    /// </summary>
    [Required(ErrorMessage = "Price is required")]
    [Range(0, double.MaxValue, ErrorMessage = "Price must be greater than or equal to 0")]
    public decimal Price { get; set; }

    /// <summary>
    /// Currency (required, default: VND)
    /// </summary>
    [Required(ErrorMessage = "Currency is required")]
    [StringLength(10, ErrorMessage = "Currency cannot exceed 10 characters")]
    public string Currency { get; set; } = "VND";

    /// <summary>
    /// Description (optional, max 500 characters)
    /// </summary>
    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string? Description { get; set; }

    /// <summary>
    /// Features (optional, JSON string or plain text)
    /// </summary>
    public string? Features { get; set; }

    /// <summary>
    /// Is active (default: true)
    /// </summary>
    public bool IsActive { get; set; } = true;
}

