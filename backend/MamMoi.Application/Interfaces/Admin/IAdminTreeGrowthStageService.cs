using MamMoi.Application.DTOs.Admin;

namespace MamMoi.Application.Interfaces.Admin;

/// <summary>
/// Service interface for admin tree growth stage management
/// </summary>
public interface IAdminTreeGrowthStageService
{
    /// <summary>
    /// Get all tree growth stages with pagination
    /// </summary>
    Task<(List<TreeGrowthStageListItemDto> stages, int totalCount)> GetAllTreeGrowthStagesAsync(
        int page = 1,
        int pageSize = 20,
        string? searchTerm = null,
        int? treeTypeId = null);

    /// <summary>
    /// Get tree growth stage by ID
    /// </summary>
    Task<TreeGrowthStageDetailDto?> GetTreeGrowthStageByIdAsync(int stageId);

    /// <summary>
    /// Get stages by tree type ID
    /// </summary>
    Task<List<TreeGrowthStageListItemDto>> GetStagesByTreeTypeIdAsync(int treeTypeId);

    /// <summary>
    /// Create a new tree growth stage
    /// </summary>
    Task<TreeGrowthStageDetailDto> CreateTreeGrowthStageAsync(CreateTreeGrowthStageDto dto);

    /// <summary>
    /// Update an existing tree growth stage
    /// </summary>
    Task<TreeGrowthStageDetailDto?> UpdateTreeGrowthStageAsync(int stageId, UpdateTreeGrowthStageDto dto);

    /// <summary>
    /// Delete a tree growth stage
    /// </summary>
    Task<bool> DeleteTreeGrowthStageAsync(int stageId);
}

