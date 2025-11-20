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
    public class TreeTypeManagerService : ITreeTypeManagerService
    {
        private readonly MamMoiDbContext _context;

        public TreeTypeManagerService(MamMoiDbContext context)
        {
            _context = context;
        }

        // CREATE (C)
        public async Task<TreeTypeDto> CreateTreeTypeAsync(TreeTypeCreateUpdateDto dto)
        {
            var treeType = MapFromDto(new TreeType(), dto);

            _context.TreeTypes.Add(treeType);
            await _context.SaveChangesAsync();

            return (await GetTreeTypeByIdAsync(treeType.TreeTypeId))!;
        }

        //(Get All)
        public async Task<IEnumerable<TreeTypeDto>> GetAllTreeTypesAsync()
        {
            var treeTypesRaw = await _context.TreeTypes
                .Include(t => t.SoilMaster)
                .AsNoTracking()
                .ToListAsync();
            return treeTypesRaw.Select(t => MapToDto(t));
        }

        // Get By ID
        public async Task<TreeTypeDto?> GetTreeTypeByIdAsync(int treeTypeId)
        {
            var treeType = await _context.TreeTypes
                .Include(t => t.SoilMaster)
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.TreeTypeId == treeTypeId);

            return treeType == null ? null : MapToDto(treeType);
        }

        // UPDATE 
        public async Task<bool> UpdateTreeTypeAsync(int treeTypeId, TreeTypeCreateUpdateDto dto)
        {
            var treeType = await _context.TreeTypes
                .FirstOrDefaultAsync(t => t.TreeTypeId == treeTypeId);

            if (treeType == null) return false;

            MapFromDto(treeType, dto);
            await _context.SaveChangesAsync();
            return true;
        }

        // (SOFT DELETE)
        public async Task<bool> DeleteTreeTypeAsync(int treeTypeId)
        {
            var treeType = await _context.TreeTypes
                .FirstOrDefaultAsync(t => t.TreeTypeId == treeTypeId);

            if (treeType == null) return false;

            treeType.IsActive = false;

            await _context.SaveChangesAsync();
            return true;
        }

        private TreeTypeDto MapToDto(TreeType t)
        {
            return new TreeTypeDto
            {
                TreeTypeID = t.TreeTypeId,
                SoilMasterID = t.SoilMasterId,
                SoilName = t.SoilMaster?.SoilName ?? "N/A",
                TreeTypeName = t.TreeTypeName,
                ScientificName = t.ScientificName,
                Description = t.Description,
                Category = t.Category,
                AverageLifespanYears = t.AverageLifespanYears,
                OptimalTemperatureMin = t.OptimalTemperatureMin,
                OptimalTemperatureMax = t.OptimalTemperatureMax,
                OptimalHumidityMin = t.OptimalHumidityMin,
                OptimalHumidityMax = t.OptimalHumidityMax,
                DroughtTolerance = t.DroughtTolerance,
                FloodTolerance = t.FloodTolerance,
                FrostTolerance = t.FrostTolerance,
                WindTolerance = t.WindTolerance,
                ImageUrl = t.ImageUrl,
                IsActive = t.IsActive
            };
        }

        // === Helper "Clear" (Map) (Input) ===
        private TreeType MapFromDto(TreeType treeType, TreeTypeCreateUpdateDto dto)
        {
            treeType.SoilMasterId = dto.SoilMasterID;
            treeType.TreeTypeName = dto.TreeTypeName;
            treeType.ScientificName = dto.ScientificName;
            treeType.Description = dto.Description;
            treeType.Category = dto.Category;
            treeType.AverageLifespanYears = dto.AverageLifespanYears;
            treeType.OptimalTemperatureMin = dto.OptimalTemperatureMin;
            treeType.OptimalTemperatureMax = dto.OptimalTemperatureMax;
            treeType.OptimalHumidityMin = dto.OptimalHumidityMin;
            treeType.OptimalHumidityMax = dto.OptimalHumidityMax;
            treeType.DroughtTolerance = dto.DroughtTolerance;
            treeType.FloodTolerance = dto.FloodTolerance;
            treeType.FrostTolerance = dto.FrostTolerance;
            treeType.WindTolerance = dto.WindTolerance;
            treeType.ImageUrl = dto.ImageUrl;
            treeType.IsActive = dto.IsActive;
            return treeType;
        }
    }
}
