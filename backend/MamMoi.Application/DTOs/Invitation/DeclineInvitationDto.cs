using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Invitation;

/// <summary>
/// DTO để Staff từ chối lời mời
/// </summary>
public class DeclineInvitationDto
{
    /// <summary>
    /// Token từ email invitation
    /// </summary>
    [Required(ErrorMessage = "Invitation token is required")]
    [MinLength(20, ErrorMessage = "Invalid token format")]
    [MaxLength(100, ErrorMessage = "Invalid token format")]
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Lý do từ chối (optional)
    /// </summary>
    [MaxLength(500, ErrorMessage = "Reason must not exceed 500 characters")]
    public string? Reason { get; set; }
}
