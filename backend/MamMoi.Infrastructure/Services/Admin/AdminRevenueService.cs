using MamMoi.Application.DTOs.Admin;
using MamMoi.Application.Interfaces.Admin;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MamMoi.Infrastructure.Services.Admin;

/// <summary>
/// Service for admin revenue management
/// </summary>
public class AdminRevenueService : IAdminRevenueService
{
    private readonly MamMoiDbContext _dbContext;
    private readonly ILogger<AdminRevenueService> _logger;

    public AdminRevenueService(
        MamMoiDbContext dbContext,
        ILogger<AdminRevenueService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<RevenueStatisticsDto> GetRevenueStatisticsAsync(
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        var query = _dbContext.Payments.AsQueryable();

        if (startDate.HasValue)
            query = query.Where(p => p.PaymentDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(p => p.PaymentDate <= endDate.Value);

        var payments = await query.ToListAsync();

        var totalRevenue = payments
            .Where(p => p.TransactionStatus == "Success" || p.TransactionStatus == "Completed")
            .Sum(p => (decimal?)p.Amount) ?? 0;

        var totalRefunded = payments
            .Where(p => p.IsRefunded)
            .Sum(p => (decimal?)(p.RefundAmount ?? p.Amount)) ?? 0;

        var netRevenue = totalRevenue - totalRefunded;

        var totalTransactions = payments.Count;
        var successfulTransactions = payments.Count(p => 
            p.TransactionStatus == "Success" || p.TransactionStatus == "Completed");
        var refundedTransactions = payments.Count(p => p.IsRefunded);

        return new RevenueStatisticsDto
        {
            TotalRevenue = totalRevenue,
            TotalRefunded = totalRefunded,
            NetRevenue = netRevenue,
            TotalTransactions = totalTransactions,
            SuccessfulTransactions = successfulTransactions,
            RefundedTransactions = refundedTransactions,
            PeriodStart = startDate,
            PeriodEnd = endDate
        };
    }

    public async Task<List<RevenueByPeriodDto>> GetRevenueByPeriodAsync(
        string periodType = "monthly",
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        var query = _dbContext.Payments
            .Where(p => p.TransactionStatus == "Success" || p.TransactionStatus == "Completed")
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(p => p.PaymentDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(p => p.PaymentDate <= endDate.Value);

        var payments = await query.ToListAsync();

        var grouped = periodType.ToLower() switch
        {
            "monthly" => payments
                .GroupBy(p => new { p.PaymentDate.Year, p.PaymentDate.Month })
                .Select(g => new
                {
                    Period = $"{g.Key.Year}-{g.Key.Month:D2}",
                    PeriodStart = new DateTime(g.Key.Year, g.Key.Month, 1),
                    PeriodEnd = new DateTime(g.Key.Year, g.Key.Month, 1).AddMonths(1).AddDays(-1),
                    Payments = g.ToList()
                }),
            "quarterly" => payments
                .GroupBy(p => new { p.PaymentDate.Year, Quarter = (p.PaymentDate.Month - 1) / 3 + 1 })
                .Select(g => new
                {
                    Period = $"{g.Key.Year}-Q{g.Key.Quarter}",
                    PeriodStart = new DateTime(g.Key.Year, (g.Key.Quarter - 1) * 3 + 1, 1),
                    PeriodEnd = new DateTime(g.Key.Year, g.Key.Quarter * 3, 1).AddDays(-1),
                    Payments = g.ToList()
                }),
            "yearly" => payments
                .GroupBy(p => p.PaymentDate.Year)
                .Select(g => new
                {
                    Period = g.Key.ToString(),
                    PeriodStart = new DateTime(g.Key, 1, 1),
                    PeriodEnd = new DateTime(g.Key, 12, 31),
                    Payments = g.ToList()
                }),
            _ => payments
                .GroupBy(p => new { p.PaymentDate.Year, p.PaymentDate.Month })
                .Select(g => new
                {
                    Period = $"{g.Key.Year}-{g.Key.Month:D2}",
                    PeriodStart = new DateTime(g.Key.Year, g.Key.Month, 1),
                    PeriodEnd = new DateTime(g.Key.Year, g.Key.Month, 1).AddMonths(1).AddDays(-1),
                    Payments = g.ToList()
                })
        };

        return grouped.Select(g => new RevenueByPeriodDto
        {
            Period = g.Period,
            PeriodStart = g.PeriodStart,
            PeriodEnd = g.PeriodEnd,
            Revenue = g.Payments.Sum(p => (decimal?)p.Amount) ?? 0,
            Refunded = g.Payments.Where(p => p.IsRefunded).Sum(p => (decimal?)(p.RefundAmount ?? p.Amount)) ?? 0,
            NetRevenue = g.Payments.Sum(p => (decimal?)p.Amount) ?? 0 - 
                        (g.Payments.Where(p => p.IsRefunded).Sum(p => (decimal?)(p.RefundAmount ?? p.Amount)) ?? 0),
            TransactionCount = g.Payments.Count
        })
        .OrderBy(r => r.PeriodStart)
        .ToList();
    }

    public async Task<List<RevenueByPlanDto>> GetRevenueByPlanAsync(
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        var query = _dbContext.Payments
            .Include(p => p.Subscription)
            .Where(p => p.TransactionStatus == "Success" || p.TransactionStatus == "Completed")
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(p => p.PaymentDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(p => p.PaymentDate <= endDate.Value);

        var payments = await query.ToListAsync();

        // Get plan information from subscriptions
        var planGroups = payments
            .GroupBy(p => p.Subscription.PlanName)
            .Select(g => new
            {
                PlanName = g.Key,
                Payments = g.ToList(),
                Subscriptions = g.Select(p => p.SubscriptionId).Distinct().ToList()
            })
            .ToList();

        var result = new List<RevenueByPlanDto>();

        foreach (var group in planGroups)
        {
            var plan = await _dbContext.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.PlanName == group.PlanName);

            if (plan != null)
            {
                var totalRevenue = group.Payments.Sum(p => (decimal?)p.Amount) ?? 0;
                var subscriptionCount = group.Subscriptions.Count;
                var paymentCount = group.Payments.Count;
                var avgRevenue = subscriptionCount > 0 ? totalRevenue / subscriptionCount : 0;

                result.Add(new RevenueByPlanDto
                {
                    PlanId = plan.PlanId,
                    PlanName = plan.PlanName,
                    TotalRevenue = totalRevenue,
                    SubscriptionCount = subscriptionCount,
                    PaymentCount = paymentCount,
                    AverageRevenuePerSubscription = avgRevenue
                });
            }
        }

        return result.OrderByDescending(r => r.TotalRevenue).ToList();
    }

    public async Task<RevenueSummaryDto> GetRevenueSummaryAsync(
        DateTime? startDate = null,
        DateTime? endDate = null,
        int recentPaymentsCount = 10)
    {
        var overall = await GetRevenueStatisticsAsync(startDate, endDate);
        var byPeriod = await GetRevenueByPeriodAsync("monthly", startDate, endDate);
        var byPlan = await GetRevenueByPlanAsync(startDate, endDate);
        var recentPayments = await GetPaymentsAsync(1, recentPaymentsCount, startDate, endDate);

        return new RevenueSummaryDto
        {
            Overall = overall,
            ByPeriod = byPeriod,
            ByPlan = byPlan,
            RecentPayments = recentPayments.payments
        };
    }

    public async Task<(List<AdminPaymentListDto> payments, int totalCount)> GetPaymentsAsync(
        int page = 1,
        int pageSize = 20,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? userId = null,
        string? transactionStatus = null)
    {
        var query = _dbContext.Payments
            .Include(p => p.User)
            .Include(p => p.Subscription)
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(p => p.PaymentDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(p => p.PaymentDate <= endDate.Value);

        if (userId.HasValue)
            query = query.Where(p => p.UserId == userId.Value);

        if (!string.IsNullOrWhiteSpace(transactionStatus))
            query = query.Where(p => p.TransactionStatus == transactionStatus);

        var totalCount = await query.CountAsync();

        var payments = await query
            .OrderByDescending(p => p.PaymentDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new AdminPaymentListDto
            {
                PaymentId = p.PaymentId,
                UserId = p.UserId,
                UserName = p.User.FullName,
                UserEmail = p.User.Email,
                SubscriptionId = p.SubscriptionId,
                PlanName = p.Subscription.PlanName,
                PaymentDate = p.PaymentDate,
                Amount = p.Amount,
                Currency = p.Currency,
                PaymentMethod = p.PaymentMethod,
                PaymentProvider = p.PaymentProvider,
                TransactionStatus = p.TransactionStatus,
                IsRefunded = p.IsRefunded,
                RefundAmount = p.RefundAmount,
                RefundDate = p.RefundDate,
                SubscriptionStartDate = p.Subscription != null
                    ? (DateTime?)p.Subscription.StartDate.ToDateTime(TimeOnly.MinValue)
                    : null,
                SubscriptionEndDate = p.Subscription != null && p.Subscription.EndDate.HasValue
                    ? (DateTime?)p.Subscription.EndDate.Value.ToDateTime(TimeOnly.MinValue)
                    : null
            })
            .ToListAsync();

        return (payments, totalCount);
    }
}

