namespace MamMoi.Application.DTOs.CareSchedule;

/// <summary>
/// DTO for editing a care task
/// </summary>
public class EditCareTaskDto
{
    /// <summary>
    /// Name/title of the task
    /// </summary>
    public string? TaskName { get; set; }

    /// <summary>
    /// Description of the task
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Scheduled date (format: YYYY-MM-DD)
    /// </summary>
    public string? ScheduledDate { get; set; }

    /// <summary>
    /// Scheduled time of day: Morning, Afternoon, Evening, Night
    /// </summary>
    public string? ScheduledTimeOfDay { get; set; }

    /// <summary>
    /// Estimated duration in minutes
    /// </summary>
    public int? EstimatedDurationMinutes { get; set; }

    /// <summary>
    /// Priority level: Low, Medium, High, Critical
    /// </summary>
    public string? Priority { get; set; }

    /// <summary>
    /// Water amount in liters (for watering tasks)
    /// </summary>
    public decimal? WaterAmountLiters { get; set; }

    /// <summary>
    /// Water source: Tap, Rain, Well, Recycled
    /// </summary>
    public string? WaterSource { get; set; }

    /// <summary>
    /// Fertilizer type
    /// </summary>
    public string? FertilizerType { get; set; }

    /// <summary>
    /// Fertilizer amount in grams
    /// </summary>
    public int? FertilizerAmountGrams { get; set; }

    /// <summary>
    /// Application method
    /// </summary>
    public string? ApplicationMethod { get; set; }

    /// <summary>
    /// Pruning type (for pruning tasks)
    /// </summary>
    public string? PruningType { get; set; }

    /// <summary>
    /// Pruning notes
    /// </summary>
    public string? PruningNotes { get; set; }

    /// <summary>
    /// Recurrence pattern: Daily, Weekly, Monthly, Yearly
    /// </summary>
    public string? RecurrencePattern { get; set; }

    /// <summary>
    /// Additional notes
    /// </summary>
    public string? Notes { get; set; }
}
