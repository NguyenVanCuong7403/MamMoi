using MamMoi.Application.DTOs.SupportRequest;
using MamMoi.Application.Interfaces;
using MamMoi.Application.Interfaces.Admin;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MamMoi.Infrastructure.Services.SupportRequests;

/// <summary>
/// Admin Support Request Service
/// </summary>
public class AdminSupportRequestService : IAdminSupportRequestService
{
    private readonly MamMoiDbContext _dbContext;
    private readonly ILogger<AdminSupportRequestService> _logger;
    private readonly INotificationService _notificationService;

    public AdminSupportRequestService(
        MamMoiDbContext dbContext,
        ILogger<AdminSupportRequestService> logger,
        INotificationService notificationService)
    {
        _dbContext = dbContext;
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task<(List<SupportRequestListItemDto> requests, int totalCount)> GetAllRequestsAsync(
        int page = 1,
        int pageSize = 20,
        string? status = null,
        string? priority = null,
        string? category = null,
        int? userId = null,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        var query = _dbContext.SupportRequests
            .Include(sr => sr.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(sr => sr.Status == status);

        if (!string.IsNullOrWhiteSpace(priority))
            query = query.Where(sr => sr.Priority == priority);

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(sr => sr.Category == category);

        if (userId.HasValue)
            query = query.Where(sr => sr.UserId == userId.Value);

        if (startDate.HasValue)
            query = query.Where(sr => sr.RequestDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(sr => sr.RequestDate <= endDate.Value);

        var totalCount = await query.CountAsync();

        var requests = await query
            .OrderByDescending(sr => sr.RequestDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(sr => new SupportRequestListItemDto
            {
                RequestId = sr.RequestId,
                UserId = sr.UserId,
                UserFullName = sr.User.FullName,
                UserEmail = sr.User.Email,
                Subject = sr.Subject,
                Description = sr.Description,
                Category = sr.Category,
                Priority = sr.Priority,
                Status = sr.Status,
                RequestDate = sr.RequestDate,
                ResolvedAt = sr.ResolvedAt,
                TicketNumber = sr.TicketNumber,
                ResponseCount = sr.ResponseCount,
                SatisfactionRating = sr.SatisfactionRating,
                AttachmentUrls = sr.AttachmentUrls
            })
            .ToListAsync();

        return (requests, totalCount);
    }

    public async Task<SupportRequestDto?> GetRequestByIdAsync(int requestId)
    {
        var request = await _dbContext.SupportRequests
            .Include(sr => sr.User)
            .Include(sr => sr.Tree)
            .FirstOrDefaultAsync(sr => sr.RequestId == requestId);

        if (request == null)
            return null;

        return new SupportRequestDto
        {
            RequestId = request.RequestId,
            UserId = request.UserId,
            UserFullName = request.User.FullName,
            UserEmail = request.User.Email,
            TreeId = request.TreeId,
            TreeName = request.Tree != null ? request.Tree.TreeName : null,
            RequestDate = request.RequestDate,
            Subject = request.Subject,
            Description = request.Description,
            Category = request.Category,
            Priority = request.Priority,
            Status = request.Status,
            Resolution = request.Resolution,
            ResolvedAt = request.ResolvedAt,
            ClosedAt = request.ClosedAt,
            SatisfactionRating = request.SatisfactionRating,
            Feedback = request.Feedback,
            FeedbackDate = request.FeedbackDate,
            AttachmentUrls = request.AttachmentUrls,
            ResponseCount = request.ResponseCount,
            TicketNumber = request.TicketNumber
        };
    }

    public async Task<SupportRequestDto?> UpdateRequestAsync(int requestId, UpdateSupportRequestDto dto)
    {
        var request = await _dbContext.SupportRequests.FindAsync(requestId);
        if (request == null)
            return null;

        // Store old status to detect changes
        var oldStatus = request.Status;

        if (!string.IsNullOrWhiteSpace(dto.Status))
        {
            request.Status = dto.Status;

            if (dto.Status == "Resolved" && request.ResolvedAt == null)
                request.ResolvedAt = DateTime.UtcNow;

            if (dto.Status == "Closed" && request.ClosedAt == null)
                request.ClosedAt = DateTime.UtcNow;
        }

        if (dto.Resolution != null)
            request.Resolution = dto.Resolution.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Category))
            request.Category = dto.Category.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Priority))
            request.Priority = dto.Priority;

        request.ResponseCount++;

        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("Support request {RequestId} updated by admin", requestId);

        // Notify user based on status change
        try
        {
            // If status changed to Resolved
            if (!string.IsNullOrWhiteSpace(dto.Status) && dto.Status == "Resolved" && oldStatus != "Resolved")
            {
                await _notificationService.NotifyUserOnSupportRequestResolvedAsync(
                    requestId,
                    request.UserId,
                    dto.Resolution);
            }
            // If status changed to Closed
            else if (!string.IsNullOrWhiteSpace(dto.Status) && dto.Status == "Closed" && oldStatus != "Closed")
            {
                await _notificationService.NotifyUserOnSupportRequestClosedAsync(
                    requestId,
                    request.UserId,
                    dto.Resolution);
            }
            // If admin just responded with resolution (status didn't change but resolution was added)
            else if (!string.IsNullOrWhiteSpace(dto.Resolution) && string.IsNullOrWhiteSpace(dto.Status))
            {
                await _notificationService.NotifyUserOnSupportRequestResponseAsync(
                    requestId,
                    request.UserId,
                    dto.Resolution);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to user for support request {RequestId}", requestId);
            // Don't throw - notification failure shouldn't break request update
        }

        return await GetRequestByIdAsync(requestId);
    }

    public async Task<SupportRequestStatisticsDto> GetStatisticsAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _dbContext.SupportRequests.AsQueryable();

        if (startDate.HasValue)
            query = query.Where(sr => sr.RequestDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(sr => sr.RequestDate <= endDate.Value);

        var allRequests = await query.ToListAsync();

        var resolvedRequests = allRequests.Where(sr => sr.ResolvedAt.HasValue).ToList();
        var resolutionTimes = resolvedRequests
            .Where(sr => sr.ResolvedAt.HasValue)
            .Select(sr => (sr.ResolvedAt!.Value - sr.RequestDate).TotalHours)
            .ToList();

        var ratings = allRequests
            .Where(sr => sr.SatisfactionRating.HasValue)
            .Select(sr => sr.SatisfactionRating!.Value)
            .ToList();

        var statistics = new SupportRequestStatisticsDto
        {
            TotalRequests = allRequests.Count,
            OpenRequests = allRequests.Count(sr => sr.Status == "Open"),
            InProgressRequests = allRequests.Count(sr => sr.Status == "InProgress"),
            ResolvedRequests = allRequests.Count(sr => sr.Status == "Resolved"),
            ClosedRequests = allRequests.Count(sr => sr.Status == "Closed"),
            UrgentRequests = allRequests.Count(sr => sr.Priority == "Urgent"),
            AverageResolutionTimeHours = resolutionTimes.Any() ? resolutionTimes.Average() : 0,
            AverageSatisfactionRating = ratings.Any() ? ratings.Average() : 0
        };

        // Requests by category
        statistics.RequestsByCategory = allRequests
            .Where(sr => !string.IsNullOrEmpty(sr.Category))
            .GroupBy(sr => sr.Category!)
            .ToDictionary(g => g.Key, g => g.Count());

        // Requests by priority
        statistics.RequestsByPriority = allRequests
            .GroupBy(sr => sr.Priority)
            .ToDictionary(g => g.Key, g => g.Count());

        return statistics;
    }
}

