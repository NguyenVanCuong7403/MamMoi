using MamMoi.Application.DTOs.Admin;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Infrastructure.Services;

/// <summary>
/// Service for farmers to access soil masters (read-only)
/// </summary>
public class SoilMasterService : ISoilMasterService
{
    private readonly MamMoiDbContext _db;

    public SoilMasterService(MamMoiDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<SoilMasterListItemDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Set<SoilMaster>()
            .AsNoTracking()
            .OrderBy(s => s.SoilName)
            .Select(s => new SoilMasterListItemDto
            {
                SoilMasterId = s.SoilMasterId,
                SoilName = s.SoilName,
                Texture = s.Texture,
                Notes = s.Notes,
                Drainage = s.Drainage,
                TreeTypesCount = s.TreeTypes.Count,
                GardenSoilsCount = s.GardenSoils.Count
            })
            .ToListAsync(ct);
    }
}

