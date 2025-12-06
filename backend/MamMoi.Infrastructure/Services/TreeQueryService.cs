// Infrastructure/Services/TreeQueryService.cs
using Microsoft.EntityFrameworkCore;
using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;

namespace MamMoi.Infrastructure.Services;

public class TreeQueryService : ITreeQueryService
{
    private readonly MamMoiDbContext _db;
    public TreeQueryService(MamMoiDbContext db) => _db = db;

    public async Task<PagedResult<TreeListItemDto>> GetMyTreesAsync(
        int currentUserId, int page = 1, int pageSize = 20, string? sort = "createdAt_desc",
        int? gardenId = null, int? treeTypeId = null, bool? isActive = null, CancellationToken ct = default)
    {
        var q = _db.Set<Tree>().AsNoTracking()
            .Where(t => t.UserId == currentUserId)
            .Include(t => t.Garden)
            .Include(t => t.TreeType)
            .Include(t => t.Stage)
            .Include(t => t.TreeImages)
            .Include(t => t.TreeVariety)
            .AsQueryable();

        if (gardenId is not null) q = q.Where(t => t.GardenId == gardenId);
        if (treeTypeId is not null) q = q.Where(t => t.TreeTypeId == treeTypeId);
        if (isActive is not null) q = q.Where(t => t.IsActive == isActive);

        q = sort?.ToLower() switch
        {
            "name_asc" => q.OrderBy(t => t.TreeName),
            "name_desc" => q.OrderByDescending(t => t.TreeName),
            "createdat_asc" => q.OrderBy(t => t.CreatedAt),
            _ => q.OrderByDescending(t => t.CreatedAt)
        };

        var total = await q.CountAsync(ct);

        var items = await q.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(t => new TreeListItemDto(
                t.TreeId,
                t.TreeCode,
                t.TreeName,
                t.Garden.Name,
                t.TreeType.TreeTypeName,
                t.TreeVariety != null ? t.TreeVariety.VarietyName : null,
                t.Stage.StageName,
                // tổng hợp "health/status" cho cột hiển thị ngắn gọn
                (t.FruitStatus ?? t.FlowerStatus ?? "Bình thường"),
                t.LeafStatus,
                t.BranchStatus,
                t.TreeImages.OrderBy(img => img.ImageId)
            .Select(img => img.ImageUrl)
            .FirstOrDefault(),
                t.preMonths,
                t.CreatedAt,
                t.PlantDate
            ))
            .ToListAsync(ct);
        Console.WriteLine(items.ElementAt(0));

        return new PagedResult<TreeListItemDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PagedResult<TreeListItemDto>> SearchAsync(
        string query, int? gardenId, int? treeTypeId, int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        query = (query ?? "").Trim();

        var q = _db.Set<Tree>().AsNoTracking()
            .Include(t => t.Garden)
            .Include(t => t.TreeType)
            .Include(t => t.Stage)
            .Include(t => t.TreeImages)
            .Where(t =>
                string.IsNullOrEmpty(query) ||
                (t.TreeName != null && t.TreeName.Contains(query)) ||
                (t.TreeCode != null && t.TreeCode.Contains(query)) ||
                (t.Garden.Name != null && t.Garden.Name.Contains(query)) ||
                (t.TreeType.TreeTypeName != null && t.TreeType.TreeTypeName.Contains(query)));

        if (gardenId is not null) q = q.Where(t => t.GardenId == gardenId);
        if (treeTypeId is not null) q = q.Where(t => t.TreeTypeId == treeTypeId);

        var total = await q.CountAsync(ct);

        var items = await q.OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(t => new TreeListItemDto(
                t.TreeId,
                t.TreeCode,
                t.TreeName,
                t.Garden.Name,
                t.TreeType.TreeTypeName,
                t.TreeVariety != null ? t.TreeVariety.VarietyName : null,
                t.Stage.StageName,
                (t.FruitStatus ?? t.FlowerStatus ?? "Bình thường"),
                t.LeafStatus,
                t.BranchStatus,
                t.TreeImages.OrderBy(img => img.ImageId)
            .Select(img => img.ImageUrl)
            .FirstOrDefault(),
                t.preMonths,
                t.CreatedAt,
                t.PlantDate
            ))
            .ToListAsync(ct);

        return new PagedResult<TreeListItemDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<TreeDetailDto?> GetDetailAsync(int treeId, int? currentUserId, CancellationToken ct = default)
    {
        var q = _db.Set<Tree>().AsNoTracking().Where(t => t.TreeId == treeId);
        if (currentUserId is not null) q = q.Where(t => t.UserId == currentUserId);

        return await q
            .Include(t => t.Garden)
            .Include(t => t.TreeType)
            .Include(t => t.Stage)
            .Include(t => t.TreeVariety)
            .Select(t => new TreeDetailDto(
    t.TreeId,
    t.GardenId,
    t.UserId,
    t.TreeTypeId,
    t.StageId,
    t.VarietyId ?? 0,
    t.TreeCode,
    t.TreeName,
    t.PlantDate,
    t.Location,
    t.preMonths,
    t.GardenSoilId,
    t.IsActive,
    t.IsFruiting,
    t.ExpectedHarvestDate,
    null,               // LastHarvestDate (DB không còn, truyền null)
    null,               // TotalHarvestedKg (DB không còn, truyền null)
    null,               // AverageYieldPerYearKg (DB không còn, truyền null)
    t.Notes,
    t.QrcodeUrl,
    t.CreatedAt,
    t.UpdatedAt,
    t.Garden.Name,
    t.TreeType.TreeTypeName,
    t.Stage.StageName,
    t.Stage.StageOrder,
    t.TreeVariety != null ? t.TreeVariety.VarietyName : null,
    t.LeafStatus,
    t.BranchStatus,
    t.FlowerStatus,
    t.FruitStatus
))
            .FirstOrDefaultAsync(ct);
    }

    public async Task<TreeLifecycleDto?> GetLifecycleAsync(int treeId, int? currentUserId, CancellationToken ct = default)
    {
        var q = _db.Set<Tree>().AsNoTracking().Where(t => t.TreeId == treeId);
        if (currentUserId is not null) q = q.Where(t => t.UserId == currentUserId);

        var tree = await q
            .Include(t => t.Stage)
            .Select(t => new
            {
                t.TreeId,
                t.StageId,
                StageOrder = t.Stage.StageOrder,
                StageName = t.Stage.StageName,
                t.LifecycleAutoEnabled,
                t.LifecycleAutoDisabledAt,
                t.CycleCount
            })
            .FirstOrDefaultAsync(ct);

        if (tree == null)
        {
            // Log for debugging
            Console.WriteLine($"[GetLifecycleAsync] Tree with id {treeId} not found. currentUserId: {currentUserId}");
            return null;
        }

        // Map StageOrder (1-5) to PhaseId
        string phaseId = tree.StageOrder switch
        {
            1 => "growth_development",
            2 => "flowering",
            3 => "fruiting",
            4 => "pre_harvest",
            5 => "post_harvest",
            _ => "growth_development" // fallback
        };

        // Phase1Completed is true if not in growth_development (StageOrder > 1)
        bool phase1Completed = tree.StageOrder > 1;

        // Lấy cycleCount đã lưu trong DB (mặc định 0 nếu chưa có)
        int cycleCount = tree.CycleCount;

        return new TreeLifecycleDto(
            tree.TreeId,
            tree.StageId,
            tree.StageOrder,
            tree.StageName,
            phaseId,
            phase1Completed,
            cycleCount,
            tree.LifecycleAutoEnabled,
            tree.LifecycleAutoDisabledAt
        );
    }
}
