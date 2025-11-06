namespace MamMoi.Application.DTOs.Invitation;

/// <summary>
/// Response sau khi gửi invitation
/// </summary>
public class InvitationResponseDto
{
    public int MemberId { get; set; }
    public int GardenId { get; set; }
    public string GardenName { get; set; } = string.Empty;
    public string InviteeEmail { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // "Pending"
    public DateTime InvitedAt { get; set; }
    public DateTime TokenExpiresAt { get; set; }
    public string Message { get; set; } = string.Empty; // "Invitation sent successfully"
}
