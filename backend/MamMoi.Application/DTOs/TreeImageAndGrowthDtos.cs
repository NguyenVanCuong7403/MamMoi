using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs
{
  
    // ===== Images =====
    public record TreeImageDto(
        int ImageId,
        string ImageUrl,
        string? ThumbnailUrl,
        string? Description,
        DateTime? UploadedAt,
        DateTime? CapturedAt
    );

    public record UploadTreeImageRequest(
        string ImageUrl,
        string? ThumbnailUrl,
        string? Description,
        DateTime? CapturedAt,
        string? Tags
    );

    // ===== Growth Stage =====
    public record GrowthStageDto(
        int StageId,
        string StageName,
        int StageOrder,
        string? Description,
        string? Icon,
        string? NodeColor,
        string? LineColor,
        int? MinAgeInMonths,
        int? MaxAgeInMonths
    );

    // ===== Growth History =====
    public record GrowthHistoryItemDto(
        DateTime When,
        string Source,   // "Activity" | "CareSchedule" | "Weather" | "Image"
        string Title,
        string? Detail
    );

    // ===== Growth Chart =====
    public record GrowthChartPointDto(
        DateTime When,
        decimal? HeightMeters,
        decimal? HealthScore,
        decimal? TotalHarvestedKg
    );
}
