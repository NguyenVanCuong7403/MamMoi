using MamMoi.Application.DTOs.SystemAdmin;
using MamMoi.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface ISysAdminUserService
    {
        // Hàm search "bá đạo" cân tất cả
        Task<PagedResult<SysUserDto>> GetUsersAsync(SysUserFilterDto filter);

        Task<SysUserDto?> GetUserByIdAsync(int id);
        Task<SysUserDetailDto?> GetUserDetailAsync(int id);
        Task<SysUserDto> CreateUserAsync(SysUserCreateDto dto);
        Task<bool> UpdateUserAsync(int id, SysUserUpdateDto dto);
        Task<bool> ToggleUserStatusAsync(int id); // Khóa/Mở khóa nhanh
        Task<bool> DeleteUserPermanentAsync(int id); // Cảnh báo: Xóa thật 100%
    }
}
