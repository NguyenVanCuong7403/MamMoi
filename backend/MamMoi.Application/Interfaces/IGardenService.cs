using MamMoi.Application.DTOs.BusinessAdminDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface IGardenService
    {
        // kiểm tra ai trong vườn này?
        Task<IEnumerable<GardenMemberDto>> GetMembersInGardenAsync(int gardenId);
        Task<GardenMemberDto?> AddMemberToGardenAsync(int gardenId, GardenMemberAddDto dto);
        Task<bool> RemoveMemberFromGardenAsync(int gardenId, int userId);
    }
}
