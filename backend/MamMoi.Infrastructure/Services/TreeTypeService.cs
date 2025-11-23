using Microsoft.EntityFrameworkCore;
using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;

namespace MamMoi.Infrastructure.Services;

public class TreeTypeService : ITreeTypeService
{
    private readonly MamMoiDbContext _db;
    public TreeTypeService(MamMoiDbContext db) => _db = db;

    public async Task<IReadOnlyList<TreeTypeDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Set<TreeType>()
            .AsNoTracking()
            .Where(t => t.IsActive)
            .OrderBy(t => t.TreeTypeName)
            .Select(t => new TreeTypeDto(
                t.TreeTypeId,
                t.TreeTypeName,
                t.ScientificName,
                t.Category,
                t.SoilMasterId,
                t.IsActive,
                t.Description,
                t.ImageUrl,
                t.AverageLifespanYears,
                t.OptimalTemperatureMin,
                t.OptimalTemperatureMax,
                t.OptimalHumidityMin,
                t.OptimalHumidityMax,
                t.DroughtTolerance,
                t.FloodTolerance,
                t.FrostTolerance,
                t.WindTolerance,
                t.CareGuide,
                t.LightRequirement,
                t.WaterRequirement,
                t.Pests,
                t.SeasonalRoadmap
            ))
            .ToListAsync(ct);
    }
}
