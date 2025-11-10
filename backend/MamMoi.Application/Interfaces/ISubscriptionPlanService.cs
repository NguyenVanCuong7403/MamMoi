using MamMoi.Application.DTOs.BusinessAdminDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface ISubscriptionPlanService
    {
        Task<SubscriptionPlanDto?> GetPlanByIdAsync(int planId);
        Task<SubscriptionPlanDto> CreatePlanAsync(SubscriptionPlanCreateUpdateDto dto);
        Task<bool> UpdatePlanAsync(int planId, SubscriptionPlanCreateUpdateDto dto);

    }
}
