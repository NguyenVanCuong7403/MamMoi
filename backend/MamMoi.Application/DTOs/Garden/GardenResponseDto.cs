namespace MamMoi.Application.DTOs.Garden;

/// <summary>
/// DTO for Garden detail response.
/// Contains full garden information with statistics.
/// </summary>
public class GardenResponseDto
{
    public int GardenId { get; set; }
    public int UserId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Statistics for the garden
    /// </summary>
    public GardenStatistics Statistics { get; set; } = new();

    /// <summary>
    /// Is the current user the owner of this garden?
    /// </summary>
    public bool IsOwner { get; set; }
}

/// <summary>
/// Garden statistics for dashboard/detail view
/// </summary>
public class GardenStatistics
{
    /// <summary>
    /// Total number of trees in the garden
    /// </summary>
    public int TotalTrees { get; set; }

    /// <summary>
    /// Number of healthy trees
    /// </summary>
    public int HealthyTrees { get; set; }

    /// <summary>
    /// Number of trees that need attention
    /// </summary>
    public int TreesNeedingAttention { get; set; }

    /// <summary>
    /// Number of staff members assigned to this garden
    /// </summary>
    public int TotalStaff { get; set; }
}
