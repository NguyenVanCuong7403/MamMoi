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
    public class ActivityLogRepository : IActivityLogRepository
    {
        private readonly MamMoiDbContext _context;

        public ActivityLogRepository(MamMoiDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<dynamic>> GetLogsAsync(
            int? userId,
            string? activityType,
            DateTime? startDate,
            DateTime? endDate)
        {

            var query = _context.ActivityLogs
                .Include(log => log.User)
                .AsQueryable();

            if (userId.HasValue && userId.Value > 0)
            {
                query = query.Where(log => log.UserId == userId.Value);
            }

            if (!string.IsNullOrWhiteSpace(activityType))
            {
                query = query.Where(log => log.ActivityType == activityType);
            }
            if (startDate.HasValue)
            {
                query = query.Where(log => log.CreatedAt >= startDate.Value);
            }
            if (endDate.HasValue)
            {
                query = query.Where(log => log.CreatedAt <= endDate.Value.AddDays(1));
            }

            var logs = await query
                .OrderByDescending(log => log.CreatedAt)
                .AsNoTracking()
                .ToListAsync();

            return logs.Cast<dynamic>(); // Trả về dynamic
        }
    }
}
