using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs
{
    public record CreateTreeRequest(
        int GardenId,
        int TreeTypeId,
        int StageId,
        string? TreeCode,
        string? TreeName,
        DateOnly? PlantDate,
        int? GardenSoilId);

    public record UpdateTreeRequest(
        string? TreeName,
        DateOnly? PlantDate,
        decimal? HeightMeters,
        decimal? HealthScore,
        string? HealthStatus,
        bool? IsFruiting,
        bool? IsActive,
        int? StageId,
        int? GardenSoilId,
        string? Notes);

    public record UpdateTreeStatusRequest(
        string? HealthStatus,
        decimal? HealthScore,
        bool? IsActive,
        bool? IsFruiting);

    public record UploadTreeImageRequest(
        string ImageUrl,
        string? ThumbnailUrl,
        string? Description,
        DateTime? CapturedAt,
        string? Tags);

    // ===== Outputs =====
    public record TreeCreatedDto(int TreeId);
    public record TreeSummaryDto(int TreeId, string? TreeName, string? TreeCode);

    public record TreeImageDto(
        int ImageId,
        string ImageUrl,
        string? ThumbnailUrl,
        string? Description,
        DateTime? UploadedAt,
        DateTime? CapturedAt);

    public record GrowthHistoryItemDto(
        DateTime When,
        string Source,    // Activity / CareSchedule / Weather / Image
        string Title,
        string? Detail);

    public record GrowthChartPointDto(
        DateTime When,
        decimal? HeightMeters,
        decimal? HealthScore,
        decimal? TotalHarvestedKg);

    public record GrowthStageDto(
        int StageId,
        string StageName,
        int StageOrder,
        string? Description);
}



