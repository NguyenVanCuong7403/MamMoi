using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs.BusinessAdmin
{
    public class SubscriptionPlanDto
    {
        public int PlanId { get; set; }
        public string PlanName { get; set; }
        public string? PlanType { get; set; } // 'Monthly', 'Annual'
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public string? Description { get; set; }
        public string? Features { get; set; }
        public bool IsActive { get; set; }
    }

    public class SubscriptionPlanCreateUpdateDto
    {
        [Required]
        [StringLength(100)]
        public string PlanName { get; set; }

        [StringLength(50)]
        public string? PlanType { get; set; } // 'Monthly', 'Annual'

        [Required]
        [Range(0, 99999999.99)]
        public decimal Price { get; set; }

        [StringLength(10)]
        public string Currency { get; set; } = "VND";

        [StringLength(500)]
        public string? Description { get; set; }

        public string? Features { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
