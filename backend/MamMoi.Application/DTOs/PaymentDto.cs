namespace MamMoi.Application.DTOs;

/// <summary>
/// DTO for payment history item
/// </summary>
public class PaymentHistoryDto
{
    /// <summary>Payment ID</summary>
    public int PaymentId { get; set; }

    /// <summary>User ID who made the payment</summary>
    public int UserId { get; set; }

    /// <summary>Subscription ID associated with payment</summary>
    public int SubscriptionId { get; set; }

    /// <summary>Subscription plan name (Starter, Pro, Farmer, etc.)</summary>
    public string? SubscriptionPlanName { get; set; }

    /// <summary>Subscription status (Active, Expired, Cancelled, etc.)</summary>
    public string? SubscriptionStatus { get; set; }

    /// <summary>Payment date and time</summary>
    public DateTime PaymentDate { get; set; }

    /// <summary>Payment amount</summary>
    public decimal Amount { get; set; }

    /// <summary>Currency (USD, VND, etc.)</summary>
    public string Currency { get; set; } = string.Empty;

    /// <summary>Payment method (Credit Card, Debit Card, Bank Transfer, etc.)</summary>
    public string? PaymentMethod { get; set; }

    /// <summary>Payment provider (Stripe, PayPal, etc.)</summary>
    public string? PaymentProvider { get; set; }

    /// <summary>Transaction status (Completed, Pending, Failed, etc.)</summary>
    public string? TransactionStatus { get; set; }

    /// <summary>Transaction ID from payment system</summary>
    public string? TransactionId { get; set; }

    /// <summary>Invoice number for accounting</summary>
    public string? InvoiceNumber { get; set; }

    /// <summary>Invoice URL for download</summary>
    public string? InvoiceUrl { get; set; }

    /// <summary>Receipt URL for download</summary>
    public string? ReceiptUrl { get; set; }

    /// <summary>Whether payment has been refunded</summary>
    public bool IsRefunded { get; set; }

    /// <summary>Refund amount (if refunded)</summary>
    public decimal? RefundAmount { get; set; }

    /// <summary>Refund date (if refunded)</summary>
    public DateTime? RefundDate { get; set; }

    /// <summary>Reason for refund (if refunded)</summary>
    public string? RefundReason { get; set; }

    /// <summary>Payment description</summary>
    public string? Description { get; set; }
}

/// <summary>
/// DTO for payment summary (minimal info)
/// </summary>
public class PaymentSummaryDto
{
    /// <summary>Payment ID</summary>
    public int PaymentId { get; set; }

    /// <summary>Payment date</summary>
    public DateTime PaymentDate { get; set; }

    /// <summary>Amount paid</summary>
    public decimal Amount { get; set; }

    /// <summary>Currency</summary>
    public string Currency { get; set; } = string.Empty;

    /// <summary>Transaction status</summary>
    public string? TransactionStatus { get; set; }

    /// <summary>Payment method</summary>
    public string? PaymentMethod { get; set; }

    /// <summary>Is refunded</summary>
    public bool IsRefunded { get; set; }
}

/// <summary>
/// DTO for payment statistics
/// </summary>
public class PaymentStatisticsDto
{
    /// <summary>Total payments count</summary>
    public int TotalPayments { get; set; }

    /// <summary>Total amount paid</summary>
    public decimal TotalAmount { get; set; }

    /// <summary>Successful payments count</summary>
    public int SuccessfulPayments { get; set; }

    /// <summary>Failed payments count</summary>
    public int FailedPayments { get; set; }

    /// <summary>Refunded payments count</summary>
    public int RefundedPayments { get; set; }

    /// <summary>Total refunded amount</summary>
    public decimal TotalRefundedAmount { get; set; }

    /// <summary>Average payment amount</summary>
    public decimal AveragePaymentAmount { get; set; }

    /// <summary>Last payment date</summary>
    public DateTime? LastPaymentDate { get; set; }
}

/// <summary>
/// DTO for paged payment history response
/// </summary>
public class PaymentHistoryPagedDto
{
    /// <summary>List of payments</summary>
    public List<PaymentHistoryDto> Payments { get; set; } = new();

    /// <summary>Total number of payments</summary>
    public int Total { get; set; }

    /// <summary>Current page number</summary>
    public int Page { get; set; }

    /// <summary>Page size</summary>
    public int PageSize { get; set; }

    /// <summary>Total pages</summary>
    public int TotalPages => (Total + PageSize - 1) / PageSize;
}

#region PayOS Integration DTOs

/// <summary>
/// Request DTO for creating a PayOS checkout session
/// </summary>
public class CreateCheckoutRequestDto
{
    /// <summary>Subscription plan ID to purchase</summary>
    public int PlanId { get; set; }

    /// <summary>Return URL after successful payment</summary>
    public string? ReturnUrl { get; set; }

    /// <summary>Cancel URL if user cancels payment</summary>
    public string? CancelUrl { get; set; }

    public int? SubscriptionMonth { get; set; }
}

/// <summary>
/// Response DTO for PayOS checkout session
/// </summary>
public class CheckoutResponseDto
{
    /// <summary>Whether the checkout was created successfully</summary>
    public bool Success { get; set; }

    /// <summary>Error message if failed</summary>
    public string? Message { get; set; }

    /// <summary>Order code for tracking</summary>
    public string? OrderCode { get; set; }

    /// <summary>Transaction ID from PayOS</summary>
    public string? TransactionId { get; set; }

    /// <summary>QR code data URL (for QR payment)</summary>
    public string? QrCodeUrl { get; set; }

    /// <summary>Checkout URL (for redirect payment)</summary>
    public string? CheckoutUrl { get; set; }

    /// <summary>Payment expiration time in seconds</summary>
    public int ExpirationSeconds { get; set; } = 900; // 15 minutes default

    /// <summary>Bank information for transfer</summary>
    public BankInfoDto? BankInfo { get; set; }

    /// <summary>Order information</summary>
    public OrderInfoDto? OrderInfo { get; set; }
}

/// <summary>
/// Bank information for payment transfer
/// </summary>
public class BankInfoDto
{
    /// <summary>Bank name (e.g., VCB, TCB, MB)</summary>
    public string BankName { get; set; } = string.Empty;

    /// <summary>Bank account number</summary>
    public string AccountNumber { get; set; } = string.Empty;

    /// <summary>Account holder name</summary>
    public string AccountHolder { get; set; } = string.Empty;

    /// <summary>Amount to transfer</summary>
    public decimal Amount { get; set; }

    /// <summary>Transfer note/description</summary>
    public string TransferNote { get; set; } = string.Empty;
}

/// <summary>
/// Order information for checkout
/// </summary>
public class OrderInfoDto
{
    /// <summary>Order code</summary>
    public string OrderCode { get; set; } = string.Empty;

    /// <summary>Payer name</summary>
    public string PayerName { get; set; } = string.Empty;

    /// <summary>Payer email</summary>
    public string PayerEmail { get; set; } = string.Empty;

    /// <summary>Plan name</summary>
    public string PlanName { get; set; } = string.Empty;

    /// <summary>Plan description</summary>
    public string PlanDescription { get; set; } = string.Empty;

    /// <summary>Subscription period (e.g., "1 tháng")</summary>
    public string Period { get; set; } = string.Empty;

    /// <summary>Subtotal amount</summary>
    public decimal Subtotal { get; set; }

    /// <summary>VAT/Fee amount</summary>
    public decimal Fee { get; set; }

    /// <summary>Total amount</summary>
    public decimal Total { get; set; }
}

/// <summary>
/// Request DTO for checking payment status
/// </summary>
public class CheckPaymentStatusRequestDto
{
    /// <summary>Order code to check</summary>
    public string OrderCode { get; set; } = string.Empty;
}

/// <summary>
/// Response DTO for payment status check
/// </summary>
public class PaymentStatusResponseDto
{
    /// <summary>Whether the request was successful</summary>
    public bool Success { get; set; }

    /// <summary>Payment status (Pending, Completed, Failed, Cancelled)</summary>
    public string Status { get; set; } = "Pending";

    /// <summary>Transaction ID if completed</summary>
    public string? TransactionId { get; set; }

    /// <summary>Payment amount</summary>
    public decimal Amount { get; set; }

    /// <summary>Payment date if completed</summary>
    public DateTime? PaymentDate { get; set; }

    /// <summary>Additional message</summary>
    public string? Message { get; set; }
}

/// <summary>
/// PayOS webhook payload
/// </summary>
public class PayOSWebhookDto
{
    /// <summary>Order code</summary>
    public string OrderCode { get; set; } = string.Empty;

    /// <summary>Amount paid</summary>
    public decimal Amount { get; set; }

    /// <summary>Payment status</summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>Transaction ID</summary>
    public string? TransactionId { get; set; }

    /// <summary>Payment time</summary>
    public DateTime? PaymentTime { get; set; }

    /// <summary>Signature for verification</summary>
    public string? Signature { get; set; }
}

#endregion
