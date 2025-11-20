
using MamMoi.Application.DTOs.BusinessAdmin;
using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MamMoi.Api.Controllers.Business_Admin
{
    [ApiController]
    [Route("api/business-admin/staff")]
    [Authorize(Roles = "Business Admin")]
    public class StaffManagerController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffManagerController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        // READ (Get All)
        // GET /api/staff
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<StaffDto>), 200)]
        public async Task<IActionResult> GetAllStaff()
        {
            var staffList = await _staffService.GetAllStaffAsync();
            return Ok(staffList);
        }

        // READ (Get By ID)
        // GET /api/staff/5
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(StaffDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetStaffById(int id)
        {
            var staff = await _staffService.GetStaffByIdAsync(id);
            if (staff == null) return NotFound(new { Message = "Staff not found." });
            return Ok(staff);
        }

        [HttpGet("performance")]
        [ProducesResponseType(typeof(IEnumerable<StaffPerformanceDto>), 200)]
        public async Task<IActionResult> GetStaffPerformance()
        {
            var metrics = await _staffService.GetStaffPerformanceMetricsAsync();
            return Ok(metrics);
        }
    }
}
