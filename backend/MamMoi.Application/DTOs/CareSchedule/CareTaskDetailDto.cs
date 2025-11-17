namespace MamMoi.Application.DTOs.CareSchedule;

/// <summary>
/// DTO for viewing care task detail
/// </summary>
public class CareTaskDetailDto
{
    public int ScheduleId { get; set; }

    public int TreeId { get; set; }

    public string? TaskType { get; set; }

    public string? TaskName { get; set; }

    public string? Description { get; set; }

    public DateOnly? ScheduledDate { get; set; }

    public string? ScheduledTimeOfDay { get; set; }

    public int? EstimatedDurationMinutes { get; set; }

    public string? Status { get; set; }

    public DateTime? CompletedAt { get; set; }

    public string? CompletedByUserName { get; set; }

    public decimal? WaterAmountLiters { get; set; }

    public string? WaterSource { get; set; }

    public decimal? ActualWaterAmountLiters { get; set; }

    public string? FertilizerType { get; set; }

    public int? FertilizerAmountGrams { get; set; }

    public decimal? ActualFertilizerAmountGrams { get; set; }

    public string? ApplicationMethod { get; set; }

    public string? PruningType { get; set; }

    public string? PruningNotes { get; set; }

    public string? Priority { get; set; }

    public bool? IsRecurring { get; set; }

    public string? RecurrencePattern { get; set; }

    public string? Notes { get; set; }

    public string? CompletionNotes { get; set; }

    public string? PhotoUrls { get; set; }

    public int? ResultRating { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
