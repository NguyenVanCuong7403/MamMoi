using Microsoft.AspNetCore.Mvc;
using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;

namespace MamMoi.Api.Controllers;

/// <summary>
/// Controller for handling payment-related operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(IPaymentService paymentService, ILogger<PaymentsController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    /// <summary>
    /// Get payment history for the current user with pagination
    /// </summary>
    /// <param name="page">Page number (1-based, default 1)</param>
    /// <param name="pageSize">Number of records per page (default 10, max 100)</param>
    /// <returns>Paged payment history</returns>
    /// <response code="200">Payment history retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    [HttpGet("history")]
    public async Task<ActionResult<PaymentHistoryPagedDto>> GetPaymentHistory(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            // Get userId from claims or session
            var userIdStr = User.FindFirst("sub")?.Value ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized("User ID not found in token");

            // Validate pagination
            if (page < 1)
                return BadRequest("Page must be greater than 0");
            if (pageSize < 1 || pageSize > 100)
                return BadRequest("Page size must be between 1 and 100");

            var result = await _paymentService.GetPaymentHistoryAsync(userId, page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payment history");
            return StatusCode(500, new { message = "Error retrieving payment history", error = ex.Message });
        }
    }

    /// <summary>
    /// Get all payment history for the current user
    /// </summary>
    /// <returns>List of all payments</returns>
    /// <response code="200">All payments retrieved successfully</response>
    [HttpGet("history/all")]
    public async Task<ActionResult<List<PaymentHistoryDto>>> GetAllPaymentHistory()
    {
        try
        {
            var userIdStr = User.FindFirst("sub")?.Value ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized("User ID not found in token");

            var result = await _paymentService.GetAllPaymentHistoryAsync(userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all payment history");
            return StatusCode(500, new { message = "Error retrieving payment history", error = ex.Message });
        }
    }

    /// <summary>
    /// Get specific payment details
    /// </summary>
    /// <param name="paymentId">Payment ID</param>
    /// <returns>Payment details</returns>
    /// <response code="200">Payment found and returned</response>
    /// <response code="404">Payment not found or unauthorized</response>
    [HttpGet("{paymentId}")]
    public async Task<ActionResult<PaymentHistoryDto>> GetPaymentDetail([FromRoute] int paymentId)
    {
        try
        {
            var userIdStr = User.FindFirst("sub")?.Value ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized("User ID not found in token");

            if (paymentId <= 0)
                return BadRequest("Invalid payment ID");

            var result = await _paymentService.GetPaymentDetailAsync(paymentId, userId);

            if (result == null)
                return NotFound(new { message = "Payment not found or access denied" });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payment detail");
            return StatusCode(500, new { message = "Error retrieving payment detail", error = ex.Message });
        }
    }

    /// <summary>
    /// Get filtered payment history
    /// </summary>
    /// <param name="status">Transaction status filter (Completed, Failed, Pending, etc.)</param>
    /// <param name="startDate">Start date filter (yyyy-MM-dd)</param>
    /// <param name="endDate">End date filter (yyyy-MM-dd)</param>
    /// <param name="page">Page number (default 1)</param>
    /// <param name="pageSize">Page size (default 10)</param>
    /// <returns>Filtered payment history</returns>
    /// <response code="200">Filtered payments retrieved successfully</response>
    [HttpGet("filtered")]
    public async Task<ActionResult<PaymentHistoryPagedDto>> GetFilteredPaymentHistory(
        [FromQuery] string? status = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var userIdStr = User.FindFirst("sub")?.Value ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized("User ID not found in token");

            // Validate pagination
            if (page < 1 || pageSize < 1 || pageSize > 100)
                return BadRequest("Invalid pagination parameters");

            var result = await _paymentService.GetPaymentHistoryFilteredAsync(
                userId, status, startDate, endDate, page, pageSize);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving filtered payment history");
            return StatusCode(500, new { message = "Error retrieving payment history", error = ex.Message });
        }
    }

    /// <summary>
    /// Get payment statistics for the current user
    /// </summary>
    /// <returns>Payment statistics</returns>
    /// <response code="200">Statistics retrieved successfully</response>
    [HttpGet("statistics")]
    public async Task<ActionResult<PaymentStatisticsDto>> GetPaymentStatistics()
    {
        try
        {
            var userIdStr = User.FindFirst("sub")?.Value ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized("User ID not found in token");

            var result = await _paymentService.GetPaymentStatisticsAsync(userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payment statistics");
            return StatusCode(500, new { message = "Error retrieving statistics", error = ex.Message });
        }
    }

    /// <summary>
    /// Get recent payments summary
    /// </summary>
    /// <param name="limit">Number of recent payments to retrieve (default 5, max 20)</param>
    /// <returns>List of recent payments</returns>
    /// <response code="200">Recent payments retrieved successfully</response>
    [HttpGet("recent")]
    public async Task<ActionResult<List<PaymentSummaryDto>>> GetRecentPayments([FromQuery] int limit = 5)
    {
        try
        {
            var userIdStr = User.FindFirst("sub")?.Value ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized("User ID not found in token");

            // Validate limit
            if (limit < 1 || limit > 20)
                limit = 5;

            var result = await _paymentService.GetRecentPaymentsAsync(userId, limit);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recent payments");
            return StatusCode(500, new { message = "Error retrieving recent payments", error = ex.Message });
        }
    }

    /// <summary>
    /// Check if user has completed payments
    /// </summary>
    /// <returns>Boolean indicating if user has completed payments</returns>
    /// <response code="200">Check completed successfully</response>
    [HttpGet("has-completed")]
    public async Task<ActionResult<object>> HasCompletedPayments()
    {
        try
        {
            var userIdStr = User.FindFirst("sub")?.Value ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized("User ID not found in token");

            var result = await _paymentService.HasCompletedPaymentsAsync(userId);
            return Ok(new { hasCompletedPayments = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking completed payments");
            return StatusCode(500, new { message = "Error checking payments", error = ex.Message });
        }
    }

    /// <summary>
    /// Get total amount paid by user
    /// </summary>
    /// <returns>Total amount paid</returns>
    /// <response code="200">Total amount retrieved successfully</response>
    [HttpGet("total-amount")]
    public async Task<ActionResult<object>> GetTotalAmountPaid()
    {
        try
        {
            var userIdStr = User.FindFirst("sub")?.Value ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized("User ID not found in token");

            var result = await _paymentService.GetTotalAmountPaidAsync(userId);
            return Ok(new { totalAmountPaid = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving total amount paid");
            return StatusCode(500, new { message = "Error retrieving total amount", error = ex.Message });
        }
    }

    #region PayOS Checkout Endpoints

    /// <summary>
    /// Create a checkout session for subscription payment
    /// </summary>
    /// <param name="request">Checkout request with plan ID</param>
    /// <returns>Checkout response with QR code and bank info</returns>
    /// <response code="200">Checkout session created successfully</response>
    /// <response code="400">Invalid request</response>
    [HttpPost("checkout")]
    public async Task<ActionResult<CheckoutResponseDto>> CreateCheckout([FromBody] CreateCheckoutRequestDto request)
    {
        try
        {
            var userIdStr = User.FindFirst("sub")?.Value ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized("User ID not found in token");

            if (request.PlanId <= 0)
                return BadRequest(new { message = "Invalid plan ID" });

            var result = await _paymentService.CreateCheckoutAsync(userId, request);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating checkout session");
            return StatusCode(500, new { message = "Error creating checkout session", error = ex.Message });
        }
    }

    /// <summary>
    /// Check payment status by order code
    /// </summary>
    /// <param name="orderCode">Order code to check</param>
    /// <returns>Payment status</returns>
    /// <response code="200">Status retrieved successfully</response>
    [HttpGet("status/{orderCode}")]
    public async Task<ActionResult<PaymentStatusResponseDto>> CheckPaymentStatus([FromRoute] string orderCode)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(orderCode))
                return BadRequest(new { message = "Order code is required" });

            var result = await _paymentService.CheckPaymentStatusAsync(orderCode);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking payment status");
            return StatusCode(500, new { message = "Error checking payment status", error = ex.Message });
        }
    }

    /// <summary>
    /// PayOS webhook callback endpoint
    /// </summary>
    /// <param name="webhook">Webhook payload from PayOS</param>
    /// <returns>Success status</returns>
    [HttpPost("webhook")]
    public async Task<ActionResult> HandleWebhook([FromBody] PayOSWebhookDto webhook)
    {
        try
        {
            _logger.LogInformation("Received PayOS webhook: {OrderCode}", webhook.OrderCode);

            var result = await _paymentService.HandleWebhookAsync(webhook);

            if (!result)
                return BadRequest(new { message = "Failed to process webhook" });

            return Ok(new { message = "Webhook processed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook");
            return StatusCode(500, new { message = "Error processing webhook" });
        }
    }

    /// <summary>
    /// Cancel a pending payment
    /// </summary>
    /// <param name="orderCode">Order code to cancel</param>
    /// <returns>Success status</returns>
    [HttpPost("cancel/{orderCode}")]
    public async Task<ActionResult> CancelPayment([FromRoute] string orderCode)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(orderCode))
                return BadRequest(new { message = "Order code is required" });

            var result = await _paymentService.CancelPaymentAsync(orderCode);

            if (!result)
                return BadRequest(new { message = "Failed to cancel payment or payment not found" });

            return Ok(new { message = "Payment cancelled successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling payment");
            return StatusCode(500, new { message = "Error cancelling payment" });
        }
    }

    /// <summary>
    /// Simulate payment completion (for demo/testing)
    /// </summary>
    /// <param name="orderCode">Order code to complete</param>
    /// <returns>Success status</returns>
    [HttpPost("demo-complete/{orderCode}")]
    public async Task<ActionResult> DemoCompletePayment([FromRoute] string orderCode)
    {
        try
        {
            // Simulate webhook for demo purposes
            var webhook = new PayOSWebhookDto
            {
                OrderCode = orderCode,
                Status = "PAID",
                PaymentTime = DateTime.UtcNow,
                TransactionId = $"DEMO-{Guid.NewGuid().ToString()[..8].ToUpper()}"
            };

            var result = await _paymentService.HandleWebhookAsync(webhook);

            if (!result)
                return BadRequest(new { message = "Failed to complete payment" });

            return Ok(new { message = "Payment completed successfully (demo)" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing demo payment");
            return StatusCode(500, new { message = "Error completing payment" });
        }
    }

    #endregion
}
