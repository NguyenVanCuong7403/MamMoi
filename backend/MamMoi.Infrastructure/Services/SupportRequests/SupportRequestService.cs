using MamMoi.Application.DTOs.SupportRequest;
using MamMoi.Application.Interfaces;
using MamMoi.Application.Interfaces.Auth;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace MamMoi.Infrastructure.Services.SupportRequests;

/// <summary>
/// Support Request Service - User operations
/// </summary>
public class SupportRequestService : ISupportRequestService
{
    private readonly MamMoiDbContext _dbContext;
    private readonly ILogger<SupportRequestService> _logger;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public SupportRequestService(
        MamMoiDbContext dbContext,
        ILogger<SupportRequestService> logger,
        INotificationService notificationService,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _dbContext = dbContext;
        _logger = logger;
        _notificationService = notificationService;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<SupportRequestDto> CreateRequestAsync(int userId, CreateSupportRequestDto dto)
    {
        // Validate user exists
        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
            throw new ArgumentException("User not found", nameof(userId));

        // Validate tree if provided
        if (dto.TreeId.HasValue)
        {
            var tree = await _dbContext.Trees
                .FirstOrDefaultAsync(t => t.TreeId == dto.TreeId.Value && t.UserId == userId);
            if (tree == null)
                throw new ArgumentException("Tree not found or does not belong to user");
        }

        // Generate ticket number
        var ticketNumber = $"SR-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";

        var request = new SupportRequest
        {
            UserId = userId,
            TreeId = dto.TreeId,
            Subject = dto.Subject.Trim(),
            Description = dto.Description?.Trim(),
            Category = dto.Category?.Trim(),
            Priority = dto.Priority ?? "Normal",
            Status = "Open",
            AttachmentUrls = dto.AttachmentUrls,
            RequestDate = DateTime.UtcNow,
            ResponseCount = 0,
            TicketNumber = ticketNumber
        };

        _dbContext.SupportRequests.Add(request);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Support request created: {TicketNumber} by user {UserId}", ticketNumber, userId);

        // Notify admin about new support request
        try
        {
            await _notificationService.NotifyAdminOnSupportRequestAsync(request.RequestId, userId, request.Subject, request.TreeId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to admin for support request {RequestId}", request.RequestId);
            // Don't throw - notification failure shouldn't break request creation
        }

        // Send email to admin
        try
        {
            var enableEmailNotifications = bool.Parse(_configuration["EmailNotifications:EnableSupportRequestNotifications"] ?? "true");
            if (enableEmailNotifications)
            {
                // Fetch active admin users from database
                var adminEmails = await _dbContext.Users
                    .Include(u => u.Role)
                    .Where(u => u.IsActive && 
                                (u.Role.RoleName == "SystemAdmin" || u.Role.RoleName == "BusinessAdmin"))
                    .Select(u => u.Email)
                    .ToListAsync();

                if (!adminEmails.Any())
                {
                    _logger.LogWarning("No active admin users found to send email notification for support request {TicketNumber}", ticketNumber);
                }
                else
                {
                    foreach (var adminEmail in adminEmails)
                    {
                        await _emailService.SendSupportRequestNotificationAsync(
                            adminEmail,
                            ticketNumber,
                            user.FullName ?? user.Email ?? "User",
                            request.Subject,
                            request.Category ?? "General",
                            request.Priority
                        );
                        _logger.LogInformation("✅ Gửi email thành công đến: {AdminEmail} cho support request {TicketNumber}", adminEmail, ticketNumber);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to admin for support request {RequestId}", request.RequestId);
            // Don't throw - email failure shouldn't break request creation
        }

        return await GetRequestByIdAsync(request.RequestId, userId) ??
            throw new InvalidOperationException("Failed to retrieve created request");
    }

    public async Task<(List<SupportRequestListItemDto> requests, int totalCount)> GetUserRequestsAsync(
        int userId, int page = 1, int pageSize = 20, string? status = null)
    {
        var query = _dbContext.SupportRequests
            .Where(sr => sr.UserId == userId)
            .Include(sr => sr.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(sr => sr.Status == status);
        }

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

    public async Task<SupportRequestDto?> GetRequestByIdAsync(int requestId, int userId)
    {
        var request = await _dbContext.SupportRequests
            .Where(sr => sr.RequestId == requestId && sr.UserId == userId)
            .Include(sr => sr.User)
            .Include(sr => sr.Tree)
            .FirstOrDefaultAsync();

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

    public async Task<bool> SubmitFeedbackAsync(int requestId, int userId, SupportRequestFeedbackDto dto)
    {
        var request = await _dbContext.SupportRequests
            .FirstOrDefaultAsync(sr => sr.RequestId == requestId && sr.UserId == userId);

        if (request == null)
            return false;

        if (request.Status != "Resolved" && request.Status != "Closed")
            throw new InvalidOperationException("Feedback can only be submitted for resolved or closed requests");

        request.SatisfactionRating = dto.SatisfactionRating;
        request.Feedback = dto.Feedback?.Trim();
        request.FeedbackDate = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("Feedback submitted for request {RequestId} by user {UserId}", requestId, userId);

        return true;
    }
}

