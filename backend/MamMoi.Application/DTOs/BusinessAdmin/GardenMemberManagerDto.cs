using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs.BusinessAdmin
{
    public class GardenMemberDto
    {
        public int MemberId { get; set; }
        public int GardenId { get; set; }

        public int UserId { get; set; }
        public string UserFullName { get; set; }
        public string UserEmail { get; set; }
        public int RoleId { get; set; }
        public string RoleName { get; set; }
        public DateTime JoinedAt { get; set; }
    }

    public class GardenMemberAddDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int RoleId { get; set; }
    }
}
