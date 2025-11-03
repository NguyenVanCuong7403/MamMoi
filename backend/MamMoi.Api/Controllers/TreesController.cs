using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using MamMoi.Application.Interfaces;
using MamMoi.Application.DTOs;

namespace MamMoi.Api.Controllers;

[ApiController]
[Route("api/trees")]
public class TreesController : ControllerBase
{
    private readonly ITreeQueryService _treeQuery;
    private readonly ITreeTypeService _treeType;
    private readonly ITreeCommandService _treeCmd;
    private readonly ITreeImageService _treeImg;

    public TreesController(
        ITreeQueryService treeQuery,
        ITreeTypeService treeType,
        ITreeCommandService treeCmd,
        ITreeImageService treeImg)
    {
        _treeQuery = treeQuery;
        _treeType = treeType;
        _treeCmd = treeCmd;
        _treeImg = treeImg;
    }

    // Helper: lấy userId từ JWT (sub/NameIdentifier). Không có -> null
    private int? GetUserIdFromClaims()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        return int.TryParse(idClaim?.Value, out var id) ? id : (int?)null;
    }

    // ===================== 1) Tree Types List =====================
    // GET /api/trees/types
    [HttpGet("types")]
    public async Task<IActionResult> GetTreeTypes(CancellationToken ct)
        => Ok(await _treeType.GetAllAsync(ct));

    // ===================== 2) View My Trees List =====================
    // GET /api/trees/my?userId=1&page=1&pageSize=20&sort=createdAt_desc&gardenId=&treeTypeId=&isActive=true
    [HttpGet("my")]
    public async Task<IActionResult> GetMyTrees(
        [FromQuery] int? userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sort = "createdAt_desc",
        [FromQuery] int? gardenId = null,
        [FromQuery] int? treeTypeId = null,
        [FromQuery] bool? isActive = null,
        CancellationToken ct = default)
    {
        var uid = GetUserIdFromClaims() ?? userId;
        if (uid is null || uid <= 0)
            return BadRequest("Vui lòng truyền userId (query) hoặc gửi kèm JWT hợp lệ.");

        var result = await _treeQuery.GetMyTreesAsync(
            uid.Value, page, pageSize, sort, gardenId, treeTypeId, isActive, ct);

        return Ok(result);
    }

    // ===================== 3) Search Trees =====================
    // GET /api/trees/search?q=cam&gardenId=&treeTypeId=&page=1&pageSize=20
    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] string q = "",
        [FromQuery] int? gardenId = null,
        [FromQuery] int? treeTypeId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await _treeQuery.SearchAsync(q, gardenId, treeTypeId, page, pageSize, ct);
        return Ok(result);
    }

    // ===================== 4) View Tree Detail =====================
    // GET /api/trees/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetDetail([FromRoute] int id, CancellationToken ct)
    {
        // public detail -> currentUserId: null (nếu muốn chỉ owner xem, truyền GetUserIdFromClaims())
        var dto = await _treeQuery.GetDetailAsync(id, currentUserId: null, ct);
        if (dto is null) return NotFound();
        return Ok(dto);
    }

    // ===================== 5) Add New Tree =====================
    // POST /api/trees
    // body: CreateTreeRequest
    [HttpPost]
    // [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateTreeRequest req, CancellationToken ct)
    {
        // Dev fallback: nếu chưa có JWT, cho phép truyền userId qua query ?userId=1
        var userId = GetUserIdFromClaims() ?? int.Parse(Request.Query["userId"]);
        var created = await _treeCmd.CreateAsync(userId, req, ct);
        return CreatedAtAction(nameof(GetDetail), new { id = created.TreeId }, created);
    }

    // ===================== 6) Edit Tree Information =====================
    // PUT /api/trees/{id}
    [HttpPut("{id:int}")]
    // [Authorize]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateTreeRequest req, CancellationToken ct)
    {
        var userId = GetUserIdFromClaims() ?? int.Parse(Request.Query["userId"]);
        var dto = await _treeCmd.UpdateAsync(userId, id, req, ct);
        if (dto is null) return NotFound();
        return Ok(dto);
    }

    // ===================== 7) Update Tree Status =====================
    // PATCH /api/trees/{id}/status
    [HttpPatch("{id:int}/status")]
    // [Authorize]
    public async Task<IActionResult> UpdateStatus([FromRoute] int id, [FromBody] UpdateTreeStatusRequest req, CancellationToken ct)
    {
        var userId = GetUserIdFromClaims() ?? int.Parse(Request.Query["userId"]);
        var ok = await _treeCmd.UpdateStatusAsync(userId, id, req, ct);
        return ok ? NoContent() : NotFound();
    }

    // ===================== 8) Delete Tree =====================
    // DELETE /api/trees/{id}
    [HttpDelete("{id:int}")]
    // [Authorize]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken ct)
    {
        var userId = GetUserIdFromClaims() ?? int.Parse(Request.Query["userId"]);
        var ok = await _treeCmd.DeleteAsync(userId, id, ct);
        return ok ? NoContent() : NotFound();
    }

    // ===================== 9) Tree Image Gallery =====================
    // GET /api/trees/{id}/images
    [HttpGet("{id:int}/images")]
    public async Task<IActionResult> GetImages([FromRoute] int id, CancellationToken ct)
        => Ok(await _treeImg.GetGalleryAsync(id, ct));

    // ===================== 10) Upload Tree Images (URL-based) =====================
    // POST /api/trees/{id}/images
    [HttpPost("{id:int}/images")]
    // [Authorize]
    public async Task<IActionResult> UploadImage([FromRoute] int id, [FromBody] UploadTreeImageRequest req, CancellationToken ct)
    {
        var userId = GetUserIdFromClaims() ?? int.Parse(Request.Query["userId"]);
        var dto = await _treeImg.AddImageAsync(userId, id, req, ct);
        return Ok(dto);
    }

    // ===================== 11) Delete Tree Image =====================
    // DELETE /api/trees/{id}/images/{imageId}
    [HttpDelete("{id:int}/images/{imageId:int}")]
    // [Authorize]
    public async Task<IActionResult> DeleteImage([FromRoute] int id, [FromRoute] int imageId, CancellationToken ct)
    {
        var userId = GetUserIdFromClaims() ?? int.Parse(Request.Query["userId"]);
        var ok = await _treeImg.DeleteImageAsync(userId, id, imageId, ct);
        return ok ? NoContent() : NotFound();
    }

    // ===================== 12) View Tree Growth History =====================
    // GET /api/trees/{id}/growth-history
    [HttpGet("{id:int}/growth-history")]
    public async Task<IActionResult> GrowthHistory([FromRoute] int id, CancellationToken ct)
        => Ok(await _treeImg.GetGrowthHistoryAsync(id, ct));

    // ===================== 13) Tree Growth Chart =====================
    // GET /api/trees/{id}/growth-chart?from=&to=
    [HttpGet("{id:int}/growth-chart")]
    public async Task<IActionResult> GrowthChart([FromRoute] int id, [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
        => Ok(await _treeImg.GetGrowthChartAsync(id, from, to, ct));

    // ===================== 14) View Tree Growth Stages =====================
    // GET /api/trees/{id}/stages
    [HttpGet("{id:int}/stages")]
    public async Task<IActionResult> Stages([FromRoute] int id, CancellationToken ct)
        => Ok(await _treeImg.GetStagesForTreeAsync(id, ct));
}
