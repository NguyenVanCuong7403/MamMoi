namespace MamMoi.Domain.Interfaces;

/// <summary>
/// Repository interface for GardenMember data access.
/// Handles database operations for garden member relationships.
/// </summary>
public interface IGardenMemberRepository
{
    /// <summary>
    /// Add a member to a garden
    /// </summary>
    Task<dynamic> AddAsync(dynamic gardenMember);

    /// <summary>
    /// Get all members of a garden
    /// </summary>
    Task<List<dynamic>> GetByGardenIdAsync(int gardenId);

    /// <summary>
    /// Remove a member from a garden
    /// </summary>
    Task RemoveAsync(int memberId);

    /// <summary>
    /// Get all garden memberships for a user
    /// </summary>
    Task<List<dynamic>> GetByUserIdAsync(int userId);
}
