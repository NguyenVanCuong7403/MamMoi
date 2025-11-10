using MamMoi.Application.DTOs.SystemAdminDto;
using MamMoi.Application.Interfaces;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using System.Linq;

namespace MamMoi.Infrastructure.Services.SystemAdminServices
{
    public class ActivityLogService : IActivityLogService
    {
        private readonly IActivityLogRepository _activityLogRepository;

        public ActivityLogService(IActivityLogRepository activityLogRepository)
        {
            _activityLogRepository = activityLogRepository;
        }

        public async Task<IEnumerable<ActivityLogDto>> GetLogsAsync(
            int? userId,
            string? activityType,
            DateTime? startDate,
            DateTime? endDate)
        {
            var logs = await _activityLogRepository.GetLogsAsync(userId, activityType, startDate, endDate);

            return logs.Select(log =>
            {
                var logEntity = (ActivityLog)log;
                return new ActivityLogDto
                {
                    LogID = logEntity.LogId,
                    UserEmail = logEntity.User?.Email ?? "N/A (User ID: " + logEntity.UserId + ")",
                    ActivityType = logEntity.ActivityType,
                    ActivityDescription = logEntity.ActivityDescription,
                    EntityType = logEntity.EntityType,
                    EntityID = logEntity.EntityId,
                    CreatedAt = logEntity.CreatedAt
                };
            });
        }
    }
}