// Application/DTOs/TreeListItemDto.cs
namespace MamMoi.Application.DTOs
{
    public record TreeListItemDto(
        int TreeId,
        string? TreeCode,
        string? TreeName,
        string GardenName,
        string TreeTypeName,
        string StageName,
        string HealthStatus,
        DateTime CreatedAt
    );
}
