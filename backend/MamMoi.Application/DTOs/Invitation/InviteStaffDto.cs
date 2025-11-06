using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Invitation;

/// <summary>
/// DTO để Farmer mời Staff vào vườn
/// </summary>
public class InviteStaffDto
{
    /// <summary>
    /// Email của Staff được mời
    /// </summary>
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [MaxLength(100, ErrorMessage = "Email must not exceed 100 characters")]
    public string InviteeEmail { get; set; } = string.Empty;

    /// <summary>
    /// Role của Staff trong vườn (mặc định là Staff = 4)
    /// </summary>
    [Range(4, 4, ErrorMessage = "Only Staff role (4) can be invited")]
    public int RoleId { get; set; } = 4;
}
