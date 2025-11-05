using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace MamMoi.Infrastructure.Repositories
{
    public class SystemSettingRepository : ISystemSettingRepository
    {
        private readonly CapstoneDbContext _context;

        public SystemSettingRepository(CapstoneDbContext context)
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