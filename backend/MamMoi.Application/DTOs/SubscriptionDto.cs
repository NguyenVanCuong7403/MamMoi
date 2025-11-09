using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs
{
    public class SubscriptionDto
    {
        public int SubscriptionId { get; set; }
        public int UserId { get; set; }
        public string PlanName { get; set; }
        public string? PlanType { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public string Status { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
    }

    public class SubscriptionCreateUpdateDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(100)]
        public string PlanName { get; set; }

        [Required]
        public DateOnly StartDate { get; set; }

        public DateOnly? EndDate { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } // "Active", "Pending", "Cancelled"

        [Required]
        [Range(0, 99999999.99)]
        public decimal Price { get; set; }
    }
}
