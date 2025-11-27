using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace MamMoi.Infrastructure.Services.Payment;

/// <summary>
/// Service for handling payment operations with PayOS integration
/// </summary>
public class PaymentService : IPaymentService
{
    private readonly MamMoiDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PaymentService> _logger;
    private readonly HttpClient _httpClient;

    // PayOS configuration
    private readonly string _payosClientId;
    private readonly string _payosApiKey;
    private readonly string _payosChecksumKey;
    private readonly string _payosBaseUrl;

    public PaymentService(
        MamMoiDbContext context, 
        IConfiguration configuration,
        ILogger<PaymentService> logger,
        IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient("PayOS");

        // Load PayOS configuration
        _payosClientId = _configuration["PayOS:ClientId"] ?? "";
        _payosApiKey = _configuration["PayOS:ApiKey"] ?? "";
        _payosChecksumKey = _configuration["PayOS:ChecksumKey"] ?? "";
        _payosBaseUrl = _configuration["PayOS:BaseUrl"] ?? "https://api-merchant.payos.vn";
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
            .Include(p => p.Subscription)
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
            .Include(p => p.Subscription)
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
            .Include(p => p.Subscription)
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
            .Include(p => p.Subscription)
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
            SubscriptionPlanName = payment.Subscription?.PlanName,
            SubscriptionStatus = payment.Subscription?.Status,
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

    #region PayOS Integration

    /// <summary>
    /// Create a PayOS checkout session for subscription payment
    /// </summary>
    public async Task<CheckoutResponseDto> CreateCheckoutAsync(int userId, CreateCheckoutRequestDto request)
    {
        try
        {
            // Get user info
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return new CheckoutResponseDto { Success = false, Message = "User not found" };
            }

            // Get subscription plan
            var plan = await _context.SubscriptionPlans.FindAsync(request.PlanId);
            if (plan == null || !plan.IsActive)
            {
                return new CheckoutResponseDto { Success = false, Message = "Subscription plan not found or inactive" };
            }

            // Generate order codes
            var numericOrderCode = GenerateNumericOrderCode();
            var displayOrderCode = GenerateDisplayOrderCode(plan.PlanName, numericOrderCode);
            var transactionId = GenerateTransactionId();

            int totalMonth = (int)((plan.DurationInMonths.HasValue ? plan.DurationInMonths.Value : 0) + (request.SubscriptionMonth != null ? request.SubscriptionMonth : 0));

            // Calculate amounts (PayOS requires integer amount in VND)
            var subtotal = plan.Price;
            var fee = 0m; // VAT/fee if applicable
            var total = subtotal + fee;
            var amountInt = (int)Math.Round(total) * ((totalMonth == 0) ? 1 : ((totalMonth == 12) ? 10 : totalMonth));

            // Create subscription record (pending)
            var subscription = new Subscription
            {
                UserId = userId,
                PlanName = plan.PlanName,
                PlanType = plan.PlanType,
                StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
                EndDate = (totalMonth != 0)
                    ? DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(totalMonth))
                    : null,
                Status = "Pending",
                Price = plan.Price,
                Currency = plan.Currency
            };
            _context.Subscriptions.Add(subscription);
            await _context.SaveChangesAsync();

            // Create payment record (pending)
            var payment = new Models.Payment
            {
                SubscriptionId = subscription.SubscriptionId,
                UserId = userId,
                PaymentDate = DateTime.UtcNow,
                Amount = amountInt,
                Currency = plan.Currency,
                PaymentMethod = "QR (PayOS)",
                PaymentProvider = "PayOS",
                TransactionStatus = "Pending",
                TransactionId = transactionId,
                InvoiceNumber = displayOrderCode,
                ProviderTransactionId = numericOrderCode.ToString(), // Store numeric code for PayOS lookup
                Description = $"Thanh toán gói {plan.PlanName}",
                CreatedAt = DateTime.UtcNow
            };
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Build response defaults
            var period = (totalMonth != 0)
                ? $"{totalMonth} tháng" 
                : "Không giới hạn";

            var returnUrl = request.ReturnUrl ?? _configuration["PayOS:ReturnUrl"] ?? "http://localhost:5174/invoice";
            var cancelUrl = request.CancelUrl ?? _configuration["PayOS:CancelUrl"] ?? "http://localhost:5174/price";

            // Try to create PayOS payment link
            var payosResponse = await CreatePayOSPaymentLinkAsync(
                numericOrderCode,
                amountInt,
                $"Goi {plan.PlanName}",
                user.FullName ?? "Khách hàng",
                user.Email ?? "",
                returnUrl,
                cancelUrl
            );

            // Build response with PayOS data or fallback to demo mode
            // Use PayOS Description if available (matches QR code), otherwise construct fallback
            var transferNote = !string.IsNullOrEmpty(payosResponse?.Description) 
                ? payosResponse.Description 
                : $"{displayOrderCode} {plan.PlanName} {transactionId}";
            
            var bankInfo = new BankInfoDto
            {
                BankName =  _configuration["PayOS:BankName"] ?? "Vietcombank",
                AccountNumber = payosResponse?.AccountNumber ?? _configuration["PayOS:AccountNumber"] ?? "1234567890",
                AccountHolder = payosResponse?.AccountName ?? _configuration["PayOS:AccountHolder"] ?? "CONG TY TNHH MAM MOI",
                Amount = amountInt,
                TransferNote = transferNote
            };

            return new CheckoutResponseDto
            {
                Success = true,
                OrderCode = displayOrderCode,
                TransactionId = transactionId,
                QrCodeUrl = payosResponse?.QrCode ?? $"{displayOrderCode}|{amountInt}|{transactionId}",
                CheckoutUrl = payosResponse?.CheckoutUrl ?? $"{returnUrl}?orderCode={displayOrderCode}",
                ExpirationSeconds = 900, // 15 minutes
                BankInfo = bankInfo,
                OrderInfo = new OrderInfoDto
                {
                    OrderCode = displayOrderCode,
                    PayerName = user.FullName ?? user.Email ?? "Khách hàng",
                    PayerEmail = user.Email ?? "",
                    PlanName = plan.PlanName,
                    PlanDescription = plan.Description ?? $"Gói {plan.PlanName} - Chăm sóc cây ăn quả",
                    Period = period,
                    Subtotal = subtotal,
                    Fee = fee,
                    Total = amountInt
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating checkout session");
            return new CheckoutResponseDto { Success = false, Message = "Error creating checkout session" };
        }
    }

    /// <summary>
    /// Check payment status by order code
    /// </summary>
    public async Task<PaymentStatusResponseDto> CheckPaymentStatusAsync(string orderCode)
    {
        try
        {
            var payment = await _context.Payments
                .Include(p => p.Subscription)
                .FirstOrDefaultAsync(p => p.InvoiceNumber == orderCode);

            if (payment == null)
            {
                return new PaymentStatusResponseDto
                {
                    Success = false,
                    Status = "NotFound",
                    Message = "Payment not found"
                };
            }

            // If payment is still pending, check with PayOS API for real-time status
            if (payment.TransactionStatus == "Pending" && !string.IsNullOrEmpty(payment.ProviderTransactionId))
            {
                if (long.TryParse(payment.ProviderTransactionId, out var numericOrderCode))
                {
                    var payosInfo = await GetPayOSPaymentInfoAsync(numericOrderCode);
                    if (payosInfo != null)
                    {
                        // Update local status based on PayOS response
                        if (payosInfo.Status.ToUpper() == "PAID")
                        {
                            payment.TransactionStatus = "Completed";
                            payment.PaymentDate = DateTime.UtcNow;
                            
                            if (payment.Subscription != null)
                            {
                                payment.Subscription.Status = "Active";
                                payment.Subscription.StartDate = DateOnly.FromDateTime(DateTime.UtcNow);
                            }

                            // Get transaction reference if available
                            if (payosInfo.Transactions?.Any() == true)
                            {
                                var lastTx = payosInfo.Transactions.Last();
                                payment.ProviderTransactionId = lastTx.Reference;
                            }

                            await _context.SaveChangesAsync();
                        }
                        else if (payosInfo.Status.ToUpper() == "CANCELLED" || payosInfo.Status.ToUpper() == "EXPIRED")
                        {
                            payment.TransactionStatus = "Cancelled";
                            if (payment.Subscription != null)
                            {
                                payment.Subscription.Status = "Cancelled";
                            }
                            await _context.SaveChangesAsync();
                        }
                    }
                }
            }

            return new PaymentStatusResponseDto
            {
                Success = true,
                Status = payment.TransactionStatus ?? "Pending",
                TransactionId = payment.TransactionId,
                Amount = payment.Amount,
                PaymentDate = payment.TransactionStatus == "Completed" ? payment.PaymentDate : null,
                Message = payment.TransactionStatus == "Completed" ? "Payment completed" : "Payment pending"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking payment status for order {OrderCode}", orderCode);
            return new PaymentStatusResponseDto
            {
                Success = false,
                Status = "Error",
                Message = "Error checking payment status"
            };
        }
    }

    /// <summary>
    /// Handle PayOS webhook callback
    /// </summary>
    public async Task<bool> HandleWebhookAsync(PayOSWebhookDto webhook)
    {
        try
        {
            _logger.LogInformation("Received PayOS webhook for order {OrderCode}, status: {Status}", 
                webhook.OrderCode, webhook.Status);

            // Verify webhook signature
            if (!VerifyWebhookSignature(webhook))
            {
                _logger.LogWarning("Invalid webhook signature for order {OrderCode}", webhook.OrderCode);
                return false;
            }

            // Try to find payment by display order code first, then by numeric code
            var payment = await _context.Payments
                .Include(p => p.Subscription)
                .FirstOrDefaultAsync(p => p.InvoiceNumber == webhook.OrderCode 
                    || p.ProviderTransactionId == webhook.OrderCode);

            if (payment == null)
            {
                _logger.LogWarning("Payment not found for order {OrderCode}", webhook.OrderCode);
                return false;
            }

            // Update payment status based on PayOS status
            // PayOS statuses: PENDING, PROCESSING, PAID, CANCELLED, EXPIRED
            switch (webhook.Status.ToUpper())
            {
                case "PAID":
                case "COMPLETED":
                    payment.TransactionStatus = "Completed";
                    payment.PaymentDate = webhook.PaymentTime ?? DateTime.UtcNow;
                    if (!string.IsNullOrEmpty(webhook.TransactionId))
                    {
                        payment.ProviderTransactionId = webhook.TransactionId;
                    }

                    // Activate subscription
                    if (payment.Subscription != null)
                    {
                        payment.Subscription.Status = "Active";
                        payment.Subscription.StartDate = DateOnly.FromDateTime(DateTime.UtcNow);
                    }
                    break;

                case "CANCELLED":
                case "EXPIRED":
                    payment.TransactionStatus = "Cancelled";
                    if (payment.Subscription != null)
                    {
                        payment.Subscription.Status = "Cancelled";
                    }
                    break;

                case "PROCESSING":
                case "PENDING":
                    // Keep as pending
                    break;

                default:
                    _logger.LogWarning("Unknown PayOS status: {Status}", webhook.Status);
                    break;
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Payment {OrderCode} updated to status {Status}", 
                webhook.OrderCode, payment.TransactionStatus);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling webhook for order {OrderCode}", webhook.OrderCode);
            return false;
        }
    }

    /// <summary>
    /// Cancel a pending payment
    /// </summary>
    public async Task<bool> CancelPaymentAsync(string orderCode)
    {
        try
        {
            var payment = await _context.Payments
                .Include(p => p.Subscription)
                .FirstOrDefaultAsync(p => p.InvoiceNumber == orderCode && p.TransactionStatus == "Pending");

            if (payment == null)
            {
                return false;
            }

            // Cancel on PayOS if configured
            if (!string.IsNullOrEmpty(payment.ProviderTransactionId) && 
                long.TryParse(payment.ProviderTransactionId, out var numericOrderCode))
            {
                await CancelPayOSPaymentAsync(numericOrderCode, "User cancelled");
            }

            payment.TransactionStatus = "Cancelled";
            if (payment.Subscription != null)
            {
                payment.Subscription.Status = "Cancelled";
            }

            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling payment {OrderCode}", orderCode);
            return false;
        }
    }

    /// <summary>
    /// Generate unique order code (PayOS requires numeric order code)
    /// </summary>
    private static long GenerateNumericOrderCode()
    {
        // PayOS requires orderCode to be a positive integer
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var random = new Random().Next(1000, 9999);
        return (timestamp % 10000000000) * 10000 + random;
    }

    /// <summary>
    /// Generate display order code for UI
    /// </summary>
    private static string GenerateDisplayOrderCode(string planName, long numericCode)
    {
        var prefix = planName?.ToUpper().Replace(" ", "-");
        if (prefix?.Length > 10) prefix = prefix.Substring(0, 10);
        return $"SUB-{prefix}-{numericCode % 100000}";
    }

    /// <summary>
    /// Generate transaction ID
    /// </summary>
    private static string GenerateTransactionId()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return "TX" + new string(Enumerable.Range(0, 6).Select(_ => chars[random.Next(chars.Length)]).ToArray());
    }

    /// <summary>
    /// Create PayOS payment link using PayOS API
    /// </summary>
    private async Task<PayOSPaymentLinkResponse?> CreatePayOSPaymentLinkAsync(
        long orderCode,
        int amount,
        string description,
        string buyerName,
        string buyerEmail,
        string returnUrl,
        string cancelUrl)
    {
        if (string.IsNullOrEmpty(_payosClientId) || _payosClientId == "YOUR_PAYOS_CLIENT_ID")
        {
            _logger.LogWarning("PayOS not configured, using demo mode");
            return null; // Demo mode
        }

        try
        {
            // Build PayOS request payload
            var requestData = new
            {
                orderCode = orderCode,
                amount = amount,
                description = description.Length > 25 ? description.Substring(0, 25) : description, // PayOS limit
                buyerName = buyerName,
                buyerEmail = buyerEmail,
                buyerPhone = "",
                buyerAddress = "",
                items = new[]
                {
                    new
                    {
                        name = description,
                        quantity = 1,
                        price = amount
                    }
                },
                cancelUrl = cancelUrl,
                returnUrl = returnUrl,
                expiredAt = (int)DateTimeOffset.UtcNow.AddMinutes(15).ToUnixTimeSeconds(),
                signature = ""
            };

            // Generate signature
            var signatureData = $"amount={amount}&cancelUrl={cancelUrl}&description={requestData.description}&orderCode={orderCode}&returnUrl={returnUrl}";
            var signature = ComputeHmacSha256(signatureData, _payosChecksumKey);

            var requestWithSignature = new
            {
                orderCode = orderCode,
                amount = amount,
                description = requestData.description,
                buyerName = buyerName,
                buyerEmail = buyerEmail,
                buyerPhone = "",
                buyerAddress = "",
                items = requestData.items,
                cancelUrl = cancelUrl,
                returnUrl = returnUrl,
                expiredAt = requestData.expiredAt,
                signature = signature
            };

            // Call PayOS API
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_payosBaseUrl}/v2/payment-requests");
            request.Headers.Add("x-client-id", _payosClientId);
            request.Headers.Add("x-api-key", _payosApiKey);
            request.Content = new StringContent(
                JsonSerializer.Serialize(requestWithSignature),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("PayOS API Response: {Response}", responseContent);

            if (response.IsSuccessStatusCode)
            {
                var payosResponse = JsonSerializer.Deserialize<PayOSApiResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (payosResponse?.Code == "00" && payosResponse.Data != null)
                {
                    return new PayOSPaymentLinkResponse
                    {
                        CheckoutUrl = payosResponse.Data.CheckoutUrl,
                        QrCode = payosResponse.Data.QrCode,
                        AccountNumber = payosResponse.Data.AccountNumber,
                        AccountName = payosResponse.Data.AccountName,
                        BankName = payosResponse.Data.Bin, // Bank identification number
                        Description = payosResponse.Data.Description ?? ""
                    };
                }
            }

            _logger.LogError("PayOS API error: {Response}", responseContent);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling PayOS API");
            return null;
        }
    }

    /// <summary>
    /// Get payment info from PayOS
    /// </summary>
    private async Task<PayOSPaymentInfo?> GetPayOSPaymentInfoAsync(long orderCode)
    {
        if (string.IsNullOrEmpty(_payosClientId) || _payosClientId == "YOUR_PAYOS_CLIENT_ID")
        {
            return null;
        }

        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_payosBaseUrl}/v2/payment-requests/{orderCode}");
            request.Headers.Add("x-client-id", _payosClientId);
            request.Headers.Add("x-api-key", _payosApiKey);

            var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                var payosResponse = JsonSerializer.Deserialize<PayOSGetPaymentResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (payosResponse?.Code == "00" && payosResponse.Data != null)
                {
                    return payosResponse.Data;
                }
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting PayOS payment info");
            return null;
        }
    }

    /// <summary>
    /// Cancel PayOS payment
    /// </summary>
    private async Task<bool> CancelPayOSPaymentAsync(long orderCode, string? reason = null)
    {
        if (string.IsNullOrEmpty(_payosClientId) || _payosClientId == "YOUR_PAYOS_CLIENT_ID")
        {
            return true; // Demo mode
        }

        try
        {
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_payosBaseUrl}/v2/payment-requests/{orderCode}/cancel");
            request.Headers.Add("x-client-id", _payosClientId);
            request.Headers.Add("x-api-key", _payosApiKey);
            request.Content = new StringContent(
                JsonSerializer.Serialize(new { cancellationReason = reason ?? "User cancelled" }),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling PayOS payment");
            return false;
        }
    }

    /// <summary>
    /// Compute HMAC-SHA256 signature
    /// </summary>
    private static string ComputeHmacSha256(string data, string key)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToHexString(hash).ToLower();
    }

    /// <summary>
    /// Verify webhook signature from PayOS
    /// </summary>
    private bool VerifyWebhookSignature(PayOSWebhookDto webhook)
    {
        if (string.IsNullOrEmpty(_payosChecksumKey) || _payosChecksumKey == "YOUR_PAYOS_CHECKSUM_KEY")
        {
            _logger.LogWarning("PayOS checksum key not configured, skipping signature verification");
            return true; // Skip verification in demo mode
        }

        if (string.IsNullOrEmpty(webhook.Signature))
        {
            _logger.LogWarning("Webhook signature is missing");
            return false;
        }

        try
        {
            // Build signature data according to PayOS documentation
            // Sort parameters alphabetically and concatenate
            var signatureData = $"amount={webhook.Amount}&orderCode={webhook.OrderCode}&status={webhook.Status}";
            
            var expectedSignature = ComputeHmacSha256(signatureData, _payosChecksumKey);
            var isValid = string.Equals(webhook.Signature, expectedSignature, StringComparison.OrdinalIgnoreCase);

            if (!isValid)
            {
                _logger.LogWarning("Webhook signature mismatch. Expected: {Expected}, Received: {Received}", 
                    expectedSignature, webhook.Signature);
            }

            return isValid;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying webhook signature");
            return false;
        }
    }

    #endregion

    #region PayOS Response Models

    private class PayOSApiResponse
    {
        public string Code { get; set; } = "";
        public string Desc { get; set; } = "";
        public PayOSPaymentLinkData? Data { get; set; }
    }

    private class PayOSPaymentLinkData
    {
        public string Bin { get; set; } = "";
        public string AccountNumber { get; set; } = "";
        public string AccountName { get; set; } = "";
        public int Amount { get; set; }
        public string Description { get; set; } = "";
        public long OrderCode { get; set; }
        public string Currency { get; set; } = "";
        public string PaymentLinkId { get; set; } = "";
        public string Status { get; set; } = "";
        public string CheckoutUrl { get; set; } = "";
        public string QrCode { get; set; } = "";
    }

    private class PayOSPaymentLinkResponse
    {
        public string CheckoutUrl { get; set; } = "";
        public string QrCode { get; set; } = "";
        public string AccountNumber { get; set; } = "";
        public string AccountName { get; set; } = "";
        public string BankName { get; set; } = "";
        public string Description { get; set; } = "";
    }

    private class PayOSGetPaymentResponse
    {
        public string Code { get; set; } = "";
        public string Desc { get; set; } = "";
        public PayOSPaymentInfo? Data { get; set; }
    }

    private class PayOSPaymentInfo
    {
        public long OrderCode { get; set; }
        public int Amount { get; set; }
        public int AmountPaid { get; set; }
        public int AmountRemaining { get; set; }
        public string Status { get; set; } = "";
        public string CreatedAt { get; set; } = "";
        public List<PayOSTransaction>? Transactions { get; set; }
    }

    private class PayOSTransaction
    {
        public string Reference { get; set; } = "";
        public int Amount { get; set; }
        public string AccountNumber { get; set; } = "";
        public string Description { get; set; } = "";
        public string TransactionDateTime { get; set; } = "";
    }

    #endregion
}

