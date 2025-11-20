using MamMoi.Application.DTOs.BusinessAdmin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface IGardenManagerService
    {
        Task<IEnumerable<GardenMemberDto>> GetMembersInGardenAsync(int gardenId);
        Task<GardenMemberDto?> AddMemberToGardenAsync(int gardenId, GardenMemberAddDto dto);

        // DELETE (BA "xóa" (un-assign) 1 Staff (User) khỏi Vườn (Garden))
        Task<bool> RemoveMemberFromGardenAsync(int gardenId, int userId);
    }
}
