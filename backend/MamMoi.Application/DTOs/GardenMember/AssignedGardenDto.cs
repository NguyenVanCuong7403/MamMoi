namespace MamMoi.Application.DTOs.GardenMember;

/// <summary>
/// DTO cho thông tin garden được assign cho staff
/// </summary>
public class AssignedGardenDto
{
    public int GardenId { get; set; }
    public string GardenName { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string Status { get; set; } = "Active"; // Status của assignment (Active/Inactive)
    public DateTime CreatedAt { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public int TotalTrees { get; set; }
    public int PendingTasks { get; set; }
}