using MamMoi.Application.DTOs.SupportRequest;

namespace MamMoi.Application.Interfaces;

/// <summary>
/// Interface for Support Request Service - User operations
/// </summary>
public interface ISupportRequestService
{
    /// <summary>
    /// Create a new support request from user
    /// </summary>
    Task<SupportRequestDto> CreateRequestAsync(int userId, CreateSupportRequestDto dto);

    /// <summary>
    /// Get user's own support requests
    /// </summary>
    Task<(List<SupportRequestListItemDto> requests, int totalCount)> GetUserRequestsAsync(
        int userId, int page = 1, int pageSize = 20, string? status = null);

    /// <summary>
    /// Get support request details by ID (user can only see their own)
    /// </summary>
    Task<SupportRequestDto?> GetRequestByIdAsync(int requestId, int userId);

    /// <summary>
    /// Submit feedback for resolved request
    /// </summary>
    Task<bool> SubmitFeedbackAsync(int requestId, int userId, SupportRequestFeedbackDto dto);
}

