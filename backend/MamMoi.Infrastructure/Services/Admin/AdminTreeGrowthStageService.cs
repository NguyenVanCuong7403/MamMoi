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

    /// <summary>
    /// Validates that MaxAge > MinAge for a stage
    /// </summary>
    private static void ValidateAgeRange(int? minAge, int? maxAge)
    {
        if (minAge.HasValue && maxAge.HasValue)
        {
            if (maxAge.Value <= minAge.Value)
            {
                throw new InvalidOperationException($"Tuổi tối đa ({maxAge}) phải lớn hơn tuổi tối thiểu ({minAge}).");
            }
        }
    }

    /// <summary>
    /// Checks if two age ranges overlap
    /// </summary>
    private static bool AgeRangesOverlap(int? min1, int? max1, int? min2, int? max2)
    {
        if (!min1.HasValue || !max1.HasValue || !min2.HasValue || !max2.HasValue)
            return false;

        // Two ranges overlap if: min1 <= max2 && min2 <= max1
        return min1.Value <= max2.Value && min2.Value <= max1.Value;
    }

    /// <summary>
    /// Validates age ranges don't overlap with existing stages (excluding the current stage if updating)
    /// </summary>
    private void ValidateNoOverlappingAges(
        List<TreeGrowthStage> existingStages,
        int? newMinAge,
        int? newMaxAge,
        int? excludeStageId = null)
    {
        if (!newMinAge.HasValue || !newMaxAge.HasValue)
            return;

        foreach (var existingStage in existingStages)
        {
            if (excludeStageId.HasValue && existingStage.StageId == excludeStageId.Value)
                continue;

            if (existingStage.MinAgeInMonths.HasValue && existingStage.MaxAgeInMonths.HasValue)
            {
                if (AgeRangesOverlap(newMinAge, newMaxAge, existingStage.MinAgeInMonths, existingStage.MaxAgeInMonths))
                {
                    throw new InvalidOperationException(
                        $"Khoảng tuổi ({newMinAge}-{newMaxAge} tháng) chồng lên giai đoạn '{existingStage.StageName}' ({existingStage.MinAgeInMonths}-{existingStage.MaxAgeInMonths} tháng).");
                }
            }
        }
    }

    /// <summary>
    /// Automatically adjusts MinAge of subsequent stages to maintain continuity after a stage is updated or deleted
    /// </summary>
    private async Task AdjustSubsequentStagesAgesAsync(int treeTypeId, int currentStageOrder, int? previousMaxAge)
    {
        var subsequentStages = await _dbContext.TreeGrowthStages
            .Where(s => s.TreeTypeId == treeTypeId && s.StageOrder > currentStageOrder)
            .OrderBy(s => s.StageOrder)
            .ToListAsync();

        if (!subsequentStages.Any())
            return;

        // If previous stage has a MaxAge, set the first subsequent stage's MinAge to MaxAge + 1
        if (previousMaxAge.HasValue)
        {
            var firstSubsequent = subsequentStages.First();
            if (!firstSubsequent.MinAgeInMonths.HasValue || firstSubsequent.MinAgeInMonths.Value < previousMaxAge.Value + 1)
            {
                firstSubsequent.MinAgeInMonths = previousMaxAge.Value + 1;
                
                // If MaxAge is less than MinAge, adjust MaxAge too
                if (firstSubsequent.MaxAgeInMonths.HasValue && firstSubsequent.MaxAgeInMonths.Value <= firstSubsequent.MinAgeInMonths.Value)
                {
                    firstSubsequent.MaxAgeInMonths = firstSubsequent.MinAgeInMonths.Value + 1;
                }
            }
        }

        // Cascade adjustment: each stage's MinAge should be previous stage's MaxAge + 1
        for (int i = 0; i < subsequentStages.Count - 1; i++)
        {
            var current = subsequentStages[i];
            var next = subsequentStages[i + 1];

            if (current.MaxAgeInMonths.HasValue)
            {
                var expectedMinAge = current.MaxAgeInMonths.Value + 1;
                if (!next.MinAgeInMonths.HasValue || next.MinAgeInMonths.Value < expectedMinAge)
                {
                    next.MinAgeInMonths = expectedMinAge;
                    
                    // If MaxAge is less than MinAge, adjust MaxAge too
                    if (next.MaxAgeInMonths.HasValue && next.MaxAgeInMonths.Value <= next.MinAgeInMonths.Value)
                    {
                        next.MaxAgeInMonths = next.MinAgeInMonths.Value + 1;
                    }
                }
            }
        }
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

        // Determine MinAge and MaxAge with validation and auto-adjustment
        int? finalMinAge = dto.MinAgeInMonths;
        int? finalMaxAge = dto.MaxAgeInMonths;

        // Find the previous stage (stage with order < actualStageOrder)
        var previousStage = existingStages
            .Where(s => s.StageOrder < actualStageOrder)
            .OrderByDescending(s => s.StageOrder)
            .FirstOrDefault();

        // Validate MinAge based on previous stage's MaxAge
        if (previousStage != null && previousStage.MaxAgeInMonths.HasValue)
        {
            var expectedMinAge = previousStage.MaxAgeInMonths.Value + 1;
            if (!finalMinAge.HasValue)
            {
                throw new InvalidOperationException($"Tuổi tối thiểu là bắt buộc. Phải lớn hơn hoặc bằng {expectedMinAge} tháng (tuổi tối đa của quy trình trước + 1).");
            }
            if (finalMinAge.Value < expectedMinAge)
            {
                throw new InvalidOperationException($"Tuổi tối thiểu ({finalMinAge.Value} tháng) phải lớn hơn hoặc bằng tuổi tối đa của quy trình trước ({previousStage.MaxAgeInMonths.Value} tháng). Giá trị tối thiểu cho phép: {expectedMinAge} tháng.");
            }
        }
        else if (!finalMinAge.HasValue && actualStageOrder == 1)
        {
            // First stage defaults to 0 if not specified
            finalMinAge = 0;
        }

        // Validate age range
        if (finalMinAge.HasValue && finalMaxAge.HasValue)
        {
            ValidateAgeRange(finalMinAge, finalMaxAge);
        }

        // Validate no overlapping ages with existing stages
        ValidateNoOverlappingAges(existingStages, finalMinAge, finalMaxAge);

        var stage = new TreeGrowthStage
        {
            TreeTypeId = dto.TreeTypeId,
            StageName = dto.StageName,
            StageOrder = actualStageOrder,
            Description = dto.Description,
            MinAgeInMonths = finalMinAge,
            MaxAgeInMonths = finalMaxAge,
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

        // Adjust subsequent stages' ages to maintain continuity
        if (finalMaxAge.HasValue)
        {
            await AdjustSubsequentStagesAgesAsync(dto.TreeTypeId, actualStageOrder, finalMaxAge);
            await _dbContext.SaveChangesAsync();
        }

        // Tự động kích hoạt TreeType khi có ít nhất 1 stage
        var treeType = await _dbContext.TreeTypes.FindAsync(dto.TreeTypeId);
        if (treeType != null && !treeType.IsActive)
        {
            var stageCount = await _dbContext.TreeGrowthStages
                .CountAsync(s => s.TreeTypeId == dto.TreeTypeId);
            if (stageCount > 0)
            {
                treeType.IsActive = true;
                await _dbContext.SaveChangesAsync();
            }
        }

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

        // Handle age updates with validation
        int? newMinAge = dto.MinAgeInMonths ?? stage.MinAgeInMonths;
        int? newMaxAge = dto.MaxAgeInMonths ?? stage.MaxAgeInMonths;

        if (dto.MinAgeInMonths.HasValue || dto.MaxAgeInMonths.HasValue)
        {
            // Get all stages for this TreeType (excluding current stage) for overlap check
            var otherStages = await _dbContext.TreeGrowthStages
                .Where(s => s.TreeTypeId == stage.TreeTypeId && s.StageId != stageId)
                .OrderBy(s => s.StageOrder)
                .ToListAsync();

            // Find previous stage
            var previousStage = otherStages
                .Where(s => s.StageOrder < stage.StageOrder)
                .OrderByDescending(s => s.StageOrder)
                .FirstOrDefault();

            // Validate MinAge based on previous stage's MaxAge
            if (previousStage != null && previousStage.MaxAgeInMonths.HasValue)
            {
                var expectedMinAge = previousStage.MaxAgeInMonths.Value + 1;
                if (!newMinAge.HasValue)
                {
                    throw new InvalidOperationException($"Tuổi tối thiểu là bắt buộc. Phải lớn hơn hoặc bằng {expectedMinAge} tháng (tuổi tối đa của quy trình trước + 1).");
                }
                if (newMinAge.Value < expectedMinAge)
                {
                    throw new InvalidOperationException($"Tuổi tối thiểu ({newMinAge.Value} tháng) phải lớn hơn hoặc bằng tuổi tối đa của quy trình trước ({previousStage.MaxAgeInMonths.Value} tháng). Giá trị tối thiểu cho phép: {expectedMinAge} tháng.");
                }
            }
            else if (!newMinAge.HasValue && stage.StageOrder == 1)
            {
                // First stage defaults to 0 if not specified
                newMinAge = 0;
            }

            // Validate age range
            ValidateAgeRange(newMinAge, newMaxAge);

            // Validate no overlapping ages
            ValidateNoOverlappingAges(otherStages, newMinAge, newMaxAge, stageId);

            stage.MinAgeInMonths = newMinAge;
            stage.MaxAgeInMonths = newMaxAge;
        }

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

        // Adjust subsequent stages' ages to maintain continuity if age was updated
        if (dto.MinAgeInMonths.HasValue || dto.MaxAgeInMonths.HasValue)
        {
            await AdjustSubsequentStagesAgesAsync(stage.TreeTypeId, stage.StageOrder, stage.MaxAgeInMonths);
            await _dbContext.SaveChangesAsync();
        }

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

        // Find the previous stage (before deletion) to get its MaxAge for continuity
        var previousStage = siblingStages
            .Where(s => s.StageOrder < deletedOrder)
            .OrderByDescending(s => s.StageOrder)
            .FirstOrDefault();

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

        // Adjust subsequent stages' ages to maintain continuity after deletion
        // The next stage's MinAge should connect with the previous stage's MaxAge
        // After deletion and shifting, stages starting from deletedOrder need adjustment
        // (the stage that was at deletedOrder + 1 is now at deletedOrder)
        var previousStageOrder = previousStage?.StageOrder ?? 0;
        await AdjustSubsequentStagesAgesAsync(treeTypeId, previousStageOrder, previousStage?.MaxAgeInMonths);
        await _dbContext.SaveChangesAsync();

        // Kiểm tra và cập nhật IsActive của TreeType
        var remainingStagesCount = await _dbContext.TreeGrowthStages
            .CountAsync(s => s.TreeTypeId == treeTypeId);
        var treeType = await _dbContext.TreeTypes.FindAsync(treeTypeId);
        if (treeType != null)
        {
            // Nếu không còn stage nào, set IsActive = false
            treeType.IsActive = remainingStagesCount > 0;
            await _dbContext.SaveChangesAsync();
        }

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

