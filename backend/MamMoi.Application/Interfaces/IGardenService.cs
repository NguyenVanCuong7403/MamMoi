using MamMoi.Application.DTOs.Garden;

namespace MamMoi.Application.Interfaces;

/// <summary>
/// Service interface for Garden management operations.
/// Handles business logic for creating, viewing, updating gardens.
/// </summary>
public interface IGardenService
{
    /// <summary>
    /// Create a new garden for the current Farmer.
    /// Automatically creates GardenMember entry for the owner.
    /// </summary>
    /// <param name="userId">The current logged-in user ID (must be Farmer role)</param>
    /// <param name="dto">Garden creation data</param>
    /// <returns>Created garden details</returns>
    Task<GardenResponseDto> CreateGardenAsync(int userId, CreateGardenDto dto);

    /// <summary>
    /// Get paginated list of gardens for the current user.
    /// - Farmers see gardens they own
    /// - Staff see gardens they are assigned to
    /// </summary>
    /// <param name="userId">The current logged-in user ID</param>
    /// <param name="pageNumber">Page number (default: 1)</param>
    /// <param name="pageSize">Items per page (default: 10)</param>
    /// <param name="searchTerm">Optional search term for garden name</param>
    /// <returns>Paginated garden list</returns>
    Task<GardenListResponseDto> GetGardensAsync(int userId, int pageNumber = 1, int pageSize = 10, string? searchTerm = null);

    /// <summary>
    /// Get detailed information of a specific garden.
    /// Includes statistics and ownership information.
    /// </summary>
    /// <param name="gardenId">Garden ID</param>
    /// <param name="userId">Current user ID (for ownership check)</param>
    /// <returns>Garden details with statistics</returns>
    Task<GardenResponseDto> GetGardenByIdAsync(int gardenId, int userId);

    /// <summary>
    /// Update garden information.
    /// Only the garden owner (Farmer) can update.
    /// </summary>
    /// <param name="gardenId">Garden ID to update</param>
    /// <param name="userId">Current user ID (must be owner)</param>
    /// <param name="dto">Updated garden data</param>
    /// <returns>Updated garden details</returns>
    Task<GardenResponseDto> UpdateGardenAsync(int gardenId, int userId, UpdateGardenDto dto);
    Task<GardenResponseDto> UpdateGardenStatusAsync(int id, int value, string v);
}
