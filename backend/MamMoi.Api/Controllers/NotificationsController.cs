using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MamMoi.Application.DTOs.Notification;
using MamMoi.Application.Interfaces;
using System.Security.Claims;

namespace MamMoi.Api.Controllers;

/// <summary>
/// Notifications Controller - API cho quản lý thông báo
/// </summary>
[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly IImageUploadService _imageUploadService;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(
        INotificationService notificationService,
        IImageUploadService imageUploadService,
        ILogger<NotificationsController> logger)
    {
        _notificationService = notificationService;
        _imageUploadService = imageUploadService;
        _logger = logger;
    }

    /// <summary>
    /// Get user's notifications
    /// GET /api/notifications
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? isRead = null,
        [FromQuery] string? notificationType = null)
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var (notifications, totalCount) = await _notificationService.GetUserNotificationsAsync(
                userId, page, pageSize, isRead, notificationType);

            return Ok(new
            {
                success = true,
                data = notifications,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user notifications");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get notification by ID
    /// GET /api/notifications/{id}
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(NotificationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetNotificationById(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var notification = await _notificationService.GetNotificationByIdAsync(id, userId);

            if (notification == null)
                return NotFound(new { success = false, message = "Notification not found" });

            return Ok(new { success = true, data = notification });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notification: {NotificationId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get unread notification count
    /// GET /api/notifications/unread-count
    /// </summary>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUnreadCount()
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var count = await _notificationService.GetUnreadCountAsync(userId);

            return Ok(new { success = true, data = new { unreadCount = count } });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unread count");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Mark notifications as read
    /// PUT /api/notifications/mark-read
    /// </summary>
    [HttpPut("mark-read")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MarkNotificationsAsRead([FromBody] MarkNotificationReadDto dto)
    {
        try
        {
            if (dto.NotificationIds == null || !dto.NotificationIds.Any())
                return BadRequest(new { success = false, message = "Notification IDs are required" });

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _notificationService.MarkNotificationsAsReadAsync(userId, dto.NotificationIds);

            if (!result)
                return BadRequest(new { success = false, message = "No notifications found to mark as read" });

            return Ok(new { success = true, message = "Notifications marked as read" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notifications as read");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Mark all notifications as read
    /// PUT /api/notifications/mark-all-read
    /// </summary>
    [HttpPut("mark-all-read")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAllNotificationsAsRead()
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _notificationService.MarkAllNotificationsAsReadAsync(userId);

            if (!result)
                return Ok(new { success = true, message = "No unread notifications" });

            return Ok(new { success = true, message = "All notifications marked as read" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking all notifications as read");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Broadcast notification to all users (SystemAdmin only)
    /// POST /api/notifications/broadcast
    /// </summary>
    [HttpPost("broadcast")]
    [Authorize(Roles = "SystemAdmin")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> BroadcastNotification([FromBody] BroadcastNotificationDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            var count = await _notificationService.BroadcastNotificationAsync(dto);

            return Ok(new
            {
                success = true,
                message = $"Notification broadcasted to {count} users",
                data = new { recipientsCount = count }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting notification");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get list of broadcast notifications (SystemAdmin only)
    /// GET /api/notifications/broadcasts
    /// </summary>
    [HttpGet("broadcasts")]
    [Authorize(Roles = "SystemAdmin")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetBroadcastNotifications()
    {
        try
        {
            var broadcasts = await _notificationService.GetBroadcastNotificationsAsync();

            var result = broadcasts.Select(b => new
            {
                groupId = b.GroupId,
                sentAt = b.SentAt,
                recipientCount = b.RecipientCount,
                title = b.Title,
                message = b.Message,
                notificationType = b.NotificationType,
                priority = b.Priority,
                category = b.Category,
                actionUrl = b.ActionUrl,
                actionLabel = b.ActionLabel,
                imageUrl = b.ImageUrl,
                iconName = b.IconName,
                expiresAt = b.ExpiresAt
            }).ToList();

            return Ok(new
            {
                success = true,
                data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting broadcast notifications");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Update broadcast notification by group ID (SystemAdmin only)
    /// PUT /api/notifications/broadcasts/{groupId}
    /// </summary>
    [HttpPut("broadcasts/{groupId}")]
    [Authorize(Roles = "SystemAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBroadcastNotification(string groupId, [FromBody] UpdateBroadcastNotificationDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            var result = await _notificationService.UpdateBroadcastNotificationAsync(groupId, dto);

            if (!result)
                return NotFound(new { success = false, message = "Broadcast notification not found" });

            return Ok(new { success = true, message = "Broadcast notification updated successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating broadcast notification: {GroupId}", groupId);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Delete broadcast notification by group ID (SystemAdmin only)
    /// DELETE /api/notifications/broadcasts/{groupId}
    /// </summary>
    [HttpDelete("broadcasts/{groupId}")]
    [Authorize(Roles = "SystemAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteBroadcastNotification(string groupId)
    {
        try
        {
            var result = await _notificationService.DeleteBroadcastNotificationAsync(groupId);

            if (!result)
                return NotFound(new { success = false, message = "Broadcast notification not found" });

            return Ok(new { success = true, message = "Broadcast notification deleted successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting broadcast notification: {GroupId}", groupId);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get notifications by user ID (Admin only)
    /// GET /api/notifications/user/{userId}
    /// </summary>
    [HttpGet("user/{userId}")]
    [Authorize(Roles = "SystemAdmin,BusinessAdmin")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUserNotificationsByUserId(
        int userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? isRead = null,
        [FromQuery] string? notificationType = null)
    {
        try
        {
            var (notifications, totalCount) = await _notificationService.GetUserNotificationsAsync(
                userId, page, pageSize, isRead, notificationType);

            return Ok(new
            {
                success = true,
                data = notifications,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notifications for user {UserId}", userId);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Upload image for notification (SystemAdmin only)
    /// POST /api/notifications/upload
    /// Accepts multipart/form-data
    /// </summary>
    [HttpPost("upload")]
    [Authorize(Roles = "SystemAdmin")]
    [ApiExplorerSettings(IgnoreApi = true)]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UploadNotificationImage([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new
            {
                success = false,
                message = "No file uploaded."
            });
        }

        try
        {
            // Use ImageUploadService to save with category "notifications"
            var relativePath = await _imageUploadService.UploadImageAsync(
                file.OpenReadStream(),
                file.FileName,
                file.ContentType,
                "notifications"
            );

            // Return the accessible URL
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var fileUrl = $"{baseUrl}{relativePath}";

            return Ok(new
            {
                success = true,
                url = fileUrl
            });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid file uploaded for notification");
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading notification image");
            return StatusCode(500, new
            {
                success = false,
                message = "Error uploading image. Please try again."
            });
        }
    }
}

