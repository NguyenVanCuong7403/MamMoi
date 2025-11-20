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
    public class GrowthStageService : IGrowthStageService
    {
        private readonly MamMoiDbContext _context;

        public GrowthStageService(MamMoiDbContext context)
        {
            _context = context;
        }

        // === API "Phụ" (Helper) (Dropdown "Cây" (Tree)) ===
        public async Task<IEnumerable<TreeTypeDropdownDto>> GetTreeTypeDropdownAsync()
        {
            return await _context.TreeTypes
                .AsNoTracking()
                .Where(t => t.IsActive) 
                .OrderBy(t => t.TreeTypeName)
                .Select(t => new TreeTypeDropdownDto
                {
                    TreeTypeID = t.TreeTypeId,
                    TreeTypeName = t.TreeTypeName
                })
                .ToListAsync();
        }

        // CREATE (C)
        public async Task<GrowthStageDto> CreateGrowthStageAsync(GrowthStageCreateUpdateDto dto)
        {
            var stage = MapFromDto(new TreeGrowthStage(), dto); // (Dùng Helper "Clear" (Map))

            _context.TreeGrowthStages.Add(stage);
            await _context.SaveChangesAsync();

            return (await GetGrowthStageByIdAsync(stage.StageId))!;
        }

        // READ (R) (Get All + Filter)
        public async Task<IEnumerable<GrowthStageDto>> GetAllGrowthStagesAsync(int? treeTypeId)
        {
            var query = _context.TreeGrowthStages
                .Include(s => s.TreeType)
                .AsNoTracking();

            if (treeTypeId.HasValue)
            {
                query = query.Where(s => s.TreeTypeId == treeTypeId.Value);
            }

            var stagesRaw = await query
                .OrderBy(s => s.TreeTypeId).ThenBy(s => s.StageOrder)
                .ToListAsync();

            return stagesRaw.Select(s => MapToDto(s));
        }

        // READ (R) (Get By ID)
        public async Task<GrowthStageDto?> GetGrowthStageByIdAsync(int stageId)
        {
            var stage = await _context.TreeGrowthStages
                .Include(s => s.TreeType) // "Clear" (JOIN)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.StageId == stageId);

            return stage == null ? null : MapToDto(stage);
        }

        // UPDATE (U)
        public async Task<bool> UpdateGrowthStageAsync(int stageId, GrowthStageCreateUpdateDto dto)
        {
            var stage = await _context.TreeGrowthStages
                .FirstOrDefaultAsync(s => s.StageId == stageId);

            if (stage == null) return false;

            MapFromDto(stage, dto);
            await _context.SaveChangesAsync();
            return true;
        }

        // DELETE (D)
        public async Task<bool> DeleteGrowthStageAsync(int stageId)
        {
            var stage = await _context.TreeGrowthStages
                .FirstOrDefaultAsync(s => s.StageId == stageId);
            if (stage == null) return false;
            await _context.SaveChangesAsync();
            return true;
        }

        // === Helper "Clear" (Map) (Output) ===
        private GrowthStageDto MapToDto(TreeGrowthStage s)
        {
            return new GrowthStageDto
            {
                StageID = s.StageId,
                TreeTypeID = s.TreeTypeId,
                TreeTypeName = s.TreeType?.TreeTypeName ?? "N/A", // (Cần "?." "clear" (phòng) lỗi)
                StageName = s.StageName,
                StageOrder = s.StageOrder,
                Description = s.Description,
                MinAgeInMonths = s.MinAgeInMonths,
                MaxAgeInMonths = s.MaxAgeInMonths,
                WateringFrequencyDays = s.WateringFrequencyDays,
                WateringAmountLiters = s.WateringAmountLiters,
                FertilizingFrequencyDays = s.FertilizingFrequencyDays,
                FertilizerType = s.FertilizerType,
                FertilizerAmountGrams = s.FertilizerAmountGrams,
                PruningFrequencyDays = s.PruningFrequencyDays,
                CareInstructions = s.CareInstructions,
                CommonIssues = s.CommonIssues,
                CriticalWeatherFactors = s.CriticalWeatherFactors,
                VulnerabilityLevel = s.VulnerabilityLevel,
                ImageUrl = s.ImageUrl,
            };
        }

        // === Helper "Clear" (Map) (Input) ===
        private TreeGrowthStage MapFromDto(TreeGrowthStage stage, GrowthStageCreateUpdateDto dto)
        {
            stage.TreeTypeId = dto.TreeTypeID;
            stage.StageName = dto.StageName;
            stage.StageOrder = dto.StageOrder;
            stage.Description = dto.Description;
            stage.MinAgeInMonths = dto.MinAgeInMonths;
            stage.MaxAgeInMonths = dto.MaxAgeInMonths;
            stage.WateringFrequencyDays = dto.WateringFrequencyDays;
            stage.WateringAmountLiters = dto.WateringAmountLiters;
            stage.FertilizingFrequencyDays = dto.FertilizingFrequencyDays;
            stage.FertilizerType = dto.FertilizerType;
            stage.FertilizerAmountGrams = dto.FertilizerAmountGrams;
            stage.PruningFrequencyDays = dto.PruningFrequencyDays;
            stage.CareInstructions = dto.CareInstructions;
            stage.CommonIssues = dto.CommonIssues;
            stage.CriticalWeatherFactors = dto.CriticalWeatherFactors;
            stage.VulnerabilityLevel = dto.VulnerabilityLevel;
            stage.ImageUrl = dto.ImageUrl;
            return stage;
        }
    }
}
