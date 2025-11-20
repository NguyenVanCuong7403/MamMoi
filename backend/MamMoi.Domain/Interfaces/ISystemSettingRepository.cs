using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Domain.Interfaces
{
    public interface ISystemSettingRepository
    {
        Task<IEnumerable<dynamic>> GetAllSettingsAsync();

        Task<dynamic?> GetSettingByKeyAsync(string key);

        Task UpdateSettingAsync(dynamic setting);
    }
}
