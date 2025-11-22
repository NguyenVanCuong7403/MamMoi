using MamMoi.Application.DTOs.Admin;

namespace MamMoi.Application.Interfaces.Admin;

/// <summary>
/// Service interface for admin soil master management
/// </summary>
public interface IAdminSoilMasterService
{
    /// <summary>
    /// Get all soil masters with pagination
    /// </summary>
    Task<(List<SoilMasterListItemDto> soilMasters, int totalCount)> GetAllSoilMastersAsync(
        int page = 1,
        int pageSize = 20,
        string? searchTerm = null);

    /// <summary>
    /// Get soil master by ID
    /// </summary>
    Task<SoilMasterDetailDto?> GetSoilMasterByIdAsync(int soilMasterId);

    /// <summary>
    /// Create a new soil master
    /// </summary>
    Task<SoilMasterDetailDto> CreateSoilMasterAsync(CreateSoilMasterDto dto);

    /// <summary>
    /// Update an existing soil master
    /// </summary>
    Task<SoilMasterDetailDto?> UpdateSoilMasterAsync(int soilMasterId, UpdateSoilMasterDto dto);

    /// <summary>
    /// Delete a soil master
    /// </summary>
    Task<bool> DeleteSoilMasterAsync(int soilMasterId);
}

