using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Invitation;

/// <summary>
/// DTO để Staff accept lời mời vào vườn
/// </summary>
public class AcceptInvitationDto
{
    /// <summary>
    /// Token từ email invitation
    /// </summary>
    [Required(ErrorMessage = "Invitation token is required")]
    [MinLength(20, ErrorMessage = "Invalid token format")]
    [MaxLength(100, ErrorMessage = "Invalid token format")]
    public string Token { get; set; } = string.Empty;
}
