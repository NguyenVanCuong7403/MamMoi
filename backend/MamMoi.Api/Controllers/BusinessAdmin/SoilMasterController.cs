using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace MamMoi.Api.Controllers.Business_Admin
{
    [ApiController]
    [Route("api/business-admin/soil-masters")]
    
    public class SoilMasterController : ControllerBase
    {
        private readonly ISoilMasterService _soilMasterService;

        public SoilMasterController(ISoilMasterService soilMasterService)
        {
            _soilMasterService = soilMasterService;
        }

        // GET /api/soil-masters
        [HttpGet]
        public async Task<IActionResult> GetSoilDropdown()
        {
            var soils = await _soilMasterService.GetSoilMasterDropdownAsync();
            return Ok(soils);
        }

        // GET /api/business-admin/soil-masters/all
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var soils = await _soilMasterService.GetAllAsync();
            return Ok(soils);
        }

        // GET /api/business-admin/soil-masters/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var soil = await _soilMasterService.GetByIdAsync(id);
            if (soil == null) return NotFound();
            return Ok(soil);
        }

        // POST /api/business-admin/soil-masters
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MamMoi.Application.DTOs.SystemAdmin.CreateSoilMasterDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var soil = await _soilMasterService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = soil.SoilMasterID }, soil);
        }

        // PUT /api/business-admin/soil-masters/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] MamMoi.Application.DTOs.SystemAdmin.UpdateSoilMasterDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var soil = await _soilMasterService.UpdateAsync(id, dto);
            if (soil == null) return NotFound();
            return Ok(soil);
        }

        // DELETE /api/business-admin/soil-masters/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _soilMasterService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
