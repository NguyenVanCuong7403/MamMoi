using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MamMoi.Application.DTOs.Garden;
using MamMoi.Application.Interfaces;
using System.Security.Claims;

namespace MamMoi.Api.Controllers;

/// <summary>
/// Gardens Controller - API quản lý vườn
/// Chỉ tập trung vào CRUD Garden operations
/// Farmer quản lý: Tạo vườn, xem danh sách, xem chi tiết, cập nhật vườn
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize] // Tất cả endpoints đều yêu cầu authentication
public class GardensController : ControllerBase
{
    private readonly IGardenService _gardenService;
    private readonly ILogger<GardensController> _logger;

    public GardensController(
        IGardenService gardenService, 
        ILogger<GardensController> logger)
    {
        _gardenService = gardenService;
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
}
