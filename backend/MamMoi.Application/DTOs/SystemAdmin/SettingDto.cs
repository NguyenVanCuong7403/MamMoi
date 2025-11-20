using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs.SystemAdmin
{
    public class SystemSettingDto
    {
        public int SettingID { get; set; }
        public string SettingKey { get; set; } = string.Empty;
        public string? SettingValue { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
        public bool IsPublic { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string UpdatedByUserEmail { get; set; } = string.Empty;
    }


    public class UpdateSettingDto
    {
        [Required]
        public string SettingValue { get; set; } = string.Empty;
    }
}
