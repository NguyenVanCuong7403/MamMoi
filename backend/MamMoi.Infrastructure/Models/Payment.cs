using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class Payment
{
    public int PaymentId { get; set; }

    public int SubscriptionId { get; set; }

    public int UserId { get; set; }

    public DateTime PaymentDate { get; set; }

    public decimal Amount { get; set; }

    public string Currency { get; set; } = null!;

    public string? PaymentMethod { get; set; }

    public string? PaymentProvider { get; set; }

    public string? TransactionStatus { get; set; }

    public string? TransactionId { get; set; }

    public string? ProviderTransactionId { get; set; }

    public string? Description { get; set; }

    public string? InvoiceNumber { get; set; }

    public string? InvoiceUrl { get; set; }

    public string? ReceiptUrl { get; set; }

    public bool IsRefunded { get; set; }

    public decimal? RefundAmount { get; set; }

    public DateTime? RefundDate { get; set; }

    public string? RefundReason { get; set; }

    public string? Ipaddress { get; set; }

    public string? UserAgent { get; set; }

    public string? PaymentMetadata { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Subscription Subscription { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
