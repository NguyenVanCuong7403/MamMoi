using MamMoi.Application.DTOs.Admin;
using MamMoi.Application.Interfaces;
using MamMoi.Application.Interfaces.Admin;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace MamMoi.Infrastructure.Services.Admin;

/// <summary>
/// Service for admin tree growth stage management
/// </summary>
public class AdminTreeGrowthStageService : IAdminTreeGrowthStageService
{
    private readonly MamMoiDbContext _dbContext;
    private readonly ILogger<AdminTreeGrowthStageService> _logger;
    private readonly IImageUploadService _imageUploadService;

    public AdminTreeGrowthStageService(
        MamMoiDbContext dbContext,
        ILogger<AdminTreeGrowthStageService> logger,
        IImageUploadService imageUploadService)
    {
        _dbContext = dbContext;
        _logger = logger;
        _imageUploadService = imageUploadService;
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
                    Icon = s.Icon,
                    NodeColor = s.NodeColor,
                    LineColor = s.LineColor,
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
                    Icon = stage.Icon,
                    NodeColor = stage.NodeColor,
                    LineColor = stage.LineColor,
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
                    Icon = s.Icon,
                    NodeColor = s.NodeColor,
                    LineColor = s.LineColor,
                TreesCount = s.Trees.Count
            })
            .ToListAsync();
    }

    private static readonly Regex HexColorRegex = new("^#([0-9a-fA-F]{6})$", RegexOptions.Compiled);

    private static string? NormalizeColor(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var trimmed = value.Trim();
        if (!HexColorRegex.IsMatch(trimmed))
        {
            throw new InvalidOperationException("Màu phải ở định dạng hex #RRGGBB.");
        }
        return trimmed.ToLowerInvariant();
    }

    private static string? NormalizeIcon(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var trimmed = value.Trim();
        if (trimmed.Length <= 8 && !trimmed.StartsWith("http", StringComparison.OrdinalIgnoreCase) && !trimmed.StartsWith("/"))
        {
            return trimmed;
        }

        if (trimmed.Length > 255)
        {
            throw new InvalidOperationException("Đường dẫn icon vượt quá giới hạn 255 ký tự.");
        }

        if (Uri.TryCreate(trimmed, UriKind.Absolute, out var absoluteUri) &&
            (absoluteUri.Scheme == Uri.UriSchemeHttp || absoluteUri.Scheme == Uri.UriSchemeHttps))
        {
            return trimmed;
        }

        if (trimmed.StartsWith("/"))
        {
            return trimmed;
        }

        throw new InvalidOperationException("Icon phải là emoji ngắn hoặc URL hình ảnh hợp lệ.");
    }

    public async Task<TreeGrowthStageDetailDto> CreateTreeGrowthStageAsync(CreateTreeGrowthStageDto dto)
    {
        // Validate TreeTypeId
        var treeTypeExists = await _dbContext.TreeTypes.AnyAsync(t => t.TreeTypeId == dto.TreeTypeId);
        if (!treeTypeExists)
            throw new InvalidOperationException("TreeType not found");

        // Get existing stages for this TreeType
        var existingStages = await _dbContext.TreeGrowthStages
            .Where(s => s.TreeTypeId == dto.TreeTypeId)
            .OrderBy(s => s.StageOrder)
            .ToListAsync();

        // Determine the actual StageOrder to use
        int actualStageOrder;

        if (dto.StageOrder.HasValue && dto.StageOrder.Value > 0)
        {
            actualStageOrder = dto.StageOrder.Value;

            // If StageOrder already exists, shift other stages
            if (existingStages.Any(s => s.StageOrder == actualStageOrder))
            {
                // Use temporary values to avoid unique constraint conflicts
                var maxOrder = existingStages.Max(s => s.StageOrder);
                var tempOffset = maxOrder + 1000;

                // First, set all stages that need to shift to temporary values
                var stagesToShift = existingStages.Where(s => s.StageOrder >= actualStageOrder).ToList();
                var originalOrders = stagesToShift.ToDictionary(s => s.StageId, s => s.StageOrder);
                
                foreach (var stageToShift in stagesToShift)
                {
                    stageToShift.StageOrder = tempOffset + stageToShift.StageId; // Use unique temp value
                }
                await _dbContext.SaveChangesAsync();

                // Now set the actual new orders (shift by +1)
                foreach (var stageToShift in stagesToShift)
                {
                    stageToShift.StageOrder = originalOrders[stageToShift.StageId] + 1;
                }
                await _dbContext.SaveChangesAsync();
            }
        }
        else
        {
            // If StageOrder is not provided or invalid, set to max + 1
            actualStageOrder = existingStages.Count > 0 ? existingStages.Max(s => s.StageOrder) + 1 : 1;
        }

        var stage = new TreeGrowthStage
        {
            TreeTypeId = dto.TreeTypeId,
            StageName = dto.StageName,
            StageOrder = actualStageOrder,
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
            ImageUrl = dto.ImageUrl,
            Icon = NormalizeIcon(dto.Icon),
            NodeColor = NormalizeColor(dto.NodeColor),
            LineColor = NormalizeColor(dto.LineColor)
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

        if (dto.StageOrder.HasValue && dto.StageOrder.Value != stage.StageOrder)
        {
            var newOrder = dto.StageOrder.Value;
            var oldOrder = stage.StageOrder;

            // Get all stages for this TreeType (excluding current stage)
            var otherStages = await _dbContext.TreeGrowthStages
                .Where(s => s.TreeTypeId == stage.TreeTypeId && s.StageId != stageId)
                .ToListAsync();

            // Use temporary value to avoid unique constraint conflict
            var maxOrder = otherStages.Any() ? otherStages.Max(s => s.StageOrder) : 0;
            var tempOrder = Math.Max(maxOrder, oldOrder) + 1000;

            // First, set current stage to temporary value
            stage.StageOrder = tempOrder;
            await _dbContext.SaveChangesAsync();

            // Now shift other stages
            // If moving to a higher order (e.g., from 2 to 5), shift stages in between down
            if (newOrder > oldOrder)
            {
                var stagesToShift = otherStages
                    .Where(s => s.StageOrder > oldOrder && s.StageOrder <= newOrder)
                    .ToList();
                foreach (var stageToShift in stagesToShift)
                {
                    stageToShift.StageOrder -= 1;
                }
            }
            // If moving to a lower order (e.g., from 5 to 2), shift stages in between up
            else if (newOrder < oldOrder)
            {
                var stagesToShift = otherStages
                    .Where(s => s.StageOrder >= newOrder && s.StageOrder < oldOrder)
                    .ToList();
                foreach (var stageToShift in stagesToShift)
                {
                    stageToShift.StageOrder += 1;
                }
            }

            // Finally, set the new order for current stage
            stage.StageOrder = newOrder;
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

        if (dto.Icon != null)
            stage.Icon = NormalizeIcon(dto.Icon);

        if (dto.NodeColor != null)
            stage.NodeColor = NormalizeColor(dto.NodeColor);

        if (dto.LineColor != null)
            stage.LineColor = NormalizeColor(dto.LineColor);

        // Handle ImageUrl update - allow setting to null/empty to remove image
        if (dto.ImageUrl != null)
        {
            var newImageUrl = string.IsNullOrWhiteSpace(dto.ImageUrl) ? null : dto.ImageUrl;
            
            // Delete old image if exists and is being changed or removed
            if (!string.IsNullOrEmpty(stage.ImageUrl) && stage.ImageUrl != newImageUrl)
            {
                await _imageUploadService.DeleteImageAsync(stage.ImageUrl);
            }
            
            stage.ImageUrl = newImageUrl;
        }

        await _dbContext.SaveChangesAsync();

        return await GetTreeGrowthStageByIdAsync(stageId);
    }

    public async Task<bool> DeleteTreeGrowthStageAsync(int stageId)
    {
        var stage = await _dbContext.TreeGrowthStages
            .FirstOrDefaultAsync(s => s.StageId == stageId);
        if (stage == null)
            return false;

        // Ensure there is at least one other stage for this tree type
        var siblingStages = await _dbContext.TreeGrowthStages
            .Where(s => s.TreeTypeId == stage.TreeTypeId && s.StageId != stageId)
            .OrderBy(s => s.StageOrder)
            .ToListAsync();

        if (siblingStages.Count == 0)
            throw new InvalidOperationException("Không thể xóa giai đoạn duy nhất của loại cây.");

        // Determine target stage for reassignment (prefer next stage, fallback to previous)
        var fallbackStage = siblingStages.FirstOrDefault(s => s.StageOrder > stage.StageOrder)
            ?? siblingStages.LastOrDefault(s => s.StageOrder < stage.StageOrder)
            ?? siblingStages.First();

        if (fallbackStage == null)
            throw new InvalidOperationException("Không thể tìm thấy giai đoạn thay thế để chuyển cây.");

        // Reassign trees currently referencing this stage
        var treesToUpdate = await _dbContext.Trees
            .Where(t => t.StageId == stageId)
            .ToListAsync();

        foreach (var tree in treesToUpdate)
        {
            tree.StageId = fallbackStage.StageId;
            tree.UpdatedAt = DateTime.UtcNow;
        }

        var deletedOrder = stage.StageOrder;
        var treeTypeId = stage.TreeTypeId;

        // Delete image file if exists
        if (!string.IsNullOrEmpty(stage.ImageUrl))
        {
            await _imageUploadService.DeleteImageAsync(stage.ImageUrl);
        }

        _dbContext.TreeGrowthStages.Remove(stage);

        // Shift down all stages with higher order
        var stagesToShift = await _dbContext.TreeGrowthStages
            .Where(s => s.TreeTypeId == treeTypeId && s.StageOrder > deletedOrder)
            .ToListAsync();

        foreach (var stageToShift in stagesToShift)
        {
            stageToShift.StageOrder -= 1;
        }

        await _dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ReorderStagesAsync(int treeTypeId, Dictionary<int, int> stageIdToNewOrder)
    {
        // Validate TreeTypeId
        var treeTypeExists = await _dbContext.TreeTypes.AnyAsync(t => t.TreeTypeId == treeTypeId);
        if (!treeTypeExists)
            throw new InvalidOperationException("TreeType not found");

        // Get all stages for this TreeType
        var stages = await _dbContext.TreeGrowthStages
            .Where(s => s.TreeTypeId == treeTypeId)
            .ToListAsync();

        // Validate that all stage IDs in the dictionary exist
        var stageIds = stages.Select(s => s.StageId).ToList();
        var invalidStageIds = stageIdToNewOrder.Keys.Where(id => !stageIds.Contains(id)).ToList();
        if (invalidStageIds.Any())
            throw new InvalidOperationException($"Invalid stage IDs: {string.Join(", ", invalidStageIds)}");

        // Validate that all new orders are unique
        var newOrders = stageIdToNewOrder.Values.ToList();
        if (newOrders.Count != newOrders.Distinct().Count())
            throw new InvalidOperationException("Duplicate stage orders provided");

        // Use a temporary offset to avoid unique constraint conflicts
        // First, set all stages to temporary negative values
        var maxOrder = stages.Max(s => s.StageOrder);
        var tempOffset = maxOrder + 1000;

        foreach (var stage in stages)
        {
            if (stageIdToNewOrder.ContainsKey(stage.StageId))
            {
                stage.StageOrder = tempOffset + stage.StageId; // Use unique temp value
            }
        }

        // Save to apply temporary values
        await _dbContext.SaveChangesAsync();

        // Now set the actual new orders
        foreach (var stage in stages)
        {
            if (stageIdToNewOrder.TryGetValue(stage.StageId, out var newOrder))
            {
                stage.StageOrder = newOrder;
            }
        }

        // Save final values
        await _dbContext.SaveChangesAsync();

        return true;
    }
}

