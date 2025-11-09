namespace MamMoi.Application.DTOs.GardenMember;

/// <summary>
/// DTO cho thông tin member trong vườn
/// </summary>
public class GardenMemberDto
{
    public int MemberId { get; set; }
    public int GardenId { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
    public DateTime? InvitedAt { get; set; }
    public string? InvitedByName { get; set; }
}

/// <summary>
/// Response list members của 1 garden
/// </summary>
public class GardenMemberListResponseDto
{
    public int GardenId { get; set; }
    public string GardenName { get; set; } = string.Empty;
    public List<GardenMemberDto> Members { get; set; } = new();
    public int TotalMembers { get; set; }
    public int ActiveMembers { get; set; }
    public int PendingInvitations { get; set; }
}
