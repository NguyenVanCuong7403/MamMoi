// Application/DTOs/TreeListItemDto.cs
namespace MamMoi.Application.DTOs
{
    public record TreeListItemDto(
        int TreeId,
        string? TreeCode,
        string? TreeName,
        string GardenName,
        string TreeTypeName,
        string TreeVarietyName,
        string StageName,
        string HealthStatus,
        string LeafStatus,
        string BranchStatus,
        string? ImageUrl,
        int? preMonths,
        DateTime CreatedAt,
        DateOnly? PlantDate,
        bool IsActive
    );
}

