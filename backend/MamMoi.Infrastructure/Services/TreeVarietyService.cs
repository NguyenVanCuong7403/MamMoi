using Microsoft.EntityFrameworkCore;
using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;

namespace MamMoi.Infrastructure.Services;

public class TreeVarietyService : ITreeVarietyService
{
    private readonly MamMoiDbContext _db;
    public TreeVarietyService(MamMoiDbContext db) => _db = db;

    public async Task<IReadOnlyList<TreeVarietyDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Set<TreeVariety>()
            .AsNoTracking()
            .OrderBy(t => t.VarietyName)
            .Select(t => new TreeVarietyDto(
                t.VarietyId,
                t.TreeTypeId,
                t.VarietyName,
                t.VarietyDescription
            ))
            .ToListAsync(ct);
    }
}
