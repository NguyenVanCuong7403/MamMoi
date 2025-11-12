using MamMoi.Application.DTOs.BusinessAdminDto;
using MamMoi.Application.Interfaces; // Cần ISubscriptionPlanService
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MamMoi.Api.Controllers
{
    [ApiController]
    [Route("api/subplans")] 
    [Authorize(Roles = "Business Admin")] 
    public class SubscriptionPlansController : ControllerBase
    {
        private readonly ISubscriptionPlanService _planService;

        public SubscriptionPlansController(ISubscriptionPlanService planService)
        {
            _planService = planService;
        }

       
        // READ (Get By ID)
        // GET /api/subscription-plans/5
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(SubscriptionPlanDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetPlanById(int id)
        {
            var plan = await _planService.GetPlanByIdAsync(id);
            if (plan == null) return NotFound();
            return Ok(plan);
        }

        // CREATE (C)
        // POST /api/subscription-plans
        [HttpPost]
        [ProducesResponseType(typeof(SubscriptionPlanDto), 201)] // 201 Created
        public async Task<IActionResult> CreatePlan(
            [FromBody] SubscriptionPlanCreateUpdateDto dto)
        {
            var newPlan = await _planService.CreatePlanAsync(dto);

            return CreatedAtAction(
                nameof(GetPlanById),
                new { id = newPlan.PlanId },
                newPlan
            );
        }

        // UPDATE (U)
        // PUT /api/subscription-plans/5
        [HttpPut("{id}")]
        [ProducesResponseType(204)] // 204 No Content
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdatePlan(
            int id,
            [FromBody] SubscriptionPlanCreateUpdateDto dto)
        {
            var success = await _planService.UpdatePlanAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}