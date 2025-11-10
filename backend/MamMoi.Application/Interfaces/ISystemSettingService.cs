using MamMoi.Application.DTOs.SystemAdminDto;

namespace MamMoi.Application.Interfaces
{
    public interface ISystemSettingService
    {
        Task<IEnumerable<SystemSettingDto>> GetAllSettingsAsync();

        Task<SystemSettingDto?> UpdateSettingAsync(string key, UpdateSettingDto dto, int adminUserId);
    }
}