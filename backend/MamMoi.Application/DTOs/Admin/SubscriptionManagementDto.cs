namespace MamMoi.Application.DTOs.Admin;

/// <summary>
/// DTO for listing subscriptions in admin panel
/// </summary>
public class AdminSubscriptionListDto
{
    public int SubscriptionId { get; set; }
    public int UserId { get; set; }
    public string UserFullName { get; set; } = null!;
    public string UserEmail { get; set; } = null!;
    public string PlanName { get; set; } = null!;
    public string? PlanType { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string Status { get; set; } = null!;
    public decimal Price { get; set; }
    public string Currency { get; set; } = null!;
    public DateTime? LastPaymentDate { get; set; }
    public int PaymentCount { get; set; }
    public decimal TotalPaid { get; set; }
}

/// <summary>
/// DTO for subscription details in admin panel
/// </summary>
public class AdminSubscriptionDetailDto
{
    public int SubscriptionId { get; set; }
    public int UserId { get; set; }
    public string UserFullName { get; set; } = null!;
    public string UserEmail { get; set; } = null!;
    public string? UserPhone { get; set; }
    public string PlanName { get; set; } = null!;
    public string? PlanType { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string Status { get; set; } = null!;
    public decimal Price { get; set; }
    public string Currency { get; set; } = null!;
    public List<SubscriptionPaymentDto> Payments { get; set; } = new();
}

/// <summary>
/// DTO for payment in subscription details
/// </summary>
public class SubscriptionPaymentDto
{
    public int PaymentId { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = null!;
    public string? PaymentMethod { get; set; }
    public string? TransactionStatus { get; set; }
    public string? TransactionId { get; set; }
    public bool IsRefunded { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for updating subscription status (admin only)
/// </summary>
public class AdminUpdateSubscriptionDto
{
    public string? Status { get; set; }
    public DateOnly? EndDate { get; set; }
}

