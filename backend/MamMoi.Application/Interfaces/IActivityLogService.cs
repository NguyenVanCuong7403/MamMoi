using MamMoi.Application.DTOs;

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