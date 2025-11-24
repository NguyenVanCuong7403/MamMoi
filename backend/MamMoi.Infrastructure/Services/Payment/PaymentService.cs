using Microsoft.EntityFrameworkCore;
using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;

namespace MamMoi.Infrastructure.Services.Payment;

/// <summary>
/// Service for handling payment operations
/// </summary>
public class PaymentService : IPaymentService
{
    private readonly MamMoiDbContext _context;

    public PaymentService(MamMoiDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get payment history for a user with pagination
    /// </summary>
    public async Task<PaymentHistoryPagedDto> GetPaymentHistoryAsync(int userId, int page = 1, int pageSize = 10)
    {
        // Validate pagination parameters
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100; // Max 100 per page

        // Get total count
        var totalCount = await _context.Payments
            .Where(p => p.UserId == userId)
            .CountAsync();

        // Get paginated payments - ensure ToListAsync completes before Select
        var payments = await _context.Payments
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.PaymentDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToListAsync();

        // Map in memory after database query completes
        var paymentsDto = payments
            .Select(MapToPaymentHistoryDto)
            .ToList();

        return new PaymentHistoryPagedDto
        {
            Payments = paymentsDto,
            Total = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    /// <summary>
    /// Get all payment history for a user
    /// </summary>
    public async Task<List<PaymentHistoryDto>> GetAllPaymentHistoryAsync(int userId)
    {
        var payments = await _context.Payments
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.PaymentDate)
            .AsNoTracking()
            .ToListAsync();

        return payments
            .Select(MapToPaymentHistoryDto)
            .ToList();
    }

    /// <summary>
    /// Get payment details by ID
    /// </summary>
    public async Task<PaymentHistoryDto?> GetPaymentDetailAsync(int paymentId, int userId)
    {
        var payment = await _context.Payments
            .Where(p => p.PaymentId == paymentId && p.UserId == userId)
            .AsNoTracking()
            .FirstOrDefaultAsync();

        if (payment == null)
            return null;

        return MapToPaymentHistoryDto(payment);
    }

    /// <summary>
    /// Get filtered payment history
    /// </summary>
    public async Task<PaymentHistoryPagedDto> GetPaymentHistoryFilteredAsync(
        int userId,
        string? status = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int page = 1,
        int pageSize = 10)
    {
        // Validate pagination
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        // Build query
        var query = _context.Payments
            .Where(p => p.UserId == userId);

        // Apply status filter
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(p => p.TransactionStatus == status);
        }

        // Apply date range filter
        if (startDate.HasValue)
        {
            query = query.Where(p => p.PaymentDate >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            var endOfDay = endDate.Value.AddDays(1).AddTicks(-1);
            query = query.Where(p => p.PaymentDate <= endOfDay);
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Get paginated results
        var payments = await query
            .OrderByDescending(p => p.PaymentDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToListAsync();

        // Map in memory after database query completes
        var paymentsDto = payments
            .Select(MapToPaymentHistoryDto)
            .ToList();

        return new PaymentHistoryPagedDto
        {
            Payments = paymentsDto,
            Total = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    /// <summary>
    /// Get payment statistics for a user
    /// </summary>
    public async Task<PaymentStatisticsDto> GetPaymentStatisticsAsync(int userId)
    {
        var payments = await _context.Payments
            .Where(p => p.UserId == userId)
            .ToListAsync();

        var totalAmount = payments.Sum(p => p.Amount);
        var successfulPayments = payments.Count(p => p.TransactionStatus == "Completed");
        var failedPayments = payments.Count(p => p.TransactionStatus == "Failed");
        var refundedPayments = payments.Count(p => p.IsRefunded);
        var totalRefundedAmount = payments.Where(p => p.IsRefunded).Sum(p => p.RefundAmount ?? 0);

        return new PaymentStatisticsDto
        {
            TotalPayments = payments.Count,
            TotalAmount = totalAmount,
            SuccessfulPayments = successfulPayments,
            FailedPayments = failedPayments,
            RefundedPayments = refundedPayments,
            TotalRefundedAmount = totalRefundedAmount,
            AveragePaymentAmount = payments.Count > 0 ? totalAmount / payments.Count : 0,
            LastPaymentDate = payments.Any() ? payments.Max(p => p.PaymentDate) : null
        };
    }

    /// <summary>
    /// Get recent payments summary
    /// </summary>
    public async Task<List<PaymentSummaryDto>> GetRecentPaymentsAsync(int userId, int limit = 5)
    {
        // Validate limit
        if (limit < 1) limit = 5;
        if (limit > 20) limit = 20;

        var payments = await _context.Payments
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.PaymentDate)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();

        return payments
            .Select(MapToPaymentSummaryDto)
            .ToList();
    }

    /// <summary>
    /// Check if user has completed payments
    /// </summary>
    public async Task<bool> HasCompletedPaymentsAsync(int userId)
    {
        return await _context.Payments
            .AnyAsync(p => p.UserId == userId && p.TransactionStatus == "Completed");
    }

    /// <summary>
    /// Get total amount paid by user
    /// </summary>
    public async Task<decimal> GetTotalAmountPaidAsync(int userId)
    {
        return await _context.Payments
            .Where(p => p.UserId == userId && p.TransactionStatus == "Completed")
            .SumAsync(p => p.Amount);
    }

    #region Helper Methods

    /// <summary>
    /// Map Payment entity to PaymentHistoryDto
    /// </summary>
    private static PaymentHistoryDto MapToPaymentHistoryDto(Models.Payment payment)
    {
        return new PaymentHistoryDto
        {
            PaymentId = payment.PaymentId,
            UserId = payment.UserId,
            SubscriptionId = payment.SubscriptionId,
            PaymentDate = payment.PaymentDate,
            Amount = payment.Amount,
            Currency = payment.Currency,
            PaymentMethod = payment.PaymentMethod,
            PaymentProvider = payment.PaymentProvider,
            TransactionStatus = payment.TransactionStatus,
            TransactionId = payment.TransactionId,
            InvoiceNumber = payment.InvoiceNumber,
            InvoiceUrl = payment.InvoiceUrl,
            ReceiptUrl = payment.ReceiptUrl,
            IsRefunded = payment.IsRefunded,
            RefundAmount = payment.RefundAmount,
            RefundDate = payment.RefundDate,
            RefundReason = payment.RefundReason,
            Description = payment.Description
        };
    }

    /// <summary>
    /// Map Payment entity to PaymentSummaryDto
    /// </summary>
    private static PaymentSummaryDto MapToPaymentSummaryDto(Models.Payment payment)
    {
        return new PaymentSummaryDto
        {
            PaymentId = payment.PaymentId,
            PaymentDate = payment.PaymentDate,
            Amount = payment.Amount,
            Currency = payment.Currency,
            TransactionStatus = payment.TransactionStatus,
            PaymentMethod = payment.PaymentMethod,
            IsRefunded = payment.IsRefunded
        };
    }

    #endregion
}
