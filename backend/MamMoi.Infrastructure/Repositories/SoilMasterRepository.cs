using MamMoi.Domain.Interfaces;
using DomainSoilMaster = MamMoi.Domain.Models.SoilMaster;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.Repositories
{
    public class SoilMasterRepository : ISoilMasterRepository
    {
        private readonly MamMoiDbContext _context;

        public SoilMasterRepository(MamMoiDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DomainSoilMaster>> GetAllAsync()
        {
            return await _context.SoilMasters
                .Select(s => new DomainSoilMaster
                {
                    SoilMasterID = s.SoilMasterId,
                    SoilName = s.SoilName,
                    Texture = s.Texture,
                    Drainage = s.Drainage,
                    OrganicMatterPct = s.OrganicMatterPct ?? 0,
                    ECdSm = s.EcDSM ?? 0,
                    Notes = s.Notes
                })
                .ToListAsync();
        }

        public async Task<DomainSoilMaster> GetByIdAsync(int id)
        {
            var soil = await _context.SoilMasters.FindAsync(id);
            if (soil == null) return null;
            return new DomainSoilMaster
            {
                SoilMasterID = soil.SoilMasterId,
                SoilName = soil.SoilName,
                Texture = soil.Texture,
                Drainage = soil.Drainage,
                OrganicMatterPct = soil.OrganicMatterPct ?? 0,
                ECdSm = soil.EcDSM ?? 0,
                Notes = soil.Notes
            };
        }

        public async Task<DomainSoilMaster> CreateAsync(DomainSoilMaster soilMaster)
        {
            var soil = new SoilMaster
            {
                SoilName = soilMaster.SoilName,
                Texture = soilMaster.Texture,
                Drainage = soilMaster.Drainage,
                OrganicMatterPct = soilMaster.OrganicMatterPct,
                EcDSM = soilMaster.ECdSm,
                Notes = soilMaster.Notes
            };
            _context.SoilMasters.Add(soil);
            await _context.SaveChangesAsync();
            soilMaster.SoilMasterID = soil.SoilMasterId;
            return soilMaster;
        }

        public async Task<DomainSoilMaster> UpdateAsync(DomainSoilMaster soilMaster)
        {
            var soil = await _context.SoilMasters.FindAsync(soilMaster.SoilMasterID);
            if (soil == null) return null;
            soil.SoilName = soilMaster.SoilName;
            soil.Texture = soilMaster.Texture;
            soil.Drainage = soilMaster.Drainage;
            soil.OrganicMatterPct = soilMaster.OrganicMatterPct;
            soil.EcDSM = soilMaster.ECdSm;
            soil.Notes = soilMaster.Notes;
            await _context.SaveChangesAsync();
            return soilMaster;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var soil = await _context.SoilMasters.FindAsync(id);
            if (soil == null) return false;
            _context.SoilMasters.Remove(soil);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}