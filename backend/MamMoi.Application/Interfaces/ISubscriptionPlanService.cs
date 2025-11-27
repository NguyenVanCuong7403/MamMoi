using MamMoi.Application.DTOs;
using MamMoi.Application.DTOs.SubscriptionPlan;

namespace MamMoi.Application.Interfaces;

/// <summary>
/// Interface for Subscription Plan service
/// </summary>
public interface ISubscriptionPlanService
{
    /// <summary>
    /// Get all subscription plans
    /// </summary>
    Task<List<SubscriptionPlanDto>> GetAllPlansAsync(bool? isActive = null);

    /// <summary>
    /// Get subscription plan by ID
    /// </summary>
    Task<SubscriptionPlanDto?> GetPlanByIdAsync(int planId);

    /// <summary>
    /// Get subscription plan by name
    /// </summary>
    Task<SubscriptionPlanDto?> GetPlanByNameAsync(string planName);

    /// <summary>
    /// Create a new subscription plan
    /// </summary>
    Task<SubscriptionPlanDto> CreatePlanAsync(CreateSubscriptionPlanDto dto);

    /// <summary>
    /// Update an existing subscription plan
    /// </summary>
    Task<SubscriptionPlanDto?> UpdatePlanAsync(int planId, UpdateSubscriptionPlanDto dto);

    /// <summary>
    /// Delete a subscription plan (soft delete by setting IsActive = false)
    /// </summary>
    Task<bool> DeletePlanAsync(int planId);

    /// <summary>
    /// Activate a subscription plan
    /// </summary>
    Task<bool> ActivatePlanAsync(int planId);

    /// <summary>
    /// Deactivate a subscription plan
    /// </summary>
    Task<bool> DeactivatePlanAsync(int planId);

    /// <summary>
    /// Check if plan name exists
    /// </summary>
    Task<bool> PlanNameExistsAsync(string planName, int? excludePlanId = null);

    /// <summary>
    /// Get current user's active subscription plan
    /// </summary>
    Task<SubscriptionPlanDto?> GetCurrentUserSubscriptionAsync(int userId);
}

