using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs.BusinessAdmin
{
    public class SupportTicketDto
    {
        public int RequestId { get; set; }
        public DateTime RequestDate { get; set; }
        public string Subject { get; set; }
        public string? Description { get; set; }
        public string? Category { get; set; }
        public string Priority { get; set; }
        public string Status { get; set; }
        public string? Resolution { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public DateTime? ClosedAt { get; set; }

        public int UserId { get; set; }
        public string UserFullName { get; set; }
        public string UserEmail { get; set; }
    }

    public class SupportTicketQueryParameters
    {
        public string? Status { get; set; }
        public string? UserSearchTerm { get; set; }

    }

    public class SupportTicketUpdateDto
    {
        [Required]
        [StringLength(50)]
        public string Status { get; set; }

        [Required]
        [MinLength(10)]
        public string Resolution { get; set; }
    }
}
