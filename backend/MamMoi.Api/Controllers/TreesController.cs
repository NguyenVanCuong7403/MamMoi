using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using MamMoi.Application.Interfaces;
using MamMoi.Application.DTOs;
using System.Linq; // <- nhớ có namespace này để dùng FirstOrDefault

namespace MamMoi.Api.Controllers;

[ApiController]
[Route("api/trees")]
public class TreesController : ControllerBase
{
    private readonly ITreeQueryService _treeQuery;
    private readonly ITreeTypeService _treeType;
    private readonly ITreeVarietyService _treeVariety;
    private readonly ITreeCommandService _treeCmd;
    private readonly ITreeImageService _treeImg;
    private readonly IAiRecommendationService _aiRecommendationService;

    public TreesController(
        ITreeQueryService treeQuery,
        ITreeTypeService treeType,
        ITreeVarietyService treeVariety,
        ITreeCommandService treeCmd,
        ITreeImageService treeImg,
        IAiRecommendationService aiRecommendationService)
    {
        _treeQuery = treeQuery;
        _treeType = treeType;
        _treeVariety = treeVariety;
        _treeCmd = treeCmd;
        _treeImg = treeImg;
        _aiRecommendationService = aiRecommendationService;
    }

    private int? GetUserIdFromClaims()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        return int.TryParse(idClaim?.Value, out var id) ? id : (int?)null;
    }


    /// <summary>
    /// Helper: Lấy UserId từ JWT Claims
    /// </summary>
    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return null;
        }

        if (int.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }

        return null;
    }

    // Helper an toàn: lấy userId từ JWT hoặc ?userId=; nếu thiếu thì trả 400
    private bool TryResolveUserId(out int userId, out IActionResult? errorResult)
    {
        var fromJwt = GetUserIdFromClaims();
        if (fromJwt is int uid && uid > 0)
        {
            userId = uid;
            errorResult = null;
            return true;
        }

        var q = HttpContext?.Request?.Query["userId"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(q) && int.TryParse(q, out var parsed) && parsed > 0)
        {
            userId = parsed;
            errorResult = null;
            return true;
        }

        userId = 0;
        errorResult = BadRequest("Thiếu userId: hãy gửi JWT hợp lệ hoặc thêm ?userId={id}.");
        return false;
    }

    // ===================== 1) Tree Types =====================
    [HttpGet("types")]
    public async Task<IActionResult> GetTreeTypes(CancellationToken ct)
        => Ok(await _treeType.GetAllAsync(ct));

    // ===================== 1) Tree Variety =====================
    [HttpGet("varieties")]
    public async Task<IActionResult> GetTreeVarieties(
        [FromQuery] int? treeTypeId = null,
        CancellationToken ct = default)
        => Ok(await _treeVariety.GetAllAsync(treeTypeId, ct));

    // ===================== 2) My Trees =====================
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
        var uid = GetCurrentUserId() ?? userId;
        if (uid is null || uid <= 0)
            return BadRequest("Vui lòng truyền userId (query) hoặc gửi JWT hợp lệ.");

        var result = await _treeQuery.GetMyTreesAsync(
            uid.Value, page, pageSize, sort, gardenId, treeTypeId, isActive, ct);

        return Ok(result);
    }

    // ===================== 3) Search =====================
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

    // ===================== 4) Detail =====================
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetDetail([FromRoute] int id, CancellationToken ct)
    {
        var dto = await _treeQuery.GetDetailAsync(id, currentUserId: null, ct);
        if (dto is null) return NotFound();
        return Ok(dto);
    }

    // ===================== 4.5) Get Lifecycle =====================
    /// <summary>
    /// Get tree lifecycle information (phase, stage, cycle count)
    /// </summary>
    [HttpGet("{id:int}/lifecycle")]
    public async Task<IActionResult> GetLifecycle([FromRoute] int id, CancellationToken ct)
    {
        // Allow viewing any tree (similar to GetDetail)
        // If you want to restrict to owner only, use: var currentUserId = GetCurrentUserId();
        var dto = await _treeQuery.GetLifecycleAsync(id, currentUserId: null, ct);
        if (dto is null) return NotFound();
        return Ok(dto);
    }

    // ===================== 5) Create =====================
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTreeRequest req, CancellationToken ct)
    {
        if (!TryResolveUserId(out var userId, out var error)) return error!;
        var created = await _treeCmd.CreateAsync(userId, req, ct);
        return CreatedAtAction(nameof(GetDetail), new { id = created.TreeId }, created);
    }

    // ===================== 6) Update =====================
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateTreeRequest req, CancellationToken ct)
    {
        if (!TryResolveUserId(out var userId, out var error)) return error!;
        var dto = await _treeCmd.UpdateAsync(userId, id, req, ct);
        if (dto is null) return NotFound();
        return Ok(dto);
    }

    /// <summary>
    /// Lấy gợi ý/khuyến nghị AI cho cây tại một ngày cụ thể.
    /// GET api/trees/{id}/recommendation?forDate=2025-11-23
    /// </summary>
    [HttpGet("{id:int}/recommendation")]
    public async Task<IActionResult> GetAiRecommendation([FromRoute] int id, [FromQuery] string? forDate, CancellationToken ct = default)
    {
        // parse forDate (DateOnly) - nếu không có thì dùng ngày hiện tại (UTC date)
        DateOnly targetDate;
        if (string.IsNullOrWhiteSpace(forDate))
        {
            var utcToday = DateTime.UtcNow.Date;
            targetDate = DateOnly.FromDateTime(utcToday);
        }
        else
        {
            if (!DateOnly.TryParse(forDate, out targetDate))
            {
                // cố gắng parse theo ISO yyyy-MM-dd nếu TryParse không thành công
                if (!DateOnly.TryParseExact(forDate, "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out targetDate))
                {
                    return BadRequest("Ngày không hợp lệ. Vui lòng truyền ?forDate=yyyy-MM-dd hoặc định dạng hợp lệ cho DateOnly.");
                }
            }
        }

        // Gọi service AI
        try
        {
            var dto = await _aiRecommendationService.getAIRecommendations(id, targetDate, ct);
            if (dto is null) return NotFound(); // service trả null nếu không tìm thấy cây hoặc ko có data
            return Ok(dto);
        }
        catch (OperationCanceledException)
        {
            return StatusCode(499); // Client Closed Request / cancel
        }
        catch (Exception ex)
        {
            // ghi log nếu bạn có logger (không có logger trong controller này), trả 500 chung
            return StatusCode(500, $"Lỗi khi gọi AI recommendation: {ex}");
        }
    }

    /// <summary>
    /// Get AI recommendation for a single day (for progressive loading)
    /// GET api/trees/{id}/recommendation/single?forDate=2025-11-23
    /// </summary>
    [HttpGet("{id:int}/recommendation/single")]
    public async Task<IActionResult> GetSingleDayRecommendation([FromRoute] int id, [FromQuery] string? forDate, CancellationToken ct = default)
    {
        DateOnly targetDate;
        if (string.IsNullOrWhiteSpace(forDate))
        {
            targetDate = DateOnly.FromDateTime(DateTime.UtcNow.Date);
        }
        else if (!DateOnly.TryParse(forDate, out targetDate) &&
                 !DateOnly.TryParseExact(forDate, "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out targetDate))
        {
            return BadRequest("Ngày không hợp lệ. Vui lòng truyền ?forDate=yyyy-MM-dd");
        }

        try
        {
            var dto = await _aiRecommendationService.GetSingleDayRecommendationAsync(id, targetDate, ct);
            return Ok(dto);
        }
        catch (OperationCanceledException)
        {
            return StatusCode(499);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi khi gọi AI recommendation: {ex.Message}");
        }
    }

    /// <summary>
    /// Refresh AI recommendations for a tree (delete old ones and regenerate for today+2 days)
    /// POST api/trees/{id}/recommendation/refresh
    /// </summary>
    [HttpPost("{id:int}/recommendation/refresh")]
    public async Task<IActionResult> RefreshRecommendations([FromRoute] int id, CancellationToken ct = default)
    {
        try
        {
            await _aiRecommendationService.RefreshRecommendationsAsync(id, ct);
            return Ok(new { message = "AI recommendations refreshed" });
        }
        catch (OperationCanceledException)
        {
            return StatusCode(499);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi khi refresh AI recommendation: {ex.Message}");
        }
    }


    // ===================== 7) Update Status =====================
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus([FromRoute] int id, [FromBody] UpdateTreeStatusRequest req, CancellationToken ct)
    {
        if (!TryResolveUserId(out var userId, out var error)) return error!;
        var ok = await _treeCmd.UpdateStatusAsync(userId, id, req, ct);
        return ok ? NoContent() : NotFound();
    }

    // ===================== 7.5) Update Lifecycle =====================
    /// <summary>
    /// Update tree lifecycle phase (growth_development, flowering, fruiting, pre_harvest, post_harvest)
    /// </summary>
    [HttpPatch("{id:int}/lifecycle")]
    public async Task<IActionResult> UpdateLifecycle([FromRoute] int id, [FromBody] UpdateTreeLifecycleRequest req, CancellationToken ct)
    {
        if (!TryResolveUserId(out var userId, out var error)) return error!;
        try
        {
            var dto = await _treeCmd.UpdateLifecycleAsync(userId, id, req, ct);
            if (dto is null) return NotFound();
            return Ok(dto);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "You are not authorized to update this tree." });
        }
    }

    // ===================== 8) Delete =====================
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken ct)
    {
        if (!TryResolveUserId(out var userId, out var error)) return error!;
        var ok = await _treeCmd.DeleteAsync(userId, id, ct);
        return ok ? NoContent() : NotFound();
    }

    // ===================== 9) Images =====================
    [HttpGet("{id:int}/images")]
    public async Task<IActionResult> GetImages([FromRoute] int id, CancellationToken ct)
        => Ok(await _treeImg.GetGalleryAsync(id, ct));

    /// <summary>
    /// Upload image file for a tree
    /// POST /api/trees/{id}/images/upload
    /// Accepts multipart/form-data
    /// </summary>
    [HttpPost("{id:int}/images/upload")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> UploadImageFile([FromRoute] int id, [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new
            {
                success = false,
                message = "No file uploaded."
            });
        }

        try
        {
            // Save to wwwroot/uploads (same as garden upload)
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the accessible URL (same format as garden)
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var fileUrl = $"{baseUrl}/uploads/{uniqueFileName}";

            return Ok(new
            {
                success = true,
                url = fileUrl
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Error uploading image. Please try again."
            });
        }
    }

    [HttpPost("{id:int}/images")]
    public async Task<IActionResult> UploadImage([FromRoute] int id, [FromBody] UploadTreeImageRequest req, CancellationToken ct)
    {
        if (!TryResolveUserId(out var userId, out var error)) return error!;
        var dto = await _treeImg.AddImageAsync(userId, id, req, ct);
        return Ok(dto);
    }

    [HttpDelete("{id:int}/images/{imageId:int}")]
    public async Task<IActionResult> DeleteImage([FromRoute] int id, [FromRoute] int imageId, CancellationToken ct)
    {
        if (!TryResolveUserId(out var userId, out var error)) return error!;
        var ok = await _treeImg.DeleteImageAsync(userId, id, imageId, ct);
        return ok ? NoContent() : NotFound();
    }

    // ===================== 12) Growth History =====================
    [HttpGet("{id:int}/growth-history")]
    public async Task<IActionResult> GrowthHistory([FromRoute] int id, CancellationToken ct)
        => Ok(await _treeImg.GetGrowthHistoryAsync(id, ct));

    // ===================== 13) Growth Chart =====================
    [HttpGet("{id:int}/growth-chart")]
    public async Task<IActionResult> GrowthChart([FromRoute] int id, [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
        => Ok(await _treeImg.GetGrowthChartAsync(id, from, to, ct));

    // ===================== 14) Stages =====================
    [HttpGet("{id:int}/stages")]
    public async Task<IActionResult> Stages([FromRoute] int id, CancellationToken ct)
        => Ok(await _treeImg.GetStagesForTreeAsync(id, ct));
}
