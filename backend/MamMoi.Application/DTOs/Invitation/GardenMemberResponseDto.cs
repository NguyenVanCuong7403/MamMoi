namespace MamMoi.Application.DTOs.Invitation;

/// <summary>
/// Chi tiết member của vườn (bao gồm cả pending invitations)
/// </summary>
public class GardenMemberResponseDto
{
    public int MemberId { get; set; }
    public int GardenId { get; set; }
    public string GardenName { get; set; } = string.Empty;
    
    /// <summary>
    /// UserId (NULL nếu Status = Pending)
    /// </summary>
    public int? UserId { get; set; }
    
    /// <summary>
    /// Email của user (hoặc invitee email nếu pending)
    /// </summary>
    public string Email { get; set; } = string.Empty;
    
    /// <summary>
    /// FullName của user (NULL nếu pending)
    /// </summary>
    public string? FullName { get; set; }
    
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    
    /// <summary>
    /// Status: Active, Pending, Declined
    /// </summary>
    public string Status { get; set; } = string.Empty;
    
    /// <summary>
    /// Khi nào join (NULL nếu pending)
    /// </summary>
    public DateTime? CreatedAt { get; set; }
    
    /// <summary>
    /// Khi nào được mời (chỉ có nếu là invitation)
    /// </summary>
    public DateTime? InvitedAt { get; set; }
    
    /// <summary>
    /// Ai mời (chỉ có nếu là invitation)
    /// </summary>
    public int? InvitedByUserId { get; set; }
    public string? InvitedByName { get; set; }
}
