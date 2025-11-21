using MamMoi.Application.DTOs.SystemAdmin;
using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MamMoi.Api.Controllers.SystemAdmin
{
    [ApiController]
    [Route("api/sys-admin/users")]
    [Authorize(Roles = "SystemAdmin")]
    public class SysAdminUsersController : ControllerBase
    {
        private readonly ISysAdminUserService _service;

        public SysAdminUsersController(ISysAdminUserService service)
        {
            _service = service;
        }

        // GET: api/sys-admin/users
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] SysUserFilterDto filter)
        {
            var result = await _service.GetUsersAsync(filter);
            return Ok(result);
        }

        // GET: api/sys-admin/users/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _service.GetUserByIdAsync(id);
            if (user == null) return NotFound("User not found");
            return Ok(user);
        }

        // GET: api/sys-admin/users/{id}/details
        [HttpGet("{id}/details")]
        public async Task<IActionResult> GetDetails(int id)
        {
            var user = await _service.GetUserDetailAsync(id);
            if (user == null) return NotFound("User not found");
            return Ok(user);
        }

        // POST: api/sys-admin/users
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SysUserCreateDto dto)
        {
            try
            {
                var result = await _service.CreateUserAsync(dto);
                // SỬA: route values dùng int
                return CreatedAtAction(nameof(GetById), new { id = result.UserId }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/sys-admin/users/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SysUserUpdateDto dto)
        {
            var success = await _service.UpdateUserAsync(id, dto);
            if (!success) return NotFound("User not found");
            return Ok(new { message = "Update successful" });
        }

        // PATCH: api/sys-admin/users/{id}/toggle-status
        [HttpPatch("{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var success = await _service.ToggleUserStatusAsync(id);
            if (!success) return NotFound("User not found");
            return Ok(new { message = "User status toggled successfully" });
        }

        // DELETE: api/sys-admin/users/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _service.DeleteUserPermanentAsync(id);
                if (!success) return NotFound("User not found");
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}