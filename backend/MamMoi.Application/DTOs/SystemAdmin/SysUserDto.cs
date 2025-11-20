using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs.SystemAdmin
{
    using System;
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

        // 5. PAGED RESULT (Giữ nguyên)
        public class PagedResult<T>
        {
            public IEnumerable<T> Items { get; set; }
            public int TotalCount { get; set; }
            public int PageNumber { get; set; }
            public int PageSize { get; set; }
        }
    }
}
