using MamMoi.Application.DTOs.Admin;

namespace MamMoi.Application.Interfaces.Admin;

/// <summary>
/// Service interface for admin tree variety management
/// </summary>
public interface IAdminTreeVarietyService
{
    /// <summary>
    /// Get all tree varieties with pagination
    /// </summary>
    Task<(List<TreeVarietyListItemDto> varieties, int totalCount)> GetAllTreeVarietiesAsync(
        int page = 1,
        int pageSize = 20,
        string? searchTerm = null,
        int? treeTypeId = null);

    /// <summary>
    /// Get tree variety by ID
    /// </summary>
    Task<TreeVarietyDetailDto?> GetTreeVarietyByIdAsync(int varietyId);

    /// <summary>
    /// Get varieties by tree type ID
    /// </summary>
    Task<List<TreeVarietyListItemDto>> GetVarietiesByTreeTypeIdAsync(int treeTypeId);

    /// <summary>
    /// Create a new tree variety
    /// </summary>
    Task<TreeVarietyDetailDto> CreateTreeVarietyAsync(CreateTreeVarietyDto dto);

    /// <summary>
    /// Update an existing tree variety
    /// </summary>
    Task<TreeVarietyDetailDto?> UpdateTreeVarietyAsync(int varietyId, UpdateTreeVarietyDto dto);

    /// <summary>
    /// Delete a tree variety
    /// </summary>
    Task<bool> DeleteTreeVarietyAsync(int varietyId);
}

