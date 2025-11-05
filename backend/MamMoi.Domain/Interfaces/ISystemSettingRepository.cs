namespace MamMoi.Domain.Interfaces
{
    public interface ISystemSettingRepository
    {
        Task<IEnumerable<dynamic>> GetAllSettingsAsync();

        Task<dynamic?> GetSettingByKeyAsync(string key);

        Task UpdateSettingAsync(dynamic setting);
    }
}