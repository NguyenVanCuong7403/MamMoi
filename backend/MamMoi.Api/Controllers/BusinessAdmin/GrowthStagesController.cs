using MamMoi.Application.DTOs.SystemAdmin;
using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MamMoi.Api.Controllers.Business_Admin
{
    [ApiController]
    [Route("api/business-admin/growth-stages")]
    [Authorize(Roles = "Business Admin")]
    public class GrowthStagesController : ControllerBase
    {
        private readonly IGrowthStageService _stageService;

        public GrowthStagesController(IGrowthStageService stageService)
        {
            _stageService = stageService;
        }

        // GET /api/growth-stages/tree-type-dropdown
        [HttpGet("tree-type-dropdown")]
        public async Task<IActionResult> GetTreeTypeDropdown()
        {
            var treeTypes = await _stageService.GetTreeTypeDropdownAsync();
            return Ok(treeTypes);
        }

        // GET /api/growth-stages
        // GET /api/growth-stages?treeTypeId=5
        [HttpGet]
        public async Task<IActionResult> GetAllGrowthStages([FromQuery] int? treeTypeId)
        {
            var stages = await _stageService.GetAllGrowthStagesAsync(treeTypeId);
            return Ok(stages);
        }

        // GET /api/growth-stages/10
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(GrowthStageDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetGrowthStageById(int id)
        {
            var stage = await _stageService.GetGrowthStageByIdAsync(id);
            if (stage == null) return NotFound();
            return Ok(stage);
        }

        // POST /api/growth-stages
        [HttpPost]
        [ProducesResponseType(typeof(GrowthStageDto), 201)]
        public async Task<IActionResult> CreateGrowthStage(
            [FromBody] GrowthStageCreateUpdateDto dto)
        {
            var newStage = await _stageService.CreateGrowthStageAsync(dto);
            return CreatedAtAction(nameof(GetGrowthStageById),
                new { id = newStage.StageID }, newStage);
        }

        // PUT /api/growth-stages/10
        [HttpPut("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateGrowthStage(
            int id, [FromBody] GrowthStageCreateUpdateDto dto)
        {
            var success = await _stageService.UpdateGrowthStageAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        // DELETE /api/growth-stages/10 
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteGrowthStage(int id)
        {
            var success = await _stageService.DeleteGrowthStageAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
