namespace MamMoi.Application.DTOs;

public record TreeDetailDto(
    int TreeId, int GardenId, int UserId, int TreeTypeId, int StageId, int TreeVarietyId,
    string? TreeCode, string? TreeName, DateOnly? PlantDate,
    string? Location, int? preMonths,
    int? GardenSoilId, bool? IsActive, bool? IsFruiting,
    DateOnly? ExpectedHarvestDate, DateOnly? LastHarvestDate,
    decimal? TotalHarvestedKg, decimal? AverageYieldPerYearKg,
    string? Notes, string? QrcodeUrl, DateTime CreatedAt, DateTime? UpdatedAt,
    string GardenName, string TreeTypeName, string StageName, int StageOrder, string TreeVarietyName,
    string? LeafStatus, string? BranchStatus, string? FlowerStatus, string? FruitStatus
    , int? VirtualAgeMonths
);
