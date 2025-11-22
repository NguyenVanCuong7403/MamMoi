using MamMoi.Application.DTOs.Admin;
using MamMoi.Application.Interfaces.Admin;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MamMoi.Infrastructure.Services.Admin;

/// <summary>
/// Admin Subscription Service
/// </summary>
public class AdminSubscriptionService : IAdminSubscriptionService
{
    private readonly MamMoiDbContext _dbContext;
    private readonly ILogger<AdminSubscriptionService> _logger;

    public AdminSubscriptionService(
        MamMoiDbContext dbContext,
        ILogger<AdminSubscriptionService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<(List<AdminSubscriptionListDto> subscriptions, int totalCount)> GetAllSubscriptionsAsync(
        int page = 1,
        int pageSize = 20,
        string? status = null,
        int? userId = null,
        string? planName = null,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        var query = _dbContext.Subscriptions
            .Include(s => s.User)
            .Include(s => s.Payments)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(s => s.Status == status);

        if (userId.HasValue)
            query = query.Where(s => s.UserId == userId.Value);

        if (!string.IsNullOrWhiteSpace(planName))
            query = query.Where(s => s.PlanName.Contains(planName));

        if (startDate.HasValue)
            query = query.Where(s => s.StartDate >= DateOnly.FromDateTime(startDate.Value));

        if (endDate.HasValue)
            query = query.Where(s => s.EndDate <= DateOnly.FromDateTime(endDate.Value));

        var totalCount = await query.CountAsync();

        var subscriptions = await query
            .OrderByDescending(s => s.StartDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new AdminSubscriptionListDto
            {
                SubscriptionId = s.SubscriptionId,
                UserId = s.UserId,
                UserFullName = s.User.FullName,
                UserEmail = s.User.Email,
                PlanName = s.PlanName,
                PlanType = s.PlanType,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                Status = s.Status,
                Price = s.Price,
                Currency = s.Currency,
                LastPaymentDate = s.Payments
                    .Where(p => p.TransactionStatus == "Completed" || p.TransactionStatus == "Success")
                    .OrderByDescending(p => p.PaymentDate)
                    .Select(p => (DateTime?)p.PaymentDate)
                    .FirstOrDefault(),
                PaymentCount = s.Payments.Count,
                TotalPaid = s.Payments
                    .Where(p => p.TransactionStatus == "Completed" || p.TransactionStatus == "Success")
                    .Sum(p => p.Amount)
            })
            .ToListAsync();

        return (subscriptions, totalCount);
    }

    public async Task<AdminSubscriptionDetailDto?> GetSubscriptionByIdAsync(int subscriptionId)
    {
        var subscription = await _dbContext.Subscriptions
            .Include(s => s.User)
            .Include(s => s.Payments)
            .FirstOrDefaultAsync(s => s.SubscriptionId == subscriptionId);

        if (subscription == null)
            return null;

        return new AdminSubscriptionDetailDto
        {
            SubscriptionId = subscription.SubscriptionId,
            UserId = subscription.UserId,
            UserFullName = subscription.User.FullName,
            UserEmail = subscription.User.Email,
            UserPhone = subscription.User.Phone,
            PlanName = subscription.PlanName,
            PlanType = subscription.PlanType,
            StartDate = subscription.StartDate,
            EndDate = subscription.EndDate,
            Status = subscription.Status,
            Price = subscription.Price,
            Currency = subscription.Currency,
            Payments = subscription.Payments
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new SubscriptionPaymentDto
                {
                    PaymentId = p.PaymentId,
                    PaymentDate = p.PaymentDate,
                    Amount = p.Amount,
                    Currency = p.Currency,
                    PaymentMethod = p.PaymentMethod,
                    TransactionStatus = p.TransactionStatus,
                    TransactionId = p.TransactionId,
                    IsRefunded = p.IsRefunded,
                    CreatedAt = p.CreatedAt
                })
                .ToList()
        };
    }

    public async Task<AdminSubscriptionDetailDto?> UpdateSubscriptionAsync(int subscriptionId, AdminUpdateSubscriptionDto dto)
    {
        var subscription = await _dbContext.Subscriptions.FindAsync(subscriptionId);
        if (subscription == null)
            return null;

        if (!string.IsNullOrWhiteSpace(dto.Status))
            subscription.Status = dto.Status;

        if (dto.EndDate.HasValue)
            subscription.EndDate = dto.EndDate.Value;

        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("Subscription {SubscriptionId} updated by admin", subscriptionId);

        return await GetSubscriptionByIdAsync(subscriptionId);
    }
}

