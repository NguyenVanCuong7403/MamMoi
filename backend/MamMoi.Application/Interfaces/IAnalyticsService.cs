using MamMoi.Application.DTOs.BusinessAdmin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface IAnalyticsService
    {
        Task<AnalyticsDashboardDto> GetRevenueAnalyticsAsync();
    }
}
