using MamMoi.Application.DTOs.SystemAdmin;
using MamMoi.Application.Interfaces;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using System.Linq;

namespace MamMoi.Infrastructure.Services.SystemAdmin
{
    public class SystemSettingService : ISystemSettingService
    {
        private readonly ISystemSettingRepository _settingRepository;

        public SystemSettingService(ISystemSettingRepository settingRepository)
        {
            _settingRepository = settingRepository;
        }

        public async Task<IEnumerable<SystemSettingDto>> GetAllSettingsAsync()
        {
            var settings = await _settingRepository.GetAllSettingsAsync();
            return settings.Select(s => MapToDto((SystemSetting)s));
        }

        public async Task<SystemSettingDto?> UpdateSettingAsync(string key, UpdateSettingDto dto, int adminUserId)
        {
            var setting = (SystemSetting?)await _settingRepository.GetSettingByKeyAsync(key);

            // 1. Kiểm tra setting có tồn tại không
            if (setting == null)
            {
                return null; // Không tìm thấy
            }

            // 2. Cập nhật giá trị
            setting.SettingValue = dto.SettingValue;
            setting.UpdatedAt = DateTime.UtcNow;
            setting.UserId = adminUserId; // Ghi log admin đã sửa

            // 3. Lưu
            await _settingRepository.UpdateSettingAsync(setting);

            // 4. Map và trả về (setting đã Include User)
            return MapToDto(setting);
        }

        // Helper Map
        private SystemSettingDto MapToDto(SystemSetting setting)
        {
            return new SystemSettingDto
            {
                SettingID = setting.SettingId,
                SettingKey = setting.SettingKey,
                SettingValue = setting.SettingValue,
                Category = setting.Category,
                Description = setting.Description,
                IsPublic = setting.IsPublic,
                UpdatedAt = setting.UpdatedAt,
                // Lấy email (đã Include), nếu User=null thì báo lỗi
                UpdatedByUserEmail = setting.User?.Email ?? "N/A (User ID: " + setting.UserId + ")"
            };
        }
    }
}