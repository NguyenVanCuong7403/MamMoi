using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

[Index("UserID", Name = "IX_Payments_UserID")]
public partial class Payments
{
    [Key]
    public int PaymentID { get; set; }

    public int SubscriptionID { get; set; }

    public int UserID { get; set; }

    [Precision(0)]
    public DateTime PaymentDate { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal Amount { get; set; }

    [StringLength(10)]
    public string Currency { get; set; } = null!;

    [StringLength(50)]
    public string? PaymentMethod { get; set; }

    [StringLength(50)]
    public string? PaymentProvider { get; set; }

    [StringLength(50)]
    public string? TransactionStatus { get; set; }

    [StringLength(100)]
    public string? TransactionID { get; set; }

    [StringLength(200)]
    public string? ProviderTransactionID { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(50)]
    public string? InvoiceNumber { get; set; }

    [StringLength(500)]
    public string? InvoiceUrl { get; set; }

    [StringLength(500)]
    public string? ReceiptUrl { get; set; }

    public bool IsRefunded { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal? RefundAmount { get; set; }

    [Precision(0)]
    public DateTime? RefundDate { get; set; }

    [StringLength(500)]
    public string? RefundReason { get; set; }

    [StringLength(50)]
    public string? IPAddress { get; set; }

    [StringLength(500)]
    public string? UserAgent { get; set; }

    public string? PaymentMetadata { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("SubscriptionID")]
    [InverseProperty("Payments")]
    public virtual Subscriptions Subscription { get; set; } = null!;

    [ForeignKey("UserID")]
    [InverseProperty("Payments")]
    public virtual Users User { get; set; } = null!;
}
