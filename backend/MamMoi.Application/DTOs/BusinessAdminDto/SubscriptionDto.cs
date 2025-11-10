using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs.BusinessAdminDto
{
    public class SubscriptionDto
    {
        public int SubscriptionId { get; set; }
        public int UserId { get; set; }
        public string Status { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }

        public int PlanId { get; set; }
        public string? PlanName { get; set; }
        public string? PlanType { get; set; }
        public decimal Price { get; set; }
        public string? Currency { get; set; }
    }

    public class SubscriptionCreateUpdateDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int PlanId { get; set; }

        [Required]
        public DateOnly StartDate { get; set; }

        public DateOnly? EndDate { get; set; }

        [Required]
        [StringLength(50)]
        public string? Status { get; set; } // "Active", "Pending", "Cancelled"

    }
    public class SubscriptionChangePlanDto
    {
        [Required]
        public int NewPlanId { get; set; }
    }
}
