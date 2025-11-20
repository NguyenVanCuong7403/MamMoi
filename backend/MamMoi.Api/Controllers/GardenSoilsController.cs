
using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MamMoi.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GardenSoilsController : ControllerBase
    {
        private readonly IGardenSoilService _gardenSoilService;
        public GardenSoilsController(IGardenSoilService gardenSoilService)
        {
            _gardenSoilService = gardenSoilService;
        }

        /// <summary>
        /// Lấy toàn bộ loại đất (mọi vườn)
        /// GET /api/gardensoils
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var items = await _gardenSoilService.GetAllAsync(ct);
            return Ok(items);
        }

        /// <summary>
        /// Lấy 1 loại đất theo id
        /// GET /api/gardensoils/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken ct)
        {
            var item = await _gardenSoilService.GetByIdAsync(id, ct);
            if (item is null) return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Lấy danh sách soil của 1 vườn
        /// GET /api/gardensoils/by-garden/{gardenId}
        /// </summary>
        [HttpGet("by-garden/{gardenId:int}")]
        public async Task<IActionResult> GetByGarden([FromRoute] int gardenId, CancellationToken ct)
        {
            var items = await _gardenSoilService.GetByGardenAsync(gardenId, ct);
            return Ok(items);
        }

        /// <summary>
        /// Lấy danh sách soil của 1 vườn
        /// GET /api/gardensoils/by-garden/{gardenId}
        /// </summary>
        [HttpGet("by-type/{treeId:int}")]
        public async Task<IActionResult> GetByTreeTypeInGarden([FromRoute] int typeId, [FromRoute] int gardenId, CancellationToken ct)
        {
            var items = await _gardenSoilService.GetByTreeTypeInGardenAsync(typeId, gardenId, ct);
            return Ok(items);
        }

        /// <summary>
        /// Lấy danh sách soil của 1 vườn
        /// GET /api/gardensoils/by-garden/{gardenId}
        /// </summary>
        [HttpGet("by-tree/{treeId:int}")]
        public async Task<IActionResult> GetByTree([FromRoute] int treeId, CancellationToken ct)
        {
            var items = await _gardenSoilService.GetByTreeAsync(treeId, ct);
            return Ok(items);
        }
    }
}
