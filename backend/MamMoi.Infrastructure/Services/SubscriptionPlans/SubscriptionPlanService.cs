using MamMoi.Application.DTOs.SubscriptionPlan;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MamMoi.Infrastructure.Services.SubscriptionPlans;

/// <summary>
/// Subscription Plan service - xử lý business logic cho Subscription Plans
/// </summary>
public class SubscriptionPlanService : ISubscriptionPlanService
{
    private readonly MamMoiDbContext _dbContext;
    private readonly ILogger<SubscriptionPlanService> _logger;

    public SubscriptionPlanService(
        MamMoiDbContext dbContext,
        ILogger<SubscriptionPlanService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>
    /// Get all subscription plans
    /// </summary>
    public async Task<List<SubscriptionPlanDto>> GetAllPlansAsync(bool? isActive = null)
    {
        var query = _dbContext.SubscriptionPlans.AsQueryable();

        if (isActive.HasValue)
        {
            query = query.Where(p => p.IsActive == isActive.Value);
        }

        var plans = await query
            .OrderBy(p => p.PlanId)
            .ToListAsync();

        return plans.Select(p => MapToDto(p)).ToList();
    }

    /// <summary>
    /// Get subscription plan by ID
    /// </summary>
    public async Task<SubscriptionPlanDto?> GetPlanByIdAsync(int planId)
    {
        if (planId <= 0)
            return null;

        var plan = await _dbContext.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.PlanId == planId);

        return plan == null ? null : MapToDto(plan);
    }

    /// <summary>
    /// Get subscription plan by name
    /// </summary>
    public async Task<SubscriptionPlanDto?> GetPlanByNameAsync(string planName)
    {
        if (string.IsNullOrWhiteSpace(planName))
            return null;

        var plan = await _dbContext.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.PlanName == planName.Trim());

        return plan == null ? null : MapToDto(plan);
    }

    /// <summary>
    /// Create a new subscription plan
    /// NOTE: Subscription plans are fixed - only 4 plans are allowed.
    /// This method is kept for backward compatibility but will throw an exception.
    /// </summary>
    public async Task<SubscriptionPlanDto> CreatePlanAsync(CreateSubscriptionPlanDto dto)
    {
        // Check if we already have 4 plans (fixed plans)
        var planCount = await _dbContext.SubscriptionPlans.CountAsync();
        if (planCount >= 4)
        {
            throw new InvalidOperationException("Subscription plans are fixed. Cannot create new plans. Only 4 plans are allowed: Free, Gói 1, Gói 2, Gói 3.");
        }

        // Validate plan name uniqueness
        if (await PlanNameExistsAsync(dto.PlanName))
        {
            throw new InvalidOperationException($"Plan name '{dto.PlanName}' already exists");
        }

        // Validate price
        if (dto.Price < 0)
        {
            throw new ArgumentException("Price cannot be negative");
        }

        var plan = new SubscriptionPlan
        {
            PlanName = dto.PlanName.Trim(),
            PlanType = dto.PlanType?.Trim(),
            Price = dto.Price,
            Currency = dto.Currency?.Trim() ?? "VND",
            Description = dto.Description?.Trim(),
            Features = dto.Features,
            IsActive = dto.IsActive
        };

        _dbContext.SubscriptionPlans.Add(plan);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Created subscription plan: {PlanName} (ID: {PlanId})", plan.PlanName, plan.PlanId);

        return MapToDto(plan);
    }

    /// <summary>
    /// Update an existing subscription plan
    /// NOTE: For fixed plans, only PlanName, Price, and DurationInMonths can be updated.
    /// MaxGardens and MaxTreesPerGarden cannot be changed as they define the plan structure.
    /// Description and Features are read-only and cannot be updated.
    /// </summary>
    public async Task<SubscriptionPlanDto?> UpdatePlanAsync(int planId, UpdateSubscriptionPlanDto dto)
    {
        if (planId <= 0)
            return null;

        var plan = await _dbContext.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.PlanId == planId);

        if (plan == null)
            return null;

        // Only allow updating PlanName, Price, and DurationInMonths for fixed plans
        // Description and Features are read-only and cannot be updated
        // MaxGardens and MaxTreesPerGarden define the plan structure and cannot be changed
        
        // Validate plan name uniqueness if changed
        if (!string.IsNullOrWhiteSpace(dto.PlanName) && dto.PlanName.Trim() != plan.PlanName)
        {
            if (await PlanNameExistsAsync(dto.PlanName, planId))
            {
                throw new InvalidOperationException($"Plan name '{dto.PlanName}' already exists");
            }
            plan.PlanName = dto.PlanName.Trim();
        }

        // Update price if provided
        if (dto.Price.HasValue)
        {
            if (dto.Price.Value < 0)
                throw new ArgumentException("Price cannot be negative");
            plan.Price = dto.Price.Value;
        }

        // Update duration if provided
        if (dto.DurationInMonths.HasValue)
        {
            if (dto.DurationInMonths.Value < 1)
                throw new ArgumentException("Duration must be at least 1 month");
            plan.DurationInMonths = dto.DurationInMonths.Value;
        }

        // Note: Description and Features are intentionally NOT updated here
        // They are read-only fields for fixed subscription plans

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Updated subscription plan: {PlanName} (ID: {PlanId}) - Only PlanName, Price, and DurationInMonths can be updated. Description and Features are read-only.", plan.PlanName, plan.PlanId);

        return MapToDto(plan);
    }

    /// <summary>
    /// Delete a subscription plan
    /// NOTE: Subscription plans are fixed and cannot be deleted.
    /// </summary>
    public async Task<bool> DeletePlanAsync(int planId)
    {
        throw new InvalidOperationException("Subscription plans are fixed and cannot be deleted. Plans can only be deactivated using DeactivatePlanAsync.");
    }

    /// <summary>
    /// Activate a subscription plan
    /// </summary>
    public async Task<bool> ActivatePlanAsync(int planId)
    {
        if (planId <= 0)
            return false;

        var plan = await _dbContext.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.PlanId == planId);

        if (plan == null)
            return false;

        plan.IsActive = true;
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Activated subscription plan: {PlanName} (ID: {PlanId})", plan.PlanName, plan.PlanId);

        return true;
    }

    /// <summary>
    /// Deactivate a subscription plan
    /// </summary>
    public async Task<bool> DeactivatePlanAsync(int planId)
    {
        if (planId <= 0)
            return false;

        var plan = await _dbContext.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.PlanId == planId);

        if (plan == null)
            return false;

        plan.IsActive = false;
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Deactivated subscription plan: {PlanName} (ID: {PlanId})", plan.PlanName, plan.PlanId);

        return true;
    }

    /// <summary>
    /// Check if plan name exists
    /// </summary>
    public async Task<bool> PlanNameExistsAsync(string planName, int? excludePlanId = null)
    {
        if (string.IsNullOrWhiteSpace(planName))
            return false;

        var query = _dbContext.SubscriptionPlans
            .Where(p => p.PlanName == planName.Trim());

        if (excludePlanId.HasValue)
        {
            query = query.Where(p => p.PlanId != excludePlanId.Value);
        }

        return await query.AnyAsync();
    }

    /// <summary>
    /// Get current user's active subscription plan
    /// Returns the free plan (first plan with PlanName "Free") if no active subscription exists
    /// </summary>
    public async Task<SubscriptionPlanDto?> GetCurrentUserSubscriptionAsync(int userId)
    {
        if (userId <= 0)
            return null;

        // Get the most recent active subscription for the user
        var subscription = await _dbContext.Subscriptions
            .Where(s => s.UserId == userId && s.Status == "Active")
            .OrderByDescending(s => s.StartDate)
            .FirstOrDefaultAsync();

        if (subscription == null)
        {
            // If no subscription, return the free plan (first plan with PlanName "Free")
            var freePlan = await _dbContext.SubscriptionPlans
                .Where(p => p.PlanType.ToLower() == "free")
                .OrderBy(p => p.PlanId)
                .FirstOrDefaultAsync();           

            return freePlan == null ? null : MapToDto(freePlan);
        }

        // Match the subscription's PlanName to a SubscriptionPlan
        var plan = await _dbContext.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.PlanName == subscription.PlanName);

        return plan == null ? null : MapToDto(plan);
    }

    /// <summary>
    /// Map entity to DTO
    /// </summary>
    private static SubscriptionPlanDto MapToDto(SubscriptionPlan plan)
    {
        return new SubscriptionPlanDto
        {
            PlanId = plan.PlanId,
            PlanName = plan.PlanName,
            PlanType = plan.PlanType,
            Price = plan.Price,
            Currency = plan.Currency,
            Description = plan.Description,
            Features = plan.Features,
            MaxGardens = plan.MaxGardens,
            MaxTreesPerGarden = plan.MaxTreesPerGarden,
            DurationInMonths = plan.DurationInMonths,
            IsActive = plan.IsActive
        };
    }
}

