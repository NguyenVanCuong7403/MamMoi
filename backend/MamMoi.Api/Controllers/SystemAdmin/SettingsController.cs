using MamMoi.Application.DTOs.SystemAdmin;
using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MamMoi.Api.Controllers
{
    [ApiController]
    [Route("api/sys-admin/settings")]
    [Authorize(Roles = "System Admin")]
    public class SettingsController : ControllerBase
    {
        private readonly ISystemSettingService _settingService;

        public SettingsController(ISystemSettingService settingService)
        {
            _settingService = settingService;
        }

        /// <summary>
        /// Get all system settings (Admin)
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<SystemSettingDto>), 200)]
        public async Task<IActionResult> GetAllSettings()
        {
            var settings = await _settingService.GetAllSettingsAsync();
            return Ok(settings);
        }

        /// <summary>
        /// Update a setting value (Admin)
        /// </summary>
        /// <param name="key">The SettingKey (e.g., 'MaintenanceMode')</param>
        /// <param name="dto">The new value</param>
        [HttpPut("{key}")]
        [ProducesResponseType(typeof(SystemSettingDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateSetting(string key, [FromBody] UpdateSettingDto dto)
        {
            var adminUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

            if (adminUserId == 0)
            {
                return Unauthorized();
            }

            var updatedSetting = await _settingService.UpdateSettingAsync(key, dto, adminUserId);

            if (updatedSetting == null)
            {
                return NotFound(new { message = $"Không tìm thấy SettingKey: '{key}'" });
            }

            return Ok(updatedSetting);
        }
    }
}