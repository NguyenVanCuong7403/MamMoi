using MamMoi.Application.DTOs.SystemAdminDto;

namespace MamMoi.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<SystemStatisticsDto> GetSystemStatisticsAsync();
    }
}