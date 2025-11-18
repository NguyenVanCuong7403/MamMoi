namespace MamMoi.Application.DTOs.Garden;

/// <summary>
/// DTO for Garden list item (used in paginated lists).
/// Contains basic garden information without detailed statistics.
/// </summary>
public class GardenListDto
{
    public int GardenId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? TimeZone { get; set; }
    public string? ClimateZone { get; set; }
    public DateTime CreatedAt { get; set; }

    public string Status { get; set; } = "Đang hoạt động";
    public string? CoverUrl { get; set; } = null;

    /// <summary>
    /// Total number of trees in the garden (for quick overview)
    /// </summary>
    public int TotalTrees { get; set; }

    /// <summary>
    /// Is the current user the owner of this garden?
    /// </summary>
    public bool IsOwner { get; set; }
}

/// <summary>
/// Paginated response for garden list
/// </summary>
public class GardenListResponseDto
{
    public List<GardenListDto> Gardens { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}
