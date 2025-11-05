using MamMoi.Application.DTOs;

namespace MamMoi.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<SystemStatisticsDto> GetSystemStatisticsAsync();
    }
}