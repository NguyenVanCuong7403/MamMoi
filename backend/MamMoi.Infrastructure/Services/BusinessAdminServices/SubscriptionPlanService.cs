using MamMoi.Application.DTOs.BusinessAdminDto;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models; // Cần 'SubscriptionPlan' và 'DbContext'
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.Services.BusinessAdminServices
{
    public class SubscriptionPlanService : ISubscriptionPlanService
    {
        private readonly CapstoneDbContext _context;

        public SubscriptionPlanService(CapstoneDbContext context)
        {
            _context = context;
        }
        public async Task<SubscriptionPlanDto> CreatePlanAsync(SubscriptionPlanCreateUpdateDto dto)
        {
            var plan = new SubscriptionPlan
            {
                PlanName = dto.PlanName,
                PlanType = dto.PlanType,
                Price = dto.Price,
                Currency = dto.Currency,
                Description = dto.Description,
                Features = dto.Features,
                IsActive = dto.IsActive
            };

            _context.SubscriptionPlans.Add(plan);
            await _context.SaveChangesAsync();

            return MapToDto(plan); // Trả về DTO "Output"
        }

        public async Task<SubscriptionPlanDto?> GetPlanByIdAsync(int planId)
        {
            var plan = await _context.SubscriptionPlans
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PlanId == planId);

            return plan == null ? null : MapToDto(plan);
        }

        public async Task<bool> UpdatePlanAsync(int planId, SubscriptionPlanCreateUpdateDto dto)
        {
            var plan = await _context.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.PlanId == planId);

            if (plan == null) return false;

            plan.PlanName = dto.PlanName;
            plan.PlanType = dto.PlanType;
            plan.Price = dto.Price;
            plan.Currency = dto.Currency;
            plan.Description = dto.Description;
            plan.Features = dto.Features;
            plan.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return true;
        }

        private SubscriptionPlanDto MapToDto(SubscriptionPlan plan)
        {
            return new SubscriptionPlanDto
            {
                PlanId = plan.PlanId,
                PlanName = plan.PlanName,
                PlanType = plan.PlanType,
                Price = plan.Price,
                Currency = plan.Currency,
                Description = plan.Description,
                Features = plan.Features,
                IsActive = plan.IsActive
            };
        }
    }
}