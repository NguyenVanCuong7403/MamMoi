namespace MamMoi.Application.DTOs;

public record TreeDetailDto(
    int TreeId, int GardenId, int UserId, int TreeTypeId, int StageId,
    string? TreeCode, string? TreeName, DateOnly? PlantDate, decimal? HeightMeters,
    string HealthStatus, decimal? HealthScore, decimal? Latitude, decimal? Longitude, string? Location,
    DateTime? LastWateredAt, DateTime? NextWateringAt, int? WateringFrequencyDays, decimal? LastWateringAmountLiters,
    int? MinWateringIntervalDays, int? MaxWateringIntervalDays,
    DateTime? LastFertilizedAt, DateTime? NextFertilizingAt, int? FertilizingFrequencyDays,
    string? LastFertilizerType, decimal? LastFertilizerAmountGrams,
    int? GardenSoilId, bool? IsActive, bool? IsFruiting, DateOnly? ExpectedHarvestDate,
    DateOnly? LastHarvestDate, decimal? TotalHarvestedKg, decimal? AverageYieldPerYearKg,
    string? Notes, string? QrcodeUrl, DateTime CreatedAt, DateTime? UpdatedAt,
    string GardenName, string TreeTypeName, string StageName,
    string? GardenTimeZone, string? GardenClimateZone
);
