using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.SupportRequest;

/// <summary>
/// DTO for updating report (frontend format)
/// </summary>
public class UpdateReportDto
{
    [RegularExpression("^(in_progress|resolved|rejected)$", 
        ErrorMessage = "Status must be in_progress, resolved, or rejected")]
    public string? Status { get; set; }

    [StringLength(5000, ErrorMessage = "Resolution cannot exceed 5000 characters")]
    public string? Resolution { get; set; }

    [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
    public string? Category { get; set; }

    [RegularExpression("^(low|medium|high|urgent)$", ErrorMessage = "Priority must be low, medium, high, or urgent")]
    public string? Priority { get; set; }
}

