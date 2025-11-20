using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs.BusinessAdmin
{
    public class PaymentDto
    {
        public int PaymentId { get; set; }
        public DateTime PaymentDate { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string? TransactionStatus { get; set; } // VD: "Success", "Failed"
        public string? PaymentMethod { get; set; }

        public int UserId { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
    }

    public class PaymentQueryParameters
    {
        public string? UserSearchTerm { get; set; }
        public string? Status { get; set; }
        public DateOnly? DateFrom { get; set; }
        public DateOnly? DateTo { get; set; }
    }
}
