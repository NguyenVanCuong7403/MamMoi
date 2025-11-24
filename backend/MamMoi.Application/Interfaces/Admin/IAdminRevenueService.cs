using MamMoi.Application.DTOs.Admin;

namespace MamMoi.Application.Interfaces.Admin;

/// <summary>
/// Service interface for admin revenue management
/// </summary>
public interface IAdminRevenueService
{
    /// <summary>
    /// Get revenue statistics for a period
    /// </summary>
    Task<RevenueStatisticsDto> GetRevenueStatisticsAsync(
        DateTime? startDate = null,
        DateTime? endDate = null);

    /// <summary>
    /// Get revenue by period (monthly, quarterly, yearly)
    /// </summary>
    Task<List<RevenueByPeriodDto>> GetRevenueByPeriodAsync(
        string periodType = "monthly", // monthly, quarterly, yearly
        DateTime? startDate = null,
        DateTime? endDate = null);

    /// <summary>
    /// Get revenue by subscription plan
    /// </summary>
    Task<List<RevenueByPlanDto>> GetRevenueByPlanAsync(
        DateTime? startDate = null,
        DateTime? endDate = null);

    /// <summary>
    /// Get revenue summary with all statistics
    /// </summary>
    Task<RevenueSummaryDto> GetRevenueSummaryAsync(
        DateTime? startDate = null,
        DateTime? endDate = null,
        int recentPaymentsCount = 10);

    /// <summary>
    /// Get payment list with pagination
    /// </summary>
    Task<(List<AdminPaymentListDto> payments, int totalCount)> GetPaymentsAsync(
        int page = 1,
        int pageSize = 20,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? userId = null,
        string? transactionStatus = null);
}

