using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.SupportRequest;

/// <summary>
/// DTO for updating support request status/resolution (admin only)
/// </summary>
public class UpdateSupportRequestDto
{
    [RegularExpression("^(Open|InProgress|Resolved|Closed|Cancelled)$", 
        ErrorMessage = "Status must be Open, InProgress, Resolved, Closed, or Cancelled")]
    public string? Status { get; set; }

    [StringLength(5000, ErrorMessage = "Resolution cannot exceed 5000 characters")]
    public string? Resolution { get; set; }

    [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
    public string? Category { get; set; }

    [RegularExpression("^(Low|Normal|High|Urgent)$", ErrorMessage = "Priority must be Low, Normal, High, or Urgent")]
    public string? Priority { get; set; }
}

