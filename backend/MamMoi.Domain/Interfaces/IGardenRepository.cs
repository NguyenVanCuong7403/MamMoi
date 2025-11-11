namespace MamMoi.Domain.Interfaces;

/// <summary>
/// Repository interface for Garden data access.
/// Handles database operations for gardens.
/// </summary>
public interface IGardenRepository
{
    /// <summary>
    /// Create a new garden in the database
    /// </summary>
    Task<dynamic> CreateAsync(dynamic garden);

    /// <summary>
    /// Get garden by ID with related data (Trees, GardenMembers, User)
    /// </summary>
    Task<dynamic?> GetByIdAsync(int gardenId);

    /// <summary>
    /// Get paginated gardens for a user (owner or member)
    /// </summary>
    /// <param name="userId">User ID to filter gardens</param>
    /// <param name="pageNumber">Page number (1-based)</param>
    /// <param name="pageSize">Items per page</param>
    /// <param name="searchTerm">Optional search term for garden name</param>
    /// <returns>Tuple of (gardens list, total count)</returns>
    Task<(List<dynamic> gardens, int totalCount)> GetGardensByUserIdAsync(int userId, int pageNumber, int pageSize, string? searchTerm);

    /// <summary>
    /// Update an existing garden
    /// </summary>
    Task UpdateAsync(dynamic garden);

    /// <summary>
    /// Check if user is the owner of the garden
    /// </summary>
    Task<bool> IsOwnerAsync(int gardenId, int userId);

    /// <summary>
    /// Check if user has access to the garden (owner or member)
    /// </summary>
    Task<bool> HasAccessAsync(int gardenId, int userId);
}
