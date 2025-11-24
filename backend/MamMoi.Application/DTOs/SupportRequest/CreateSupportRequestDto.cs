using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.SupportRequest;

/// <summary>
/// DTO for creating a support request from user
/// </summary>
public class CreateSupportRequestDto
{
    [Required(ErrorMessage = "Subject is required")]
    [StringLength(200, ErrorMessage = "Subject cannot exceed 200 characters")]
    public string Subject { get; set; } = null!;

    [StringLength(5000, ErrorMessage = "Description cannot exceed 5000 characters")]
    public string? Description { get; set; }

    [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
    public string? Category { get; set; }

    [RegularExpression("^(Low|Normal|High|Urgent)$", ErrorMessage = "Priority must be Low, Normal, High, or Urgent")]
    public string? Priority { get; set; }

    public int? TreeId { get; set; }

    public string? AttachmentUrls { get; set; }
}

