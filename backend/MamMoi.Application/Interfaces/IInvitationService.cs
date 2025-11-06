using MamMoi.Application.DTOs.Invitation;

namespace MamMoi.Application.Interfaces;

/// <summary>
/// Service để quản lý Staff trong vườn
/// </summary>
public interface IInvitationService
{
    /// <summary>
    /// Farmer tạo tài khoản Staff
    /// </summary>
    Task<CreateStaffResponseDto> CreateStaffAsync(int gardenId, int farmerId, CreateStaffDto dto);

    /// <summary>
    /// Farmer assign staff vào vườn
    /// </summary>
    Task<GardenMemberResponseDto> AssignStaffAsync(int gardenId, int staffId, int farmerId);

    /// <summary>
    /// Farmer remove staff khỏi vườn
    /// </summary>
    Task<bool> RemoveStaffAsync(int gardenId, int staffId, int farmerId);

    /// <summary>
    /// Lấy danh sách members của vườn
    /// </summary>
    Task<List<GardenMemberResponseDto>> GetGardenMembersAsync(int gardenId);
}