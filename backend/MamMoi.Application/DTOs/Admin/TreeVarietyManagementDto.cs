using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Admin;

/// <summary>
/// DTO for creating a new tree variety
/// </summary>
public class CreateTreeVarietyDto
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "TreeTypeId is required")]
    public int TreeTypeId { get; set; }

    [Required]
    [StringLength(255)]
    public string VarietyName { get; set; } = null!;

    [StringLength(int.MaxValue)]
    public string? VarietyDescription { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }
}

/// <summary>
/// DTO for updating a tree variety
/// </summary>
public class UpdateTreeVarietyDto
{
    [Range(1, int.MaxValue)]
    public int? TreeTypeId { get; set; }

    [StringLength(255)]
    public string? VarietyName { get; set; }

    [StringLength(int.MaxValue)]
    public string? VarietyDescription { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }
}

/// <summary>
/// DTO for tree variety details
/// </summary>
public class TreeVarietyDetailDto
{
    public int VarietyId { get; set; }
    public int TreeTypeId { get; set; }
    public string TreeTypeName { get; set; } = null!;
    public string? VarietyName { get; set; }
    public string? VarietyDescription { get; set; }
    public string? ImageUrl { get; set; }
    public int TreesCount { get; set; }
}

/// <summary>
/// DTO for tree variety list item
/// </summary>
public class TreeVarietyListItemDto
{
    public int VarietyId { get; set; }
    public int TreeTypeId { get; set; }
    public string TreeTypeName { get; set; } = null!;
    public string? VarietyName { get; set; }
    public int TreesCount { get; set; }
}

