namespace MamMoi.Application.DTOs.CareSchedule;

/// <summary>
/// DTO for marking a task as complete
/// </summary>
public class MarkTaskCompleteDto
{
    /// <summary>
    /// Notes about task completion
    /// </summary>
    public string? CompletionNotes { get; set; }

    /// <summary>
    /// Actual water amount used (in liters)
    /// </summary>
    public decimal? ActualWaterAmountLiters { get; set; }

    /// <summary>
    /// Actual fertilizer amount used (in grams)
    /// </summary>
    public decimal? ActualFertilizerAmountGrams { get; set; }

    /// <summary>
    /// Photo URLs (comma-separated)
    /// </summary>
    public string? PhotoUrls { get; set; }

    /// <summary>
    /// Result rating (1-5)
    /// </summary>
    public int? ResultRating { get; set; }
}
