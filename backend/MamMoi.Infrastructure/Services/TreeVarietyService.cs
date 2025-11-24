using Microsoft.EntityFrameworkCore;
using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;

namespace MamMoi.Infrastructure.Services;

public class TreeVarietyService : ITreeVarietyService
{
    private readonly MamMoiDbContext _db;
    public TreeVarietyService(MamMoiDbContext db) => _db = db;

    public async Task<IReadOnlyList<TreeVarietyDto>> GetAllAsync(int? treeTypeId = null, CancellationToken ct = default)
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
            .Select(t => new TreeVarietyDto(
                t.VarietyId,
                t.TreeTypeId,
                t.VarietyName,
                t.VarietyDescription,
                t.ImageUrl
            ))
            .ToListAsync(ct);
    }
}
