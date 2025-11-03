using Microsoft.AspNetCore.Mvc;
using MamMoi.Application.Interfaces;
using MamMoi.Application.DTOs;

namespace MamMoi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Get all users
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var users = await _userService.GetAllAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all users");
            return StatusCode(500, new { message = "An error occurred while retrieving users" });
        }
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user {UserId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving user" });
        }
    }

    /// <summary>
    /// Create new user
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                message = "Validation failed",
                errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
            });
        }

        try
        {
            var result = await _userService.CreateAsync(dto);
            return Ok(new { message = "User created successfully", user = result });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, new { message = "An error occurred while creating user" });
        }
    }

    /// <summary>
    /// Update user
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                message = "Validation failed",
                errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
            });
        }

        try
        {
            var result = await _userService.UpdateAsync(id, dto);
            if (result == null)
                return NotFound(new { message = "User not found" });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, new { message = "An error occurred while updating user" });
        }
    }

    /// <summary>
    /// Delete user
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var result = await _userService.DeleteAsync(id);
            if (!result)
                return NotFound(new { message = "User not found" });

            return Ok(new { message = "User deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, new { message = "An error occurred while deleting user" });
        }
    }

    /// <summary>
    /// Ban user account - Cấm tài khoản người dùng
    /// Đổi trạng thái IsActive = false, ngăn không cho đăng nhập
    /// </summary>
    /// <param name="userId">ID của người dùng cần ban</param>
    /// <returns>Kết quả thao tác ban account</returns>
    [HttpPost("{userId}/ban")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> BanUser(int userId)
    {
        try
        {
            var result = await _userService.BanUserAsync(userId);
            if (!result)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                message = "User has been banned successfully",
                userId = userId,
                isActive = false
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error banning user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while banning user" });
        }
    }

    /// <summary>
    /// Unban user account - Mở khóa tài khoản người dùng
    /// Đổi trạng thái IsActive = true, cho phép đăng nhập trở lại
    /// </summary>
    /// <param name="userId">ID của người dùng cần unban</param>
    /// <returns>Kết quả thao tác unban account</returns>
    [HttpPost("{userId}/unban")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UnbanUser(int userId)
    {
        try
        {
            var result = await _userService.UnbanUserAsync(userId);
            if (!result)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                message = "User has been unbanned successfully",
                userId = userId,
                isActive = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unbanning user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while unbanning user" });
        }
    }
}
