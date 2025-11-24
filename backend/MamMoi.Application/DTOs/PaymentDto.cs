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
