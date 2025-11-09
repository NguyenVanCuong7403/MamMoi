using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

public partial class Subscriptions
{
    [Key]
    public int SubscriptionID { get; set; }

    public int UserID { get; set; }

    [StringLength(100)]
    public string PlanName { get; set; } = null!;

    [StringLength(50)]
    public string? PlanType { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = null!;

    [Column(TypeName = "decimal(10, 2)")]
    public decimal Price { get; set; }

    [StringLength(10)]
    public string Currency { get; set; } = null!;

    [InverseProperty("Subscription")]
    public virtual ICollection<Payments> Payments { get; set; } = new List<Payments>();

    [ForeignKey("UserID")]
    [InverseProperty("Subscriptions")]
    public virtual Users User { get; set; } = null!;
}
