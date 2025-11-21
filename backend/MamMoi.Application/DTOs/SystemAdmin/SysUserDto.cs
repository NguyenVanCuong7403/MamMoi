using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.SystemAdmin
{
    public class SysUserDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string PreferredLanguage { get; set; }
        public string ExperienceLevel { get; set; }
        public string? ProfileImageUrl { get; set; }
        public int RoleId { get; set; }
        public string RoleName { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class SysUserCreateDto
    {
        [Required(ErrorMessage = "Tên không được để trống")]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        public int RoleId { get; set; }

        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? PreferredLanguage { get; set; } = "vi";
        public string? ExperienceLevel { get; set; }
    }

    public class SysUserDetailDto : SysUserDto
    {
        public int TotalGardens { get; set; }
        public int TotalTrees { get; set; }
        public List<GardenSummaryDto> Gardens { get; set; } = new();
        public string PlanName { get; set; } = "Free"; // Default plan
    }

    public class GardenSummaryDto
    {
        public string GardenId { get; set; }
        public string GardenName { get; set; }
        public int TreeCount { get; set; }
        public string Province { get; set; }
    }

    // 3. DTO CẬP NHẬT (UPDATE)
    public class SysUserUpdateDto
    {
        [Required]
        public string FullName { get; set; }

        [Required]
        public int RoleId { get; set; }

        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? PreferredLanguage { get; set; }
        public string? ExperienceLevel { get; set; }

        public bool IsActive { get; set; }
    }

    // 4. DTO FILTER (Giữ nguyên)
    public class SysUserFilterDto
    {
        public string? SearchTerm { get; set; }
        public int? RoleId { get; set; }
        public bool? IsActive { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
