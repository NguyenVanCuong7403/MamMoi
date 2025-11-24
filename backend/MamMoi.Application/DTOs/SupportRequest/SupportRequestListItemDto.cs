namespace MamMoi.Application.DTOs.SupportRequest;

/// <summary>
/// DTO for listing support requests
/// </summary>
public class SupportRequestListItemDto
{
    public int RequestId { get; set; }
    public int UserId { get; set; }
    public string UserFullName { get; set; } = null!;
    public string UserEmail { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string? Category { get; set; }
    public string Priority { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime RequestDate { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? TicketNumber { get; set; }
    public int ResponseCount { get; set; }
}

