using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.SupportRequest;

/// <summary>
/// DTO for submitting feedback on resolved support request
/// </summary>
public class SupportRequestFeedbackDto
{
    [Required(ErrorMessage = "Satisfaction rating is required")]
    [Range(1, 5, ErrorMessage = "Satisfaction rating must be between 1 and 5")]
    public int SatisfactionRating { get; set; }

    [StringLength(1000, ErrorMessage = "Feedback cannot exceed 1000 characters")]
    public string? Feedback { get; set; }
}

