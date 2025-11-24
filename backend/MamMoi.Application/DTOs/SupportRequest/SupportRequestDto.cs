namespace MamMoi.Application.DTOs.SupportRequest;

/// <summary>
/// DTO for support request details
/// </summary>
public class SupportRequestDto
{
    public int RequestId { get; set; }
    public int UserId { get; set; }
    public string UserFullName { get; set; } = null!;
    public string UserEmail { get; set; } = null!;
    public int? TreeId { get; set; }
    public string? TreeName { get; set; }
    public DateTime RequestDate { get; set; }
    public string Subject { get; set; } = null!;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string Priority { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string? Resolution { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public int? SatisfactionRating { get; set; }
    public string? Feedback { get; set; }
    public DateTime? FeedbackDate { get; set; }
    public string? AttachmentUrls { get; set; }
    public int ResponseCount { get; set; }
    public string? TicketNumber { get; set; }
}

