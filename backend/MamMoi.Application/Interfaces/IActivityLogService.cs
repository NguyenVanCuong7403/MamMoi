using MamMoi.Application.DTOs.SystemAdmin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface IActivityLogService
    {
        Task<IEnumerable<ActivityLogDto>> GetLogsAsync(
            int? userId,
            string? activityType,
            DateTime? startDate,
            DateTime? endDate);
    }
}
