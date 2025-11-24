using MamMoi.Application.DTOs;

namespace MamMoi.Application.Interfaces;

/// <summary>
/// Interface for payment service operations
/// </summary>
public interface IPaymentService
{
    /// <summary>
    /// Get payment history for a user with pagination
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="page">Page number (1-based)</param>
    /// <param name="pageSize">Number of records per page</param>
    /// <returns>Paged payment history</returns>
    Task<PaymentHistoryPagedDto> GetPaymentHistoryAsync(int userId, int page = 1, int pageSize = 10);

    /// <summary>
    /// Get payment history for a user (all records)
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>List of payments</returns>
    Task<List<PaymentHistoryDto>> GetAllPaymentHistoryAsync(int userId);

    /// <summary>
    /// Get payment details by payment ID
    /// </summary>
    /// <param name="paymentId">Payment ID</param>
    /// <param name="userId">User ID (for authorization)</param>
    /// <returns>Payment details</returns>
    Task<PaymentHistoryDto?> GetPaymentDetailAsync(int paymentId, int userId);

    /// <summary>
    /// Get payment history filtered by status and date range
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="status">Transaction status (Completed, Failed, Pending, etc.)</param>
    /// <param name="startDate">Start date filter</param>
    /// <param name="endDate">End date filter</param>
    /// <param name="page">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Filtered payment history</returns>
    Task<PaymentHistoryPagedDto> GetPaymentHistoryFilteredAsync(
        int userId,
        string? status = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int page = 1,
        int pageSize = 10);

    /// <summary>
    /// Get payment statistics for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Payment statistics</returns>
    Task<PaymentStatisticsDto> GetPaymentStatisticsAsync(int userId);

    /// <summary>
    /// Get summary of recent payments
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="limit">Number of recent payments (default 5)</param>
    /// <returns>List of recent payments</returns>
    Task<List<PaymentSummaryDto>> GetRecentPaymentsAsync(int userId, int limit = 5);

    /// <summary>
    /// Check if user has any completed payments
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>True if user has completed payments</returns>
    Task<bool> HasCompletedPaymentsAsync(int userId);

    /// <summary>
    /// Get total amount paid by user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Total amount paid</returns>
    Task<decimal> GetTotalAmountPaidAsync(int userId);
}
