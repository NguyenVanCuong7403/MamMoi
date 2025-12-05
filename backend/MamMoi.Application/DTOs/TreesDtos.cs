namespace MamMoi.Application.DTOs
{
    public record CreateTreeRequest(
        int GardenId,
        int TreeTypeId,
        int StageId,
        int TreeVarietyId,
        string? TreeCode,
        string? TreeName,
        DateOnly? PlantDate,
        int? GardenSoilId,
        string? Location = null,
        string? Notes = null,
        int? preMonths = 0,
        // mô tả trạng thái lá/cành/hoa/quả trên form
        string? LeafStatus = null,
        string? BranchStatus = null,
        string? FlowerStatus = null,
        string? FruitStatus = null,
        bool? IsFruiting = null,
        bool? IsActive = null
    );

    public record UpdateTreeRequest(
        string? TreeName,
        string? TreeCode,
        DateOnly? PlantDate,
        int? StageId,
        int? GardenSoilId,
        string? Location,
        bool? IsFruiting,
        bool? IsActive,
        int? preMonths,
        DateOnly? ExpectedHarvestDate,
        string? Notes,
        string? LeafStatus,
        string? BranchStatus,
        string? FlowerStatus,
        string? FruitStatus
    );

    // Bỏ HealthStatus vì DB không có; gom các trạng thái cần update nhanh
    public record UpdateTreeStatusRequest(
        string? LeafStatus,
        string? BranchStatus,
        string? FlowerStatus,
        string? FruitStatus,
        bool? IsActive,
        bool? IsFruiting
    );

    public record TreeCreatedDto(int TreeId);
    public record TreeSummaryDto(int TreeId, string? TreeName, string? TreeCode);

    // Lifecycle management DTOs
    public record UpdateTreeLifecycleRequest(
        string? PhaseId = null, // "growth_development", "flowering", "fruiting", "pre_harvest", "post_harvest"
        int? CycleCount = null,
        bool? Phase1Completed = null,
        bool? AutoSyncEnabled = null,
        string? OverrideReason = null,
        int? StageId = null // Optional TreeGrowthStages.StageId
    );

    public record TreeLifecycleDto(
        int TreeId,
        int StageId,
        int StageOrder,
        string StageName,
        string PhaseId,
        bool Phase1Completed,
        int CycleCount,
        bool LifecycleAutoEnabled,
        DateTime? LifecycleAutoDisabledAt
    );
}
