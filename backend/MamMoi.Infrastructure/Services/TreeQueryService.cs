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
            .AsQueryable();

        if (gardenId is not null) q = q.Where(t => t.GardenId == gardenId);
        if (treeTypeId is not null) q = q.Where(t => t.TreeTypeId == treeTypeId);
        if (isActive is not null) q = q.Where(t => t.IsActive == isActive);

        q = sort?.ToLower() switch
        {
            "name_asc" => q.OrderBy(t => t.TreeName),
            "name_desc" => q.OrderByDescending(t => t.TreeName),
            "createdat_asc" => q.OrderBy(t => t.CreatedAt),
            _ => q.OrderByDescending(t => t.CreatedAt) // createdAt_desc
        };

        var total = await q.CountAsync(ct);

        var items = await q.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(t => new TreeListItemDto(
                t.TreeId,
                t.TreeCode,
                t.TreeName,
                t.Garden.Name,
                t.TreeType.TreeTypeName,
                t.Stage.StageName,
                t.HealthStatus,
                t.HealthScore,
                t.CreatedAt
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

    public async Task<PagedResult<TreeListItemDto>> SearchAsync(
        string query, int? gardenId, int? treeTypeId, int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        query = (query ?? "").Trim();

        var q = _db.Set<Tree>().AsNoTracking()
            .Include(t => t.Garden)
            .Include(t => t.TreeType)
            .Include(t => t.Stage)
            .Where(t =>
                (string.IsNullOrEmpty(query) ||
                 (t.TreeName != null && t.TreeName.Contains(query)) ||
                 (t.TreeCode != null && t.TreeCode.Contains(query)) ||
                 (t.Garden.Name != null && t.Garden.Name.Contains(query)) ||
                 (t.TreeType.TreeTypeName != null && t.TreeType.TreeTypeName.Contains(query)))
            );

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
                t.Stage.StageName,
                t.HealthStatus,
                t.HealthScore,
                t.CreatedAt
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
        var q = _db.Set<Tree>()
            .AsNoTracking()
            .Where(t => t.TreeId == treeId);

        if (currentUserId is not null)
            q = q.Where(t => t.UserId == currentUserId);

        return await q
            .Include(t => t.Garden)
            .Include(t => t.TreeType)
            .Include(t => t.Stage)
            .Select(t => new TreeDetailDto(
                t.TreeId, t.GardenId, t.UserId, t.TreeTypeId, t.StageId,
                t.TreeCode, t.TreeName, t.PlantDate, t.HeightMeters,
                t.HealthStatus, t.HealthScore, t.Latitude, t.Longitude, t.Location,

                // (bỏ AltitudeMeters/TimeZone/ClimateZone của Tree)

                t.LastWateredAt, t.NextWateringAt, t.WateringFrequencyDays, t.LastWateringAmountLiters,
                t.MinWateringIntervalDays, t.MaxWateringIntervalDays,
                t.LastFertilizedAt, t.NextFertilizingAt, t.FertilizingFrequencyDays,
                t.LastFertilizerType, t.LastFertilizerAmountGrams,

                // (bỏ SunlightExposure/SoilPh/IsIndoor)

                t.GardenSoilId, t.IsActive, t.IsFruiting, t.ExpectedHarvestDate,
                t.LastHarvestDate, t.TotalHarvestedKg, t.AverageYieldPerYearKg,
                t.Notes, t.QrcodeUrl, t.CreatedAt, t.UpdatedAt,
                t.Garden.Name, t.TreeType.TreeTypeName, t.Stage.StageName,

                // ⬇️ map từ Garden
                t.Garden.TimeZone, t.Garden.ClimateZone
            ))
            .FirstOrDefaultAsync(ct);
    }

}
