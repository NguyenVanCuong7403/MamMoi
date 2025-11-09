using MamMoi.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface ISubscriptionService
    {
        Task<SubscriptionDto?> GetSubscriptionByIdAsync(int subscriptionId);
        Task<SubscriptionDto> CreateSubscriptionAsync(SubscriptionCreateUpdateDto dto);
        Task<bool> UpdateSubscriptionAsync(int subscriptionId, SubscriptionCreateUpdateDto dto);
        Task<bool> DeleteSubscriptionAsync(int subscriptionId);
    }
}
