using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs.BusinessAdmin
{
    public class StaffDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string? Phone { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? ExperienceLevel { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

    }

    public class StaffPerformanceDto : StaffDto
    {
        public int TotalGardensAssigned { get; set; }
        public int TotalTasksCompleted { get; set; }
        public int ActivityCountLast30Days { get; set; }
    }
}
