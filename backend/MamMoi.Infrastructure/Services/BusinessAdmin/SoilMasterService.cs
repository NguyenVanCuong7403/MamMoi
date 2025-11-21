using MamMoi.Application.DTOs.SystemAdmin;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.Services.BusinessAdmin
{
    public class SoilMasterService : ISoilMasterService
    {
        private readonly MamMoiDbContext _context;

        public SoilMasterService(MamMoiDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SoilMasterDropdownDto>> GetSoilMasterDropdownAsync()
        {
            return await _context.SoilMasters
                .AsNoTracking()
                .OrderBy(s => s.SoilName)
                .Select(s => new SoilMasterDropdownDto
                {
                    SoilMasterID = s.SoilMasterId,
                    SoilName = s.SoilName
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<SoilMasterDto>> GetAllAsync()
        {
            return await _context.SoilMasters
                .AsNoTracking()
                .OrderBy(s => s.SoilName)
                .Select(s => new SoilMasterDto
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

        public async Task<SoilMasterDto> GetByIdAsync(int id)
        {
            var soil = await _context.SoilMasters.FindAsync(id);
            if (soil == null) return null;
            return new SoilMasterDto
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

        public async Task<SoilMasterDto> CreateAsync(CreateSoilMasterDto dto)
        {
            var soil = new SoilMaster
            {
                SoilName = dto.SoilName,
                Texture = dto.Texture,
                Drainage = dto.Drainage,
                OrganicMatterPct = dto.OrganicMatterPct,
                EcDSM = dto.ECdSm,
                Notes = dto.Notes
            };
            _context.SoilMasters.Add(soil);
            await _context.SaveChangesAsync();
            return new SoilMasterDto
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

        public async Task<SoilMasterDto> UpdateAsync(int id, UpdateSoilMasterDto dto)
        {
            var soil = await _context.SoilMasters.FindAsync(id);
            if (soil == null) return null;
            soil.SoilName = dto.SoilName;
            soil.Texture = dto.Texture;
            soil.Drainage = dto.Drainage;
            soil.OrganicMatterPct = dto.OrganicMatterPct;
            soil.EcDSM = dto.ECdSm;
            soil.Notes = dto.Notes;
            await _context.SaveChangesAsync();
            return new SoilMasterDto
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
