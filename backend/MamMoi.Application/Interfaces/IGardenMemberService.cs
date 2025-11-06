using MamMoi.Application.DTOs.GardenMember;

namespace MamMoi.Application.Interfaces;

/// <summary>
/// Service interface cho GardenMember management
/// </summary>
public interface IGardenMemberService
{
    /// <summary>
    /// Get all members của 1 garden (active + pending)
    /// </summary>
    Task<GardenMemberListResponseDto> GetGardenMembersAsync(int gardenId, int userId);

    /// <summary>
    /// Remove staff khỏi garden (owner only)
    /// </summary>
    Task RemoveMemberAsync(int gardenId, int memberId, int userId);

    /// <summary>
    /// Get tất cả gardens mà Staff được assign
    /// </summary>
    Task<List<GardenMemberDto>> GetMyAssignedGardensAsync(int userId);
}
