using MamMoi.Application.DTOs;
using MamMoi.Application.DTOs.BusinessAdminDto;
using MamMoi.Application.Interfaces; 
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MamMoi.Api.Controllers.Business_Admin
{
    [ApiController]
    [Route("api/staff")] 
    [Authorize(Roles = "Business Admin")]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
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
