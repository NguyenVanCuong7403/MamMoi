namespace MamMoi.Application.DTOs.CareSchedule;

/// <summary>
/// DTO for listing care tasks
/// </summary>
public class CareTaskListItemDto
{
    public int ScheduleId { get; set; }

    public int TreeId { get; set; }

    public string? TaskType { get; set; }

    public string? TaskName { get; set; }

    public string? Description { get; set; }

    public DateOnly? ScheduledDate { get; set; }

    public string? ScheduledTimeOfDay { get; set; }

    public string? Status { get; set; }

    public string? Priority { get; set; }

    public DateTime? CompletedAt { get; set; }

    public string? CompletedByUserName { get; set; }

    public DateTime CreatedAt { get; set; }
}
