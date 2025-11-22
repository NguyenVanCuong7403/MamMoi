using MamMoi.Application.DTOs.Admin;

namespace MamMoi.Application.Interfaces.Admin;

/// <summary>
/// Interface for Admin Subscription Service
/// </summary>
public interface IAdminSubscriptionService
{
    /// <summary>
    /// Get all subscriptions with filters (admin view)
    /// </summary>
    Task<(List<AdminSubscriptionListDto> subscriptions, int totalCount)> GetAllSubscriptionsAsync(
        int page = 1,
        int pageSize = 20,
        string? status = null,
        int? userId = null,
        string? planName = null,
        DateTime? startDate = null,
        DateTime? endDate = null);

    /// <summary>
    /// Get subscription details by ID (admin view)
    /// </summary>
    Task<AdminSubscriptionDetailDto?> GetSubscriptionByIdAsync(int subscriptionId);

    /// <summary>
    /// Update subscription status
    /// </summary>
    Task<AdminSubscriptionDetailDto?> UpdateSubscriptionAsync(int subscriptionId, AdminUpdateSubscriptionDto dto);
}

