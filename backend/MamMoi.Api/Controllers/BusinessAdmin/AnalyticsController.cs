using MamMoi.Application.DTOs;
using MamMoi.Application.DTOs.BusinessAdmin;
using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace MamMoi.Api.Controllers.Business_Admin
{

    [ApiController]
    [Route("api/business-admin/analytics")]
    [Authorize(Roles = "Business Admin")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }
        /// <summary>
        /// Get Revenue Analytics Dashboard (Business Admin)
        /// </summary>
        [HttpGet("revenue")]
        [ProducesResponseType(typeof(AnalyticsDashboardDto), 200)]
        public async Task<IActionResult> GetRevenueAnalytics()
        {
            var data = await _analyticsService.GetRevenueAnalyticsAsync();
            return Ok(data);
        }
    }
}
