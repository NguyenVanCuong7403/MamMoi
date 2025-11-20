using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.Repositories
{
    public class SystemSettingRepository : ISystemSettingRepository
    {
        private readonly MamMoiDbContext _context;

        public SystemSettingRepository(MamMoiDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<dynamic>> GetAllSettingsAsync()
        {

            return await _context.SystemSettings
                .Include(s => s.User)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<dynamic?> GetSettingByKeyAsync(string key)
        {
            return await _context.SystemSettings
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.SettingKey == key);
        }

        public async Task UpdateSettingAsync(dynamic setting)
        {
            _context.SystemSettings.Update((SystemSetting)setting);
            await _context.SaveChangesAsync();
        }
    }
}
