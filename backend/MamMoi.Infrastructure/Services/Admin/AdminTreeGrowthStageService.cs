using MamMoi.Application.DTOs.Admin;
using MamMoi.Application.Interfaces.Admin;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MamMoi.Infrastructure.Services.Admin;

/// <summary>
/// Service for admin tree growth stage management
/// </summary>
public class AdminTreeGrowthStageService : IAdminTreeGrowthStageService
{
    private readonly MamMoiDbContext _dbContext;
    private readonly ILogger<AdminTreeGrowthStageService> _logger;

    public AdminTreeGrowthStageService(
        MamMoiDbContext dbContext,
        ILogger<AdminTreeGrowthStageService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<(List<TreeGrowthStageListItemDto> stages, int totalCount)> GetAllTreeGrowthStagesAsync(
        int page = 1,
        int pageSize = 20,
        string? searchTerm = null,
        int? treeTypeId = null)
    {
        var query = _dbContext.TreeGrowthStages
            .Include(s => s.TreeType)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(s =>
                s.StageName.Contains(searchTerm) ||
                (s.Description != null && s.Description.Contains(searchTerm)));
        }

        if (treeTypeId.HasValue)
        {
            query = query.Where(s => s.TreeTypeId == treeTypeId.Value);
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Get paginated results
        var stages = await query
            .OrderBy(s => s.TreeTypeId)
            .ThenBy(s => s.StageOrder)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new TreeGrowthStageListItemDto
            {
                StageId = s.StageId,
                TreeTypeId = s.TreeTypeId,
                TreeTypeName = s.TreeType.TreeTypeName,
                StageName = s.StageName,
                StageOrder = s.StageOrder,
                Description = s.Description,
                MinAgeInMonths = s.MinAgeInMonths,
                MaxAgeInMonths = s.MaxAgeInMonths,
                VulnerabilityLevel = s.VulnerabilityLevel,
                TreesCount = s.Trees.Count
            })
            .ToListAsync();

        return (stages, totalCount);
    }

    public async Task<TreeGrowthStageDetailDto?> GetTreeGrowthStageByIdAsync(int stageId)
    {
        var stage = await _dbContext.TreeGrowthStages
            .Include(s => s.TreeType)
            .FirstOrDefaultAsync(s => s.StageId == stageId);

        if (stage == null)
            return null;

        return new TreeGrowthStageDetailDto
        {
            StageId = stage.StageId,
            TreeTypeId = stage.TreeTypeId,
            TreeTypeName = stage.TreeType.TreeTypeName,
            StageName = stage.StageName,
            StageOrder = stage.StageOrder,
            Description = stage.Description,
            MinAgeInMonths = stage.MinAgeInMonths,
            MaxAgeInMonths = stage.MaxAgeInMonths,
            WateringFrequencyDays = stage.WateringFrequencyDays,
            WateringAmountLiters = stage.WateringAmountLiters,
            FertilizingFrequencyDays = stage.FertilizingFrequencyDays,
            FertilizerType = stage.FertilizerType,
            FertilizerAmountGrams = stage.FertilizerAmountGrams,
            PruningFrequencyDays = stage.PruningFrequencyDays,
            CareInstructions = stage.CareInstructions,
            CommonIssues = stage.CommonIssues,
            CriticalWeatherFactors = stage.CriticalWeatherFactors,
            VulnerabilityLevel = stage.VulnerabilityLevel,
            ImageUrl = stage.ImageUrl,
            TreesCount = await _dbContext.Trees.CountAsync(t => t.StageId == stageId)
        };
    }

    public async Task<List<TreeGrowthStageListItemDto>> GetStagesByTreeTypeIdAsync(int treeTypeId)
    {
        return await _dbContext.TreeGrowthStages
            .Include(s => s.TreeType)
            .Where(s => s.TreeTypeId == treeTypeId)
            .OrderBy(s => s.StageOrder)
            .Select(s => new TreeGrowthStageListItemDto
            {
                StageId = s.StageId,
                TreeTypeId = s.TreeTypeId,
                TreeTypeName = s.TreeType.TreeTypeName,
                StageName = s.StageName,
                StageOrder = s.StageOrder,
                Description = s.Description,
                MinAgeInMonths = s.MinAgeInMonths,
                MaxAgeInMonths = s.MaxAgeInMonths,
                VulnerabilityLevel = s.VulnerabilityLevel,
                TreesCount = s.Trees.Count
            })
            .ToListAsync();
    }

    public async Task<TreeGrowthStageDetailDto> CreateTreeGrowthStageAsync(CreateTreeGrowthStageDto dto)
    {
        // Validate TreeTypeId
        var treeTypeExists = await _dbContext.TreeTypes.AnyAsync(t => t.TreeTypeId == dto.TreeTypeId);
        if (!treeTypeExists)
            throw new InvalidOperationException("TreeType not found");

        // Check if StageOrder already exists for this TreeType
        var stageOrderExists = await _dbContext.TreeGrowthStages
            .AnyAsync(s => s.TreeTypeId == dto.TreeTypeId && s.StageOrder == dto.StageOrder);
        if (stageOrderExists)
            throw new InvalidOperationException($"StageOrder {dto.StageOrder} already exists for this TreeType");

        var stage = new TreeGrowthStage
        {
            TreeTypeId = dto.TreeTypeId,
            StageName = dto.StageName,
            StageOrder = dto.StageOrder,
            Description = dto.Description,
            MinAgeInMonths = dto.MinAgeInMonths,
            MaxAgeInMonths = dto.MaxAgeInMonths,
            WateringFrequencyDays = dto.WateringFrequencyDays,
            WateringAmountLiters = dto.WateringAmountLiters,
            FertilizingFrequencyDays = dto.FertilizingFrequencyDays,
            FertilizerType = dto.FertilizerType,
            FertilizerAmountGrams = dto.FertilizerAmountGrams,
            PruningFrequencyDays = dto.PruningFrequencyDays,
            CareInstructions = dto.CareInstructions,
            CommonIssues = dto.CommonIssues,
            CriticalWeatherFactors = dto.CriticalWeatherFactors,
            VulnerabilityLevel = dto.VulnerabilityLevel,
            ImageUrl = dto.ImageUrl
        };

        _dbContext.TreeGrowthStages.Add(stage);
        await _dbContext.SaveChangesAsync();

        return await GetTreeGrowthStageByIdAsync(stage.StageId) ?? throw new Exception("Failed to create tree growth stage");
    }

    public async Task<TreeGrowthStageDetailDto?> UpdateTreeGrowthStageAsync(int stageId, UpdateTreeGrowthStageDto dto)
    {
        var stage = await _dbContext.TreeGrowthStages.FindAsync(stageId);
        if (stage == null)
            return null;

        // Update fields if provided
        if (dto.TreeTypeId.HasValue)
        {
            var treeTypeExists = await _dbContext.TreeTypes.AnyAsync(t => t.TreeTypeId == dto.TreeTypeId.Value);
            if (!treeTypeExists)
                throw new InvalidOperationException("TreeType not found");
            stage.TreeTypeId = dto.TreeTypeId.Value;
        }

        if (!string.IsNullOrWhiteSpace(dto.StageName))
            stage.StageName = dto.StageName;

        if (dto.StageOrder.HasValue)
        {
            // Check if StageOrder already exists for this TreeType (excluding current stage)
            var stageOrderExists = await _dbContext.TreeGrowthStages
                .AnyAsync(s => s.TreeTypeId == stage.TreeTypeId && 
                              s.StageOrder == dto.StageOrder.Value && 
                              s.StageId != stageId);
            if (stageOrderExists)
                throw new InvalidOperationException($"StageOrder {dto.StageOrder.Value} already exists for this TreeType");
            stage.StageOrder = dto.StageOrder.Value;
        }

        if (dto.Description != null)
            stage.Description = dto.Description;

        if (dto.MinAgeInMonths.HasValue)
            stage.MinAgeInMonths = dto.MinAgeInMonths;

        if (dto.MaxAgeInMonths.HasValue)
            stage.MaxAgeInMonths = dto.MaxAgeInMonths;

        if (dto.WateringFrequencyDays.HasValue)
            stage.WateringFrequencyDays = dto.WateringFrequencyDays;

        if (dto.WateringAmountLiters.HasValue)
            stage.WateringAmountLiters = dto.WateringAmountLiters;

        if (dto.FertilizingFrequencyDays.HasValue)
            stage.FertilizingFrequencyDays = dto.FertilizingFrequencyDays;

        if (dto.FertilizerType != null)
            stage.FertilizerType = dto.FertilizerType;

        if (dto.FertilizerAmountGrams.HasValue)
            stage.FertilizerAmountGrams = dto.FertilizerAmountGrams;

        if (dto.PruningFrequencyDays.HasValue)
            stage.PruningFrequencyDays = dto.PruningFrequencyDays;

        if (dto.CareInstructions != null)
            stage.CareInstructions = dto.CareInstructions;

        if (dto.CommonIssues != null)
            stage.CommonIssues = dto.CommonIssues;

        if (dto.CriticalWeatherFactors != null)
            stage.CriticalWeatherFactors = dto.CriticalWeatherFactors;

        if (dto.VulnerabilityLevel.HasValue)
            stage.VulnerabilityLevel = dto.VulnerabilityLevel.Value;

        if (dto.ImageUrl != null)
            stage.ImageUrl = dto.ImageUrl;

        await _dbContext.SaveChangesAsync();

        return await GetTreeGrowthStageByIdAsync(stageId);
    }

    public async Task<bool> DeleteTreeGrowthStageAsync(int stageId)
    {
        var stage = await _dbContext.TreeGrowthStages.FindAsync(stageId);
        if (stage == null)
            return false;

        // Check if stage is used by any trees
        var isUsed = await _dbContext.Trees.AnyAsync(t => t.StageId == stageId);
        if (isUsed)
            throw new InvalidOperationException("Cannot delete stage that is used by trees");

        _dbContext.TreeGrowthStages.Remove(stage);
        await _dbContext.SaveChangesAsync();

        return true;
    }
}

