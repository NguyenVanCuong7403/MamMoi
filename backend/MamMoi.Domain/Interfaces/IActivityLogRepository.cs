using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Domain.Interfaces
{
    public interface IActivityLogRepository
    {
        Task<IEnumerable<dynamic>> GetLogsAsync(
            int? userId,
            string? activityType,
            DateTime? startDate,
            DateTime? endDate);
    }
}
