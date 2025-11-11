// Application/DTOs/TreeDetailDto.cs
namespace MamMoi.Application.DTOs;

public record TreeDetailDto(
    int TreeId, int GardenId, int UserId, int TreeTypeId, int StageId,
    string? TreeCode, string? TreeName, DateOnly? PlantDate,
    string HealthStatus, string? Location,
    int? GardenSoilId, bool? IsActive, bool? IsFruiting,
    DateOnly? ExpectedHarvestDate, DateOnly? LastHarvestDate,
    decimal? TotalHarvestedKg, decimal? AverageYieldPerYearKg,
    string? Notes, string? QrcodeUrl, DateTime CreatedAt, DateTime? UpdatedAt,
    string GardenName, string TreeTypeName, string StageName,
    string? GardenTimeZone, string? GardenClimateZone
);
