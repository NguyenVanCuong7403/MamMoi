namespace MamMoi.Application.DTOs.Admin;

/// <summary>
/// DTO for revenue statistics
/// </summary>
public class RevenueStatisticsDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalRefunded { get; set; }
    public decimal NetRevenue { get; set; }
    public int TotalTransactions { get; set; }
    public int SuccessfulTransactions { get; set; }
    public int RefundedTransactions { get; set; }
    public DateTime? PeriodStart { get; set; }
    public DateTime? PeriodEnd { get; set; }
}

/// <summary>
/// DTO for revenue by period
/// </summary>
public class RevenueByPeriodDto
{
    public string Period { get; set; } = null!; // "2024-01", "2024-Q1", "2024"
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public decimal Revenue { get; set; }
    public decimal Refunded { get; set; }
    public decimal NetRevenue { get; set; }
    public int TransactionCount { get; set; }
}

/// <summary>
/// DTO for revenue by subscription plan
/// </summary>
public class RevenueByPlanDto
{
    public int PlanId { get; set; }
    public string PlanName { get; set; } = null!;
    public decimal TotalRevenue { get; set; }
    public int SubscriptionCount { get; set; }
    public int PaymentCount { get; set; }
    public decimal AverageRevenuePerSubscription { get; set; }
}

/// <summary>
/// DTO for payment list in admin
/// </summary>
public class AdminPaymentListDto
{
    public int PaymentId { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = null!;
    public string UserEmail { get; set; } = null!;
    public int SubscriptionId { get; set; }
    public string PlanName { get; set; } = null!;
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = null!;
    public string? PaymentMethod { get; set; }
    public string? PaymentProvider { get; set; }
    public string? TransactionStatus { get; set; }
    public bool IsRefunded { get; set; }
    public decimal? RefundAmount { get; set; }
    public DateTime? RefundDate { get; set; }
}

/// <summary>
/// DTO for revenue summary
/// </summary>
public class RevenueSummaryDto
{
    public RevenueStatisticsDto Overall { get; set; } = null!;
    public List<RevenueByPeriodDto> ByPeriod { get; set; } = new();
    public List<RevenueByPlanDto> ByPlan { get; set; } = new();
    public List<AdminPaymentListDto> RecentPayments { get; set; } = new();
}

