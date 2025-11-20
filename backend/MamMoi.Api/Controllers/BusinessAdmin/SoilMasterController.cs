using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace MamMoi.Api.Controllers.Business_Admin
{
    [ApiController]
    [Route("api/business-admin/soil-masters")]
    [Authorize(Roles = "Business Admin")] 
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
    }
}
