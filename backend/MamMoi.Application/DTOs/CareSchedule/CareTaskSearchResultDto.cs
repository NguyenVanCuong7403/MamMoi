namespace MamMoi.Application.DTOs.CareSchedule;

/// <summary>
/// DTO for search results with pagination
/// </summary>
public class CareTaskSearchResultDto
{
    public int ScheduleId { get; set; }

    public int TreeId { get; set; }

    public string? TreeCode { get; set; }

    public string? TreeName { get; set; }

    public int? GardenId { get; set; }

    public string? GardenName { get; set; }

    public string? TaskType { get; set; }

    public string? TaskName { get; set; }

    public string? Description { get; set; }

    public DateOnly? ScheduledDate { get; set; }

    public string? ScheduledTimeOfDay { get; set; }

    public string? Status { get; set; }

    public string? Priority { get; set; }

    public DateTime? CompletedAt { get; set; }

    public DateTime CreatedAt { get; set; }
}
