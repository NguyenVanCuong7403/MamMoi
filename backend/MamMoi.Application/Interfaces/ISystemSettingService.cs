using MamMoi.Application.DTOs.SystemAdmin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface ISystemSettingService
    {
        Task<IEnumerable<SystemSettingDto>> GetAllSettingsAsync();

        Task<SystemSettingDto?> UpdateSettingAsync(string key, UpdateSettingDto dto, int adminUserId);
    }
}
