using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MamMoi.Application.DTOs.SystemAdmin;

namespace MamMoi.Api.Controllers
{
    [ApiController]
    [Route("api/sys-admin/logs")]
    [Authorize(Roles = "System Admin")]
    public class LogsController : ControllerBase
    {
        private readonly IActivityLogService _logService;

        public LogsController(IActivityLogService logService)
        {
            _logService = logService;
        }

        /// <summary>
        /// Get system activity logs (Admin)
        /// </summary>
        /// <param name="userId">Optional: Filter by User ID</param>
        /// <param name="activityType">Optional: Filter by Activity Type (e.g., 'Login')</param>
        /// <param name="startDate">Optional: Start date (YYYY-MM-DD)</param>
        /// <param name="endDate">Optional: End date (YYYY-MM-DD)</param>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ActivityLogDto>), 200)]
        public async Task<IActionResult> GetSystemLogs(
            [FromQuery] int? userId,
            [FromQuery] string? activityType,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var logs = await _logService.GetLogsAsync(userId, activityType, startDate, endDate);
            return Ok(logs);
        }
    }
}