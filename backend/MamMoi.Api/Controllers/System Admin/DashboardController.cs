using MamMoi.Application.DTOs.SystemAdminDto;
using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MamMoi.Api.Controllers
{
    [ApiController]
    [Route("api/admin/dashboard")]
    [Authorize(Roles = "System Admin")] 
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Get system statistics (Admin Dashboard)
        /// </summary>
        [HttpGet("statistics")]
        [ProducesResponseType(typeof(SystemStatisticsDto), 200)]
        public async Task<IActionResult> GetSystemStatistics()
        {
            var stats = await _dashboardService.GetSystemStatisticsAsync();
            return Ok(stats);
        }
    }
}