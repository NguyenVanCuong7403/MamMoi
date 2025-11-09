using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq; 

namespace MamMoi.Infrastructure.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly CapstoneDbContext _context;

        public SubscriptionService(CapstoneDbContext context)
        {
            _context = context;
        }

        // CREATE (C)
        public async Task<SubscriptionDto> CreateSubscriptionAsync(SubscriptionCreateUpdateDto dto)
        {

            var subscription = new Subscription
            {
                UserId = dto.UserId,
                PlanName = dto.PlanName,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = dto.Status,
                Price = dto.Price,
                Currency = "VND" 
            };

            _context.Subscriptions.Add(subscription);
            await _context.SaveChangesAsync();

            return MapToDto(subscription);
        }

        public async Task<SubscriptionDto?> GetSubscriptionByIdAsync(int subscriptionId)
        {
            var subscription = await _context.Subscriptions
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.SubscriptionId == subscriptionId);

            if (subscription == null)
            {
                return null;
            }

            return MapToDto(subscription);
        }

        public async Task<bool> UpdateSubscriptionAsync(int subscriptionId, SubscriptionCreateUpdateDto dto)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.SubscriptionId == subscriptionId);

            if (subscription == null)
            {
                return false; 
            }

            subscription.UserId = dto.UserId;
            subscription.PlanName = dto.PlanName;
            subscription.StartDate = dto.StartDate;
            subscription.EndDate = dto.EndDate;
            subscription.Status = dto.Status;
            subscription.Price = dto.Price;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteSubscriptionAsync(int subscriptionId)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.SubscriptionId == subscriptionId);

            if (subscription == null)
            {
                return false; 
            }

            // Soft Delete: Chỉ đổi Status, không xóa data
            subscription.Status = "Cancelled";

            await _context.SaveChangesAsync();
            return true;
        }

        private SubscriptionDto MapToDto(Subscription s)
        {
            return new SubscriptionDto
            {
                SubscriptionId = s.SubscriptionId,
                UserId = s.UserId,
                PlanName = s.PlanName,
                PlanType = s.PlanType,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                Status = s.Status,
                Price = s.Price,
                Currency = s.Currency
            };
        }
    }
}