using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MamMoi.Application.DTOs.Garden;
using MamMoi.Application.DTOs.Invitation;
using MamMoi.Application.Interfaces;
using System.Security.Claims;

namespace MamMoi.Api.Controllers;

/// <summary>
/// Gardens Controller - API quản lý vườn
/// Bao gồm: Tạo vườn, xem danh sách, xem chi tiết, cập nhật vườn
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize] // Tất cả endpoints đều yêu cầu authentication
public class GardensController : ControllerBase
{
    private readonly IGardenService _gardenService;
    private readonly IInvitationService _invitationService;
    private readonly ILogger<GardensController> _logger;

    public GardensController(
        IGardenService gardenService, 
        IInvitationService invitationService,
        ILogger<GardensController> logger)
    {
        _gardenService = gardenService;
        _invitationService = invitationService;
        _logger = logger;
    }

    /// <summary>
    /// CHỨC NĂNG 1: Tạo vườn mới
    /// POST /api/gardens
    /// Chỉ Farmer (RoleId = 4) mới được tạo vườn
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateGarden([FromBody] CreateGardenDto dto)
    {
        try
        {
            // Lấy UserId từ JWT token
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Không tìm thấy thông tin user trong token."
                });
            }

            var result = await _gardenService.CreateGardenAsync(userId.Value, dto);
            
            return CreatedAtAction(
                nameof(GetGardenById), 
                new { id = result.GardenId }, 
                new
                {
                    success = true,
                    message = "Tạo vườn thành công!",
                    data = result
                });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid(); // 403 - User không có quyền
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating garden");
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi khi tạo vườn. Vui lòng thử lại sau."
            });
        }
    }

    /// <summary>
    /// CHỨC NĂNG 2: Lấy danh sách vườn của user (có phân trang + search)
    /// GET /api/gardens?pageNumber=1&pageSize=10&searchTerm=abc
    /// Farmer: xem vườn mình sở hữu
    /// Staff: xem vườn được assign
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetGardens(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Không tìm thấy thông tin user trong token."
                });
            }

            var result = await _gardenService.GetGardensAsync(
                userId.Value, pageNumber, pageSize, searchTerm);

            return Ok(new
            {
                success = true,
                data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting gardens");
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi khi lấy danh sách vườn. Vui lòng thử lại sau."
            });
        }
    }

    /// <summary>
    /// CHỨC NĂNG 3: Lấy chi tiết 1 vườn
    /// GET /api/gardens/{id}
    /// User phải có quyền truy cập (Owner hoặc Member)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetGardenById(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Không tìm thấy thông tin user trong token."
                });
            }

            var result = await _gardenService.GetGardenByIdAsync(id, userId.Value);
            
            return Ok(new
            {
                success = true,
                data = result
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid(); // 403 - User không có quyền truy cập vườn này
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting garden by id");
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi khi lấy thông tin vườn. Vui lòng thử lại sau."
            });
        }
    }

    /// <summary>
    /// CHỨC NĂNG 4: Cập nhật thông tin vườn
    /// PUT /api/gardens/{id}
    /// Chỉ Owner mới được update
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGarden(int id, [FromBody] UpdateGardenDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Không tìm thấy thông tin user trong token."
                });
            }

            var result = await _gardenService.UpdateGardenAsync(id, userId.Value, dto);
            
            return Ok(new
            {
                success = true,
                message = "Cập nhật vườn thành công!",
                data = result
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid(); // 403 - Chỉ Owner mới được update
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating garden");
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi khi cập nhật vườn. Vui lòng thử lại sau."
            });
        }
    }

    #region Helper Methods

    /// <summary>
    /// Helper: Lấy UserId từ JWT Claims
    /// </summary>
    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return null;
        }

        if (int.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }

        return null;
    }

    #endregion

    #region Module 9: Staff Management (Create Staff)

    /// <summary>
    /// Farmer tạo tài khoản Staff
    /// POST /api/gardens/create-staff
    /// </summary>
    [HttpPost("create-staff")]
    [ProducesResponseType(typeof(CreateStaffResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateStaff([FromBody] CreateStaffDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid token" });

            // Sử dụng gardenId = 0 vì không cần validate garden cụ thể
            var result = await _invitationService.CreateStaffAsync(0, userId.Value, dto);

            _logger.LogInformation("User {UserId} created staff {Email}",
                userId, dto.Email);

            return Ok(new
            {
                success = true,
                message = result.Message,
                data = result
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating staff");
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi khi tạo staff. Vui lòng thử lại sau."
            });
        }
    }

    /// <summary>
    /// Farmer assign staff vào vườn
    /// POST /api/gardens/{id}/assign-staff?staffId=123
    /// </summary>
    [HttpPost("{id}/assign-staff")]
    [ProducesResponseType(typeof(GardenMemberResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AssignStaff(int id, [FromQuery] int staffId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid token" });

            var result = await _invitationService.AssignStaffAsync(id, staffId, userId.Value);

            _logger.LogInformation("User {UserId} assigned staff {StaffId} to garden {GardenId}",
                userId, staffId, id);

            return Ok(new
            {
                success = true,
                message = $"Staff {result.FullName} đã được assign vào vườn {result.GardenName}",
                data = result
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning staff");
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi khi assign staff. Vui lòng thử lại sau."
            });
        }
    }

    /// <summary>
    /// Farmer remove staff khỏi vườn
    /// DELETE /api/gardens/{id}/remove-staff/{staffId}
    /// </summary>
    [HttpDelete("{id}/remove-staff/{staffId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveStaff(int id, int staffId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "Invalid token" });

            await _invitationService.RemoveStaffAsync(id, staffId, userId.Value);

            _logger.LogInformation("User {UserId} removed staff {StaffId} from garden {GardenId}",
                userId, staffId, id);

            return Ok(new
            {
                success = true,
                message = "Staff đã được remove khỏi vườn thành công"
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing staff");
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi khi remove staff. Vui lòng thử lại sau."
            });
        }
    }

    /// <summary>
    /// Lấy danh sách members của vườn
    /// GET /api/gardens/{id}/members
    /// </summary>
    [HttpGet("{id}/members")]
    [ProducesResponseType(typeof(List<GardenMemberResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGardenMembers(int id)
    {
        var members = await _invitationService.GetGardenMembersAsync(id);
        return Ok(members);
    }

    #endregion
}
