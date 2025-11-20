using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs.SystemAdmin
{
    public class ActivityLogDto
    {
        public int LogID { get; set; }
        public string UserEmail { get; set; } = string.Empty; // Lấy từ User Join
        public string ActivityType { get; set; } = string.Empty;
        public string? ActivityDescription { get; set; }
        public string? EntityType { get; set; }
        public int? EntityID { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
