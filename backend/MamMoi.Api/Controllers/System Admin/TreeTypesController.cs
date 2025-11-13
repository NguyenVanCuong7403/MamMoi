using MamMoi.Application.DTOs.SystemAdminDto;
using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace MamMoi.Api.Controllers.System_Admin
{
    [ApiController]
    [Route("api/tree-types")]
    //[Authorize(Roles = "System Admin")]
    public class TreeTypesController : ControllerBase
    {
        private readonly ITreeTypeService _treeTypeService;

        public TreeTypesController(ITreeTypeService treeTypeService)
        {
            _treeTypeService = treeTypeService;
        }

        // GET /api/tree-types
        [HttpGet]
        public async Task<IActionResult> GetAllTreeTypes()
        {
            var treeTypes = await _treeTypeService.GetAllTreeTypesAsync();
            return Ok(treeTypes);
        }

        // GET /api/tree-types/5
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(TreeTypeDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetTreeTypeById(int id)
        {
            var treeType = await _treeTypeService.GetTreeTypeByIdAsync(id);
            if (treeType == null) return NotFound();
            return Ok(treeType);
        }

        // POST /api/tree-types
        [HttpPost]
        [ProducesResponseType(typeof(TreeTypeDto), 201)]
        public async Task<IActionResult> CreateTreeType([FromBody] TreeTypeCreateUpdateDto dto)
        {
            var newTreeType = await _treeTypeService.CreateTreeTypeAsync(dto);
            return CreatedAtAction(nameof(GetTreeTypeById),
                new { id = newTreeType.TreeTypeID }, newTreeType);
        }

        // PUT /api/tree-types/5
        [HttpPut("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateTreeType(int id, [FromBody] TreeTypeCreateUpdateDto dto)
        {
            var success = await _treeTypeService.UpdateTreeTypeAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        // DELETE /api/tree-types/5 (Soft Delete 100%)
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteTreeType(int id)
        {
            var success = await _treeTypeService.DeleteTreeTypeAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
