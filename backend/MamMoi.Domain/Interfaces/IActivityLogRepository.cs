using MamMoi.Domain.Entities;

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