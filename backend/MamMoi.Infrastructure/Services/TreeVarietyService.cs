using Microsoft.EntityFrameworkCore;
using MamMoi.Application.DTOs;
using MamMoi.Application.DTOs.BusinessAdmin;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;

namespace MamMoi.Infrastructure.Services;

public class TreeVarietyService : ITreeVarietyService
{
    private readonly MamMoiDbContext _db;
    public TreeVarietyService(MamMoiDbContext db) => _db = db;

    public async Task<IReadOnlyList<Application.DTOs.TreeVarietyDto>> GetAllAsync(int? treeTypeId = null, CancellationToken ct = default)
    {
        var query = _db.Set<TreeVariety>()
            .AsNoTracking()
            .Where(t => t.VarietyName != null);

        // Filter by treeTypeId if provided
        if (treeTypeId.HasValue)
        {
            query = query.Where(t => t.TreeTypeId == treeTypeId.Value);
        }

        return await query
            .OrderBy(t => t.VarietyName)
            .Select(t => new Application.DTOs.TreeVarietyDto(
                t.VarietyId,
                t.TreeTypeId,
                t.VarietyName,
                t.VarietyDescription,
                t.ImageUrl
            ))
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Application.DTOs.BusinessAdmin.TreeVarietyDto>> GetAllTreeVarietiesAsync()
    {
        var treeVarieties = await _db.TreeVarietys
            .Include(tv => tv.TreeType)
            .AsNoTracking()
            .ToListAsync();

        return treeVarieties.Select(tv => new Application.DTOs.BusinessAdmin.TreeVarietyDto
        {
            VarietyId = tv.VarietyId,
            TreeTypeId = tv.TreeTypeId,
            TreeTypeName = tv.TreeType?.TreeTypeName,
            VarietyName = tv.VarietyName,
            VarietyDescription = tv.VarietyDescription
        });
    }

    public async Task<Application.DTOs.BusinessAdmin.TreeVarietyDto?> GetTreeVarietyByIdAsync(int varietyId)
    {
        var treeVariety = await _db.TreeVarietys
            .Include(tv => tv.TreeType)
            .AsNoTracking()
            .FirstOrDefaultAsync(tv => tv.VarietyId == varietyId);

        return treeVariety == null ? null : new Application.DTOs.BusinessAdmin.TreeVarietyDto
        {
            VarietyId = treeVariety.VarietyId,
            TreeTypeId = treeVariety.TreeTypeId,
            TreeTypeName = treeVariety.TreeType?.TreeTypeName,
            VarietyName = treeVariety.VarietyName,
            VarietyDescription = treeVariety.VarietyDescription
        };
    }

    public async Task<IEnumerable<Application.DTOs.BusinessAdmin.TreeVarietyDto>> GetTreeVarietiesByTreeTypeAsync(int treeTypeId)
    {
        var treeVarieties = await _db.TreeVarietys
            .Include(tv => tv.TreeType)
            .Where(tv => tv.TreeTypeId == treeTypeId)
            .AsNoTracking()
            .ToListAsync();

        return treeVarieties.Select(tv => new Application.DTOs.BusinessAdmin.TreeVarietyDto
        {
            VarietyId = tv.VarietyId,
            TreeTypeId = tv.TreeTypeId,
            TreeTypeName = tv.TreeType?.TreeTypeName,
            VarietyName = tv.VarietyName,
            VarietyDescription = tv.VarietyDescription
        });
    }

    public async Task<Application.DTOs.BusinessAdmin.TreeVarietyDto> CreateTreeVarietyAsync(TreeVarietyCreateUpdateDto dto)
    {
        var treeVariety = new TreeVariety
        {
            TreeTypeId = dto.TreeTypeId,
            VarietyName = dto.VarietyName,
            VarietyDescription = dto.VarietyDescription
        };

        _db.TreeVarietys.Add(treeVariety);
        await _db.SaveChangesAsync();

        return (await GetTreeVarietyByIdAsync(treeVariety.VarietyId))!;
    }

    public async Task<bool> UpdateTreeVarietyAsync(int varietyId, TreeVarietyCreateUpdateDto dto)
    {
        var treeVariety = await _db.TreeVarietys.FindAsync(varietyId);
        if (treeVariety == null) return false;

        treeVariety.TreeTypeId = dto.TreeTypeId;
        treeVariety.VarietyName = dto.VarietyName;
        treeVariety.VarietyDescription = dto.VarietyDescription;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteTreeVarietyAsync(int varietyId)
    {
        var treeVariety = await _db.TreeVarietys.FindAsync(varietyId);
        if (treeVariety == null) return false;

        _db.TreeVarietys.Remove(treeVariety);
        await _db.SaveChangesAsync();
        return true;
    }
}
