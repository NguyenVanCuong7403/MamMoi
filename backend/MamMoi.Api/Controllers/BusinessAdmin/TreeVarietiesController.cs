using MamMoi.Application.DTOs.BusinessAdmin;
using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MamMoi.Api.Controllers.BusinessAdmin
{
    [ApiController]
    [Route("api/business-admin/tree-varieties")]
    public class TreeVarietiesController : ControllerBase
    {
        private readonly ITreeVarietyService _treeVarietyService;

        public TreeVarietiesController(ITreeVarietyService treeVarietyService)
        {
            _treeVarietyService = treeVarietyService;
        }

        // GET /api/business-admin/tree-varieties
        [HttpGet]
        public async Task<IActionResult> GetAllTreeVarieties()
        {
            var treeVarieties = await _treeVarietyService.GetAllTreeVarietiesAsync();
            return Ok(treeVarieties);
        }

        // GET /api/business-admin/tree-varieties/5
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(TreeVarietyDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetTreeVarietyById(int id)
        {
            var treeVariety = await _treeVarietyService.GetTreeVarietyByIdAsync(id);
            if (treeVariety == null) return NotFound();
            return Ok(treeVariety);
        }

        // GET /api/business-admin/tree-varieties/tree-type/5
        [HttpGet("tree-type/{treeTypeId}")]
        public async Task<IActionResult> GetTreeVarietiesByTreeType(int treeTypeId)
        {
            var treeVarieties = await _treeVarietyService.GetTreeVarietiesByTreeTypeAsync(treeTypeId);
            return Ok(treeVarieties);
        }

        // POST /api/business-admin/tree-varieties
        [HttpPost]
        [ProducesResponseType(typeof(TreeVarietyDto), 201)]
        public async Task<IActionResult> CreateTreeVariety([FromBody] TreeVarietyCreateUpdateDto dto)
        {
            var newTreeVariety = await _treeVarietyService.CreateTreeVarietyAsync(dto);
            return CreatedAtAction(nameof(GetTreeVarietyById),
                new { id = newTreeVariety.VarietyId }, newTreeVariety);
        }

        // PUT /api/business-admin/tree-varieties/5
        [HttpPut("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateTreeVariety(int id, [FromBody] TreeVarietyCreateUpdateDto dto)
        {
            var success = await _treeVarietyService.UpdateTreeVarietyAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        // DELETE /api/business-admin/tree-varieties/5
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteTreeVariety(int id)
        {
            var success = await _treeVarietyService.DeleteTreeVarietyAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}