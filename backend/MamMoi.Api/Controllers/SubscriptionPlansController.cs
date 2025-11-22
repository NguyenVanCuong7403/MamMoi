using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MamMoi.Application.DTOs.SubscriptionPlan;
using MamMoi.Application.Interfaces;

namespace MamMoi.Api.Controllers;

/// <summary>
/// Subscription Plans Controller - API quản lý các gói dịch vụ
/// Chỉ Admin mới có quyền thay đổi giá tiền và nội dung của các subscription plans
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize] // Tất cả endpoints đều yêu cầu authentication
public class SubscriptionPlansController : ControllerBase
{
    private readonly ISubscriptionPlanService _subscriptionPlanService;
    private readonly ILogger<SubscriptionPlansController> _logger;

    public SubscriptionPlansController(
        ISubscriptionPlanService subscriptionPlanService,
        ILogger<SubscriptionPlansController> logger)
    {
        _subscriptionPlanService = subscriptionPlanService;
        _logger = logger;
    }

    #region Public Endpoints (All authenticated users can view)

    /// <summary>
    /// Get all subscription plans
    /// GET /api/subscriptionplans
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<SubscriptionPlanDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllPlans([FromQuery] bool? isActive = null)
    {
        try
        {
            var plans = await _subscriptionPlanService.GetAllPlansAsync(isActive);
            return Ok(new
            {
                success = true,
                data = plans
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting subscription plans");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get subscription plan by ID
    /// GET /api/subscriptionplans/{id}
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(SubscriptionPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPlanById(int id)
    {
        try
        {
            var plan = await _subscriptionPlanService.GetPlanByIdAsync(id);
            if (plan == null)
            {
                return NotFound(new { success = false, message = "Subscription plan not found" });
            }

            return Ok(new
            {
                success = true,
                data = plan
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting subscription plan by ID: {PlanId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get subscription plan by name
    /// GET /api/subscriptionplans/name/{planName}
    /// </summary>
    [HttpGet("name/{planName}")]
    [ProducesResponseType(typeof(SubscriptionPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPlanByName(string planName)
    {
        try
        {
            var plan = await _subscriptionPlanService.GetPlanByNameAsync(planName);
            if (plan == null)
            {
                return NotFound(new { success = false, message = "Subscription plan not found" });
            }

            return Ok(new
            {
                success = true,
                data = plan
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting subscription plan by name: {PlanName}", planName);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    #endregion

    #region Admin Only Endpoints

    /// <summary>
    /// Create a new subscription plan
    /// POST /api/subscriptionplans
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "SystemAdmin,BusinessAdmin")]
    [ProducesResponseType(typeof(SubscriptionPlanDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreatePlan([FromBody] CreateSubscriptionPlanDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });
            }

            var plan = await _subscriptionPlanService.CreatePlanAsync(dto);
            return CreatedAtAction(
                nameof(GetPlanById),
                new { id = plan.PlanId },
                new { success = true, message = "Subscription plan created successfully", data = plan });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating subscription plan");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Update an existing subscription plan
    /// PUT /api/subscriptionplans/{id}
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(SubscriptionPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdatePlan(int id, [FromBody] UpdateSubscriptionPlanDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });
            }

            var plan = await _subscriptionPlanService.UpdatePlanAsync(id, dto);
            if (plan == null)
            {
                return NotFound(new { success = false, message = "Subscription plan not found" });
            }

            return Ok(new
            {
                success = true,
                message = "Subscription plan updated successfully",
                data = plan
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating subscription plan: {PlanId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Delete a subscription plan (soft delete)
    /// DELETE /api/subscriptionplans/{id}
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeletePlan(int id)
    {
        try
        {
            var result = await _subscriptionPlanService.DeletePlanAsync(id);
            if (!result)
            {
                return NotFound(new { success = false, message = "Subscription plan not found" });
            }

            return Ok(new { success = true, message = "Subscription plan deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting subscription plan: {PlanId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Activate a subscription plan
    /// POST /api/subscriptionplans/{id}/activate
    /// </summary>
    [HttpPost("{id}/activate")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ActivatePlan(int id)
    {
        try
        {
            var result = await _subscriptionPlanService.ActivatePlanAsync(id);
            if (!result)
            {
                return NotFound(new { success = false, message = "Subscription plan not found" });
            }

            return Ok(new { success = true, message = "Subscription plan activated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating subscription plan: {PlanId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Deactivate a subscription plan
    /// POST /api/subscriptionplans/{id}/deactivate
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeactivatePlan(int id)
    {
        try
        {
            var result = await _subscriptionPlanService.DeactivatePlanAsync(id);
            if (!result)
            {
                return NotFound(new { success = false, message = "Subscription plan not found" });
            }

            return Ok(new { success = true, message = "Subscription plan deactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating subscription plan: {PlanId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    #endregion
}

