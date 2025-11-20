using MamMoi.Application.DTOs.GardenMember;
using MamMoi.Application.Interfaces;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using GardenMemberEntity = MamMoi.Infrastructure.Models.GardenMember;

namespace MamMoi.Infrastructure.Services.GardenMember;

/// <summary>
/// GardenMember Service - Xử lý business logic cho quản lý thành viên vườn
/// </summary>
public class GardenMemberService : IGardenMemberService
{
    private readonly IGardenMemberRepository _gardenMemberRepository;
    private readonly IGardenRepository _gardenRepository;
    private readonly IUserRepository _userRepository;

    public GardenMemberService(
        IGardenMemberRepository gardenMemberRepository,
        IGardenRepository gardenRepository,
        IUserRepository userRepository)
    {
        _gardenMemberRepository = gardenMemberRepository;
        _gardenRepository = gardenRepository;
        _userRepository = userRepository;
    }

    /// <summary>
    /// Get tất cả gardens mà Staff được assign
    /// </summary>
    public async Task<List<AssignedGardenDto>> GetMyAssignedGardensAsync(int userId)
    {
        try
        {
            // 1. Lấy tất cả garden members của user (chỉ lấy active)
            var gardenMembers = await _gardenMemberRepository.GetByUserIdAsync(userId);

            // 2. Filter chỉ lấy active assignments
            var activeMembers = gardenMembers
                .Where(gm => gm is GardenMemberEntity member && member.Status == "Active")
                .Cast<GardenMemberEntity>()
                .ToList();

            // 3. Map sang DTO với thông tin garden
            var result = new List<AssignedGardenDto>();

            foreach (var member in activeMembers)
            {
                try
                {
                    var garden = await _gardenRepository.GetByIdAsync(member.GardenId);
                    if (garden == null) continue;

                    var gardenEntity = garden as Garden;
                    if (gardenEntity == null) continue;

                    var farmer = await _userRepository.GetByIdAsync(gardenEntity.UserId);
                    var farmerEntity = farmer as User;
                    var farmerName = farmerEntity?.FullName ?? "Unknown";

                    var assignedGarden = new AssignedGardenDto
                    {
                        GardenId = gardenEntity.GardenId,
                        GardenName = gardenEntity.Name ?? "Unknown Garden",
                        Location = gardenEntity.Location,
                        Status = member.Status ?? "Active",
                        CreatedAt = member.CreatedAt,
                        FarmerName = farmerName,
                        TotalTrees = 0, // TODO: Implement when TreeService is available
                        PendingTasks = 0 // TODO: Implement when TaskService is available
                    };

                    result.Add(assignedGarden);
                }
                catch (Exception ex)
                {
                    // Log error but continue processing other gardens
                    Console.WriteLine($"Error processing garden member {member.MemberId}: {ex.Message}");
                    continue;
                }
            }

            return result.OrderBy(g => g.CreatedAt).ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetMyAssignedGardensAsync for user {userId}: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Get all members của 1 garden (active + pending)
    /// </summary>
    public async Task<GardenMemberListResponseDto> GetGardenMembersAsync(int gardenId, int userId)
    {
        // Basic implementation - get all members of a garden
        var members = await _gardenMemberRepository.GetByGardenIdAsync(gardenId);
        var garden = await _gardenRepository.GetByIdAsync(gardenId);

        if (garden == null)
        {
            throw new ArgumentException("Garden not found");
        }

        var gardenEntity = (Garden)garden;
        var memberDtos = new List<GardenMemberDto>();

        foreach (var member in members)
        {
            var memberEntity = (GardenMemberEntity)member;
            var user = await _userRepository.GetByIdAsync(memberEntity.UserId);
            var userEntity = user != null ? (User)user : null;

            memberDtos.Add(new GardenMemberDto
            {
                MemberId = memberEntity.MemberId,
                GardenId = memberEntity.GardenId,
                UserId = memberEntity.UserId,
                UserName = userEntity?.FullName,
                UserEmail = userEntity?.Email,
                RoleId = memberEntity.RoleId,
                RoleName = memberEntity.Role?.RoleName ?? "Unknown",
                Status = memberEntity.Status,
                CreatedAt = memberEntity.CreatedAt
            });
        }

        return new GardenMemberListResponseDto
        {
            GardenId = gardenId,
            GardenName = gardenEntity.Name,
            Members = memberDtos,
            TotalMembers = memberDtos.Count,
            ActiveMembers = memberDtos.Count(m => m.Status == "Active"),
            PendingInvitations = memberDtos.Count(m => m.Status == "Pending")
        };
    }

    /// <summary>
    /// Remove staff khỏi garden (owner only)
    /// </summary>
    public async Task RemoveMemberAsync(int gardenId, int memberId, int userId)
    {
        // Check if user is garden owner
        var isOwner = await _gardenRepository.IsOwnerAsync(gardenId, userId);
        if (!isOwner)
        {
            throw new UnauthorizedAccessException("Only garden owner can remove members");
        }

        // Remove the member
        await _gardenMemberRepository.RemoveAsync(memberId);
    }
}