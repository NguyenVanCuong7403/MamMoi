using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs.BusinessAdmin
{
    public class CustomerDetailDto
    {
        // 1. Thông tin cá nhân (Từ Users)
        public int UserId { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? ProfileImageUrl { get; set; }
        public bool IsActive { get; set; }
        public string RoleName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }

        // 2. Lịch sử Thanh toán (Từ Payments)
        public List<PaymentHistoryDto> Payments { get; set; } = new List<PaymentHistoryDto>();

        // 3. Lịch sử Gói cước (Từ Subscriptions)
        public List<SubscriptionHistoryDto> Subscriptions { get; set; } = new List<SubscriptionHistoryDto>();

        // === Nested Classes ===

        /// <summary>
        /// DTO "con" cho Lịch sử Thanh toán
        /// </summary>
        public class PaymentHistoryDto
        {
            public int PaymentID { get; set; }
            public DateTime PaymentDate { get; set; }
            public decimal Amount { get; set; }
            public string? PaymentMethod { get; set; }
            public string? TransactionStatus { get; set; }
            public string? TransactionID { get; set; }
        }

        /// <summary>
        /// DTO "con" cho Lịch sử Gói cước
        /// </summary>
        public class SubscriptionHistoryDto
        {
            public int SubscriptionID { get; set; }
            public string? PlanName { get; set; }
            public string? Status { get; set; }
            public DateOnly StartDate { get; set; }
            public DateOnly? EndDate { get; set; }
            public decimal Price { get; set; }
        }
    }
}
