using MamMoi.Application.DTOs.GardenSoil;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.Services.GardenSoils
{
    public class GardenSoilService : IGardenSoilService
    {
        private readonly MamMoiDbContext _db;

        public GardenSoilService(MamMoiDbContext db)
        {
            _db = db;
        }

        public async Task<GardenSoilDto?> GetByIdAsync(int id, CancellationToken ct = default)
        {
            return await _db.Set<GardenSoil>()
                .AsNoTracking()
                .Where(x => x.GardenSoilId == id)
                .Select(x => new GardenSoilDto(
                    x.GardenSoilId,
                    x.GardenId,
                    x.SoilMasterId,
                    x.CustomLabel,
                    x.Notes
                ))
                .FirstOrDefaultAsync(ct);
        }

        public async Task<List<GardenSoilDto>> GetByGardenAsync(int gardenId, CancellationToken ct = default)
        {
            return await _db.Set<GardenSoil>()
                .AsNoTracking()
                .Where(x => x.GardenId == gardenId)
                .Select(x => new GardenSoilDto(
                    x.GardenSoilId,
                    x.GardenId,
                    x.SoilMasterId,
                    x.CustomLabel,
                    x.Notes
                ))
                .ToListAsync(ct);

        }

        public async Task<List<GardenSoilDto>> GetByTreeAsync(int treeId, CancellationToken ct = default)
        {
            var query =
        from t in _db.Set<Tree>().AsNoTracking()
        where t.TreeId == treeId
        from gs in _db.Set<GardenSoil>().AsNoTracking()
            .Where(gs => gs.GardenId == t.GardenId
                      && gs.SoilMasterId == t.TreeType.SoilMasterId)
        select new GardenSoilDto(
            gs.GardenSoilId,
            gs.GardenId,
            gs.SoilMasterId,
            gs.CustomLabel,
            gs.Notes
        );

            return await query.ToListAsync(ct);

        }

        public async Task<List<GardenSoilDto>> GetByTreeTypeInGardenAsync(int typeId, int gardenId, CancellationToken ct = default)
        {
            var query =
        from t in _db.Set<TreeType>().AsNoTracking()
        where t.TreeTypeId == typeId
        from gs in _db.Set<GardenSoil>().AsNoTracking()
            .Where(gs => gs.GardenId == gardenId
                      && gs.SoilMasterId == t.SoilMasterId)
        select new GardenSoilDto(
            gs.GardenSoilId,
            gs.GardenId,
            gs.SoilMasterId,
            gs.CustomLabel,
            gs.Notes
        );

            return await query.ToListAsync(ct);

        }

        public async Task<List<GardenSoilDto>> GetAllAsync(CancellationToken ct = default)
        {
            return await _db.Set<GardenSoil>()
                .AsNoTracking()
                .OrderBy(x => x.CustomLabel)
                .Select(x => new GardenSoilDto(
                    x.GardenSoilId,
                    x.GardenId,
                    x.SoilMasterId,
                    x.CustomLabel,
                    x.Notes
                ))
                .ToListAsync(ct);
        }
    }
}
