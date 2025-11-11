using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MamMoi.Application.DTOs.Invitation;
using MamMoi.Application.DTOs;
using MamMoi.Application.DTOs.GardenMember;
using MamMoi.Application.Interfaces;
using MamMoi.Domain.Interfaces;
using System.Security.Claims;

namespace MamMoi.Api.Controllers;

/// <summary>
/// Staff Controller - API quản lý nhân viên
/// Bao gồm: Tạo staff, assign staff, remove staff, view staff lists
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize] // Tất cả endpoints đều yêu cầu authentication
public class StaffController : ControllerBase
{
    private readonly IInvitationService _invitationService;
    private readonly IGardenMemberService _gardenMemberService;
    private readonly IGardenMemberRepository _gardenMemberRepository;
    private readonly ILogger<StaffController> _logger;

    public StaffController(
        IInvitationService invitationService,
        IGardenMemberService gardenMemberService,
        IGardenMemberRepository gardenMemberRepository,
        ILogger<StaffController> logger)
    {
        _invitationService = invitationService;
        _gardenMemberService = gardenMemberService;
        _gardenMemberRepository = gardenMemberRepository;
        _logger = logger;
    }

    #region Staff Management

    /// <summary>
    /// Farmer tạo tài khoản Staff
    /// POST /api/staff/create
    /// </summary>
    [HttpPost("create")]
    [Authorize(Roles = "Farmer")]
    [ProducesResponseType(typeof(CreateStaffResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateStaff([FromBody] CreateStaffDto dto)
    {
        try
        {
            // Lấy UserId từ JWT token
            var farmerId = GetCurrentUserId();
            if (farmerId == null)
            {
                return Unauthorized(new { success = false, message = "Unauthorized" });
            }

            // Sử dụng gardenId = 0 vì không cần validate garden cụ thể khi tạo staff
            var result = await _invitationService.CreateStaffAsync(0, farmerId.Value, dto);

            return Ok(new
            {
                success = true,
                message = "Staff account created successfully",
                data = result
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating staff account");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Farmer assign Staff vào Garden
    /// POST /api/staff/assign/{staffId}
    /// </summary>
    [HttpPost("assign/{staffId}")]
    [Authorize(Roles = "Farmer")]
    [ProducesResponseType(typeof(GardenMemberResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AssignStaff(int staffId, [FromQuery] int gardenId)
    {
        try
        {
            // Lấy UserId từ JWT token
            var farmerId = GetCurrentUserId();
            if (farmerId == null)
            {
                return Unauthorized(new { success = false, message = "Unauthorized" });
            }

            var result = await _invitationService.AssignStaffAsync(gardenId, staffId, farmerId.Value);

            return Ok(new
            {
                success = true,
                message = "Staff assigned to garden successfully",
                data = result
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning staff to garden");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Farmer remove Staff khỏi Garden
    /// DELETE /api/staff/remove/{staffId}
    /// </summary>
    [HttpDelete("remove/{staffId}")]
    [Authorize(Roles = "Farmer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveStaff(int staffId, [FromQuery] int gardenId)
    {
        try
        {
            // Lấy UserId từ JWT token
            var farmerId = GetCurrentUserId();
            if (farmerId == null)
            {
                return Unauthorized(new { success = false, message = "Unauthorized" });
            }

            var result = await _invitationService.RemoveStaffAsync(gardenId, staffId, farmerId.Value);

            if (result)
            {
                return Ok(new
                {
                    success = true,
                    message = "Staff removed from garden successfully"
                });
            }
            else
            {
                return NotFound(new { success = false, message = "Staff assignment not found" });
            }
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing staff from garden");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Staff xem danh sách vườn được assign
    /// GET /api/staff/my-gardens
    /// </summary>
    [HttpGet("my-gardens")]
    [Authorize(Roles = "Staff")]
    [ProducesResponseType(typeof(List<AssignedGardenDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyAssignedGardens()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { success = false, message = "Unauthorized" });
            }

            _logger.LogInformation($"Getting assigned gardens for user {userId}");

            var assignedGardens = await _gardenMemberService.GetMyAssignedGardensAsync(userId.Value);

            _logger.LogInformation($"Found {assignedGardens.Count} assigned gardens for user {userId}");

            return Ok(new
            {
                success = true,
                data = assignedGardens,
                totalGardens = assignedGardens.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting assigned gardens: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Internal server error", details = ex.Message });
        }
    }

    /// <summary>
    /// Farmer xem danh sách Staff trong Garden
    /// GET /api/staff/garden/{gardenId}/members
    /// </summary>
    [HttpGet("garden/{gardenId}/members")]
    [Authorize(Roles = "Farmer")]
    [ProducesResponseType(typeof(GardenMemberListResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetGardenMembers(int gardenId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { success = false, message = "Unauthorized" });
            }

            var members = await _gardenMemberService.GetGardenMembersAsync(gardenId, userId.Value);

            return Ok(new
            {
                success = true,
                data = members
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting garden members");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Farmer xem danh sách Staff inactive
    /// GET /api/staff/inactive
    /// </summary>
    [HttpGet("inactive")]
    [Authorize(Roles = "Farmer")]
    [ProducesResponseType(typeof(List<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInactiveStaff()
    {
        var inactiveStaff = await _invitationService.GetInactiveStaffAsync();
        return Ok(new
        {
            success = true,
            data = inactiveStaff,
            totalInactive = inactiveStaff.Count
        });
    }

    /// <summary>
    /// DEBUG: Check garden members for current user
    /// GET /api/staff/debug-members
    /// </summary>
    [HttpGet("debug-members")]
    [Authorize]
    public async Task<IActionResult> DebugGardenMembers()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { success = false, message = "Unauthorized" });
            }

            var gardenMembers = await _gardenMemberRepository.GetByUserIdAsync(userId.Value);

            return Ok(new
            {
                success = true,
                userId = userId,
                totalMembers = gardenMembers.Count,
                members = gardenMembers.Select(gm => new {
                    memberId = gm.MemberId,
                    gardenId = gm.GardenId,
                    userId = gm.UserId,
                    status = gm.Status,
                    createdAt = gm.CreatedAt
                })
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Internal server error", details = ex.Message });
        }
    }

    #endregion

    #region Helper Methods

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }

        return null;
    }

    #endregion
}