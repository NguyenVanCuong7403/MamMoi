using Microsoft.AspNetCore.Mvc;
using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using MamMoi.Application.DTOs.SystemAdminDto;

namespace MamMoi.Api.Controllers;

[ApiController]
[Route("api/admin/[controller]")]
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
    [Authorize(Roles = "SystemAdmin")] 
    [ProducesResponseType(typeof(IEnumerable<UserDto>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] string? searchName, [FromQuery] string? email, [FromQuery] int? roleId)
    {
        var users = await _userService.GetAllAsync(searchName, email, roleId);
        return Ok(users);
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "System Admin")]
    [ProducesResponseType(typeof(UserDetailDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null)
            return NotFound();
        
        return Ok(user);
    }

    /// <summary>
    /// Create new user
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "System Admin")] 
    [ProducesResponseType(typeof(UserDto), 201)] 
    [ProducesResponseType(400)] 
    [ProducesResponseType(409)] 
    public async Task<IActionResult> Create([FromBody] CreateUserDto createDto) 
    {
        
        try
        {
            var createdUser = await _userService.CreateAsync(createDto);

            
            return CreatedAtAction(
                nameof(GetById),
                new { id = createdUser.Id }, 
                createdUser
            );
        }
        catch (ArgumentException ex) 
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex) 
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo user mới");
            return StatusCode(500, new { message = "Lỗi server nội bộ" });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "System Admin")] 
    [ProducesResponseType(typeof(UserDetailDto), 200)] 
    [ProducesResponseType(404)] 
    [ProducesResponseType(400)] 
    public async Task<IActionResult> Update(Guid id, [FromBody] AdminUpdateUserDto updateDto) 
    {
        try
        {
            var updatedUser = await _userService.UpdateAsync(id, updateDto);

            if (updatedUser == null)
            {
                return NotFound(new { message = "Không tìm thấy tài khoản" });
            }

            return Ok(updatedUser);
        }
        catch (Exception ex) 
        {
            _logger.LogError(ex, "Lỗi khi cập nhật user");
            return StatusCode(500, new { message = "Lỗi server nội bộ" });
        }
    }
    /// <summary>
    /// Delete user
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "System Admin")] 
    [ProducesResponseType(204)]
    [ProducesResponseType(404)] 
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var result = await _userService.DeleteAsync(id);

            if (result == false)
            {
                
                return NotFound(new { message = "Không tìm thấy tài khoản để xóa" });
            }

           
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa user");

            if (ex.InnerException != null && ex.InnerException.Message.Contains("REFERENCE constraint"))
            {
                return Conflict(new { message = "Không thể xóa: Tài khoản này đang được sử dụng ở dữ liệu khác (ví dụ: chủ vườn)." });
            }

            return StatusCode(500, new { message = "Lỗi server nội bộ" });
        }
    }

    [HttpPut("{id}/password")]
    [Authorize(Roles = "System Admin")] 
    [ProducesResponseType(204)] 
    [ProducesResponseType(404)] 
    [ProducesResponseType(400)] 
    public async Task<IActionResult> ResetPassword(Guid id, [FromBody] AdminResetPasswordDto dto)
    {
        try
        {
            var result = await _userService.ResetPasswordAsync(id, dto);

            if (result == false)
            {
                return NotFound(new { message = "Không tìm thấy tài khoản" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi reset password");
            return StatusCode(500, new { message = "Lỗi server nội bộ" });
        }
    }
}
