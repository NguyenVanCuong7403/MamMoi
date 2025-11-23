using MamMoi.Application.DTOs.Admin;

namespace MamMoi.Application.Interfaces.Admin;

/// <summary>
/// Service interface for admin tree type management
/// </summary>
public interface IAdminTreeTypeService
{
    /// <summary>
    /// Get all tree types with pagination
    /// </summary>
    Task<(List<TreeTypeListItemDto> treeTypes, int totalCount)> GetAllTreeTypesAsync(
        int page = 1,
        int pageSize = 20,
        string? searchTerm = null,
        bool? isActive = null);

    /// <summary>
    /// Get tree type by ID
    /// </summary>
    Task<TreeTypeDetailDto?> GetTreeTypeByIdAsync(int treeTypeId);

    /// <summary>
    /// Create a new tree type
    /// </summary>
    Task<TreeTypeDetailDto> CreateTreeTypeAsync(CreateTreeTypeDto dto);

    /// <summary>
    /// Update an existing tree type
    /// </summary>
    Task<TreeTypeDetailDto?> UpdateTreeTypeAsync(int treeTypeId, UpdateTreeTypeDto dto);

    /// <summary>
    /// Delete a tree type (soft delete by setting IsActive = false)
    /// </summary>
    Task<bool> DeleteTreeTypeAsync(int treeTypeId);

    /// <summary>
    /// Activate a tree type
    /// </summary>
    Task<bool> ActivateTreeTypeAsync(int treeTypeId);

    /// <summary>
    /// Deactivate a tree type
    /// </summary>
    Task<bool> DeactivateTreeTypeAsync(int treeTypeId);
}

