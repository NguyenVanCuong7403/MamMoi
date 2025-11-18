using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Garden;

/// <summary>
/// DTO for updating an existing garden.
/// Only Garden Owner (Farmer) can update.
/// </summary>
public class UpdateGardenDto
{
    /// <summary>
    /// Garden name (optional for update, 3-100 characters if provided)
    /// </summary>
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Garden name must be between 3 and 100 characters")]
    public string? Name { get; set; }

    /// <summary>
    /// Garden location/address (optional, max 500 characters)
    /// </summary>
    [StringLength(500, ErrorMessage = "Location cannot exceed 500 characters")]
    public string? Location { get; set; }

    /// <summary>
    /// Time zone of the garden (optional, max 100 characters)
    /// </summary>
    [StringLength(100, ErrorMessage = "Time zone cannot exceed 100 characters")]
    public string? TimeZone { get; set; }

    public string Status { get; set; } = "Đang hoạt động";

    public string? CoverUrl { get; set; } = null;

    /// <summary>
    /// Climate zone of the garden (optional, max 50 characters)
    /// </summary>
    [StringLength(50, ErrorMessage = "Climate zone cannot exceed 50 characters")]
    public string? ClimateZone { get; set; }
}
