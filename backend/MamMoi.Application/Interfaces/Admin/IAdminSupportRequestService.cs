using MamMoi.Application.DTOs.SupportRequest;

namespace MamMoi.Application.Interfaces.Admin;

/// <summary>
/// Interface for Admin Support Request Service
/// </summary>
public interface IAdminSupportRequestService
{
    /// <summary>
    /// Get all support requests with filters (admin view)
    /// </summary>
    Task<(List<SupportRequestListItemDto> requests, int totalCount)> GetAllRequestsAsync(
        int page = 1,
        int pageSize = 20,
        string? status = null,
        string? priority = null,
        string? category = null,
        int? userId = null,
        DateTime? startDate = null,
        DateTime? endDate = null);

    /// <summary>
    /// Get support request details by ID (admin view)
    /// </summary>
    Task<SupportRequestDto?> GetRequestByIdAsync(int requestId);

    /// <summary>
    /// Update support request (status, resolution, etc.)
    /// </summary>
    Task<SupportRequestDto?> UpdateRequestAsync(int requestId, UpdateSupportRequestDto dto);

    /// <summary>
    /// Get support request statistics
    /// </summary>
    Task<SupportRequestStatisticsDto> GetStatisticsAsync(DateTime? startDate = null, DateTime? endDate = null);
}

/// <summary>
/// DTO for support request statistics
/// </summary>
public class SupportRequestStatisticsDto
{
    public int TotalRequests { get; set; }
    public int OpenRequests { get; set; }
    public int InProgressRequests { get; set; }
    public int ResolvedRequests { get; set; }
    public int ClosedRequests { get; set; }
    public int UrgentRequests { get; set; }
    public double AverageResolutionTimeHours { get; set; }
    public double AverageSatisfactionRating { get; set; }
    public Dictionary<string, int> RequestsByCategory { get; set; } = new();
    public Dictionary<string, int> RequestsByPriority { get; set; } = new();
}

