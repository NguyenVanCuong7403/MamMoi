using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MamMoi.Application.DTOs.SupportRequest;
using MamMoi.Application.Interfaces;
using System.Security.Claims;

namespace MamMoi.Api.Controllers;

/// <summary>
/// Support Requests Controller - API cho user tạo và xem các request/report
/// </summary>
[ApiController]
[Route("api/support-requests")]
[Authorize]
public class SupportRequestsController : ControllerBase
{
    private readonly ISupportRequestService _supportRequestService;
    private readonly ILogger<SupportRequestsController> _logger;

    public SupportRequestsController(
        ISupportRequestService supportRequestService,
        ILogger<SupportRequestsController> logger)
    {
        _supportRequestService = supportRequestService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new support request
    /// POST /api/support-requests
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SupportRequestDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateRequest([FromBody] CreateSupportRequestDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            // Auto-map category to priority if priority is not provided
            if (string.IsNullOrWhiteSpace(dto.Priority) && !string.IsNullOrWhiteSpace(dto.Category))
            {
                dto.Priority = dto.Category.ToLower() switch
                {
                    "payment" => "High",
                    "auth" => "High",
                    "system" => "Medium",
                    "tree" => "Medium",
                    _ => "Normal"
                };
            }

            // Default to Normal if still not set
            if (string.IsNullOrWhiteSpace(dto.Priority))
            {
                dto.Priority = "Normal";
            }

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var request = await _supportRequestService.CreateRequestAsync(userId, dto);

            return CreatedAtAction(
                nameof(GetRequestById),
                new { id = request.RequestId },
                new { success = true, message = "Support request created successfully", data = request });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating support request");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get user's own support requests
    /// GET /api/support-requests
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserRequests(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null)
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var (requests, totalCount) = await _supportRequestService.GetUserRequestsAsync(userId, page, pageSize, status);

            return Ok(new
            {
                success = true,
                data = requests,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user support requests");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get support request by ID
    /// GET /api/support-requests/{id}
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(SupportRequestDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRequestById(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var request = await _supportRequestService.GetRequestByIdAsync(id, userId);

            if (request == null)
                return NotFound(new { success = false, message = "Support request not found" });

            return Ok(new { success = true, data = request });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting support request: {RequestId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Submit feedback for resolved support request
    /// POST /api/support-requests/{id}/feedback
    /// </summary>
    [HttpPost("{id}/feedback")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitFeedback(int id, [FromBody] SupportRequestFeedbackDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _supportRequestService.SubmitFeedbackAsync(id, userId, dto);

            if (!result)
                return NotFound(new { success = false, message = "Support request not found or not eligible for feedback" });

            return Ok(new { success = true, message = "Feedback submitted successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting feedback for request: {RequestId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }
}

