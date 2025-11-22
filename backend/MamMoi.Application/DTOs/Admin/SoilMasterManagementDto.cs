using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Admin;

/// <summary>
/// DTO for creating a new soil master
/// </summary>
public class CreateSoilMasterDto
{
    [Required]
    [StringLength(100)]
    public string SoilName { get; set; } = null!;

    [StringLength(20)]
    public string? Texture { get; set; }

    [StringLength(20)]
    public string? Drainage { get; set; }

    [Range(0, 100)]
    public decimal? OrganicMatterPct { get; set; }

    [Range(0, 100)]
    public decimal? EcDSM { get; set; }

    [StringLength(255)]
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for updating a soil master
/// </summary>
public class UpdateSoilMasterDto
{
    [StringLength(100)]
    public string? SoilName { get; set; }

    [StringLength(20)]
    public string? Texture { get; set; }

    [StringLength(20)]
    public string? Drainage { get; set; }

    [Range(0, 100)]
    public decimal? OrganicMatterPct { get; set; }

    [Range(0, 100)]
    public decimal? EcDSM { get; set; }

    [StringLength(255)]
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for soil master details
/// </summary>
public class SoilMasterDetailDto
{
    public int SoilMasterId { get; set; }
    public string SoilName { get; set; } = null!;
    public string? Texture { get; set; }
    public string? Drainage { get; set; }
    public decimal? OrganicMatterPct { get; set; }
    public decimal? EcDSM { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int TreeTypesCount { get; set; }
    public int GardenSoilsCount { get; set; }
}

/// <summary>
/// DTO for soil master list item
/// </summary>
public class SoilMasterListItemDto
{
    public int SoilMasterId { get; set; }
    public string SoilName { get; set; } = null!;
    public string? Texture { get; set; }
    public string? Drainage { get; set; }
    public int TreeTypesCount { get; set; }
    public int GardenSoilsCount { get; set; }
}

