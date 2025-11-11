// Application/DTOs/TreeIoDtos.cs
namespace MamMoi.Application.DTOs
{
    public record CreateTreeRequest(
        int GardenId,
        int TreeTypeId,
        int StageId,
        string? TreeCode,
        string? TreeName,
        DateOnly? PlantDate,
        int? GardenSoilId,
        string? Location = null,          // FE có ô “Vị trí”
        string? Notes = null              // FE có “Ghi chú”
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
        DateOnly? ExpectedHarvestDate,
        string? Notes
    );

    public record UpdateTreeStatusRequest(
        string? HealthStatus,
        bool? IsActive,
        bool? IsFruiting
    );

    public record TreeCreatedDto(int TreeId);
    public record TreeSummaryDto(int TreeId, string? TreeName, string? TreeCode);
}
