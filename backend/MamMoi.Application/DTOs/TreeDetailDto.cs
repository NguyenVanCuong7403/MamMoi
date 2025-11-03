using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs
{
    public record TreeDetailDto(
     int TreeId,
     int GardenId,
     int UserId,
     int TreeTypeId,
     int StageId,
     string? TreeCode,
     string? TreeName,
     DateOnly? PlantDate,
     decimal? HeightMeters,
     string HealthStatus,
     decimal? HealthScore,
     decimal? Latitude,
     decimal? Longitude,
     string? Location,
     decimal? AltitudeMeters,
     string? TimeZone,
     string? ClimateZone,
     DateTime? LastWateredAt,
     DateTime? NextWateringAt,
     int? WateringFrequencyDays,
     decimal? LastWateringAmountLiters,
     bool AutoAdjustWatering,
     int? MinWateringIntervalDays,
     int? MaxWateringIntervalDays,
     DateTime? LastFertilizedAt,
     DateTime? NextFertilizingAt,
     int? FertilizingFrequencyDays,
     string? LastFertilizerType,
     decimal? LastFertilizerAmountGrams,
     string? SunlightExposure,
     decimal? SoilPh,
     int? GardenSoilId,
     bool? IsIndoor,
     bool? IsActive,
     bool? IsFruiting,
     DateOnly? ExpectedHarvestDate,
     DateOnly? LastHarvestDate,
     decimal? TotalHarvestedKg,
     decimal? AverageYieldPerYearKg,
     string? Notes,
     string? QrCodeUrl,
     DateTime CreatedAt,
     DateTime? UpdatedAt,
     string GardenName,
     string TreeTypeName,
     string StageName
 );
}
