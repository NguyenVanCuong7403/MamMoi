using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using MamMoi.Application.DTOs.BusinessAdmin;

namespace MamMoi.Infrastructure.Services.SystemAdmin
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly MamMoiDbContext _context;

        public SubscriptionService(MamMoiDbContext context)
        {
            _context = context;
        }

        public async Task<SubscriptionDto> CreateSubscriptionAsync(SubscriptionCreateUpdateDto dto)
        {
            var subscription = new Subscription
            {
                UserId = dto.UserId,
                PlanId = dto.PlanId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = dto.Status

            };

            _context.Subscriptions.Add(subscription);
            await _context.SaveChangesAsync();
            var newSub = await _context.Subscriptions
                .Include(s => s.Plan)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.SubscriptionId == subscription.SubscriptionId);

            return MapToDto(newSub!);
        }

        // READ (R)
        public async Task<SubscriptionDto?> GetSubscriptionByIdAsync(int subscriptionId)
        {
            var subscription = await _context.Subscriptions
                .Include(s => s.Plan)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.SubscriptionId == subscriptionId);

            return subscription == null ? null : MapToDto(subscription);
        }


        public async Task<bool> UpdateSubscriptionAsync(int subscriptionId, SubscriptionCreateUpdateDto dto)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.SubscriptionId == subscriptionId);

            if (subscription == null) return false;


            subscription.UserId = dto.UserId;
            subscription.PlanId = dto.PlanId;
            subscription.StartDate = dto.StartDate;
            subscription.EndDate = dto.EndDate;
            subscription.Status = dto.Status;


            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteSubscriptionAsync(int subscriptionId)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.SubscriptionId == subscriptionId);

            if (subscription == null) return false;

            subscription.Status = "Cancelled";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SubscriptionDto?> ChangeSubscriptionPlanAsync(
            int oldSubscriptionId,
            int newPlanId)
        {
            var today = DateOnly.FromDateTime(DateTime.Now);

            // BƯỚC 1: Lấy Gói Cũ và Gói Mới
            var oldSubscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.SubscriptionId == oldSubscriptionId);

            var newPlan = await _context.SubscriptionPlans
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PlanId == newPlanId);

            // BƯỚC 2: "Clear" (Validate)
            // (Nếu Gói Cũ không tồn tại, HOẶC Gói Mới không tồn tại,
            //  HOẶC Gói Cũ không "Active" -> "Toang" (Fail))
            if (oldSubscription == null || newPlan == null || oldSubscription.Status != "Active")
            {
                return null; // Báo lỗi cho Controller
            }

            // BƯỚC 3: Hủy (Cancel) Gói Cũ
            oldSubscription.Status = "Cancelled"; // (Hoặc "Upgraded" tùy logic)
            oldSubscription.EndDate = today; // "Clear" (Hết hạn hôm nay)

            // BƯỚC 4: Tính EndDate (Ngày hết hạn) cho Gói Mới
            DateOnly? newEndDate = null;
            if (string.Equals(newPlan.PlanType, "annual", StringComparison.OrdinalIgnoreCase))
            {
                newEndDate = today.AddYears(1).AddDays(-1); // "Clear" (1 năm sau)
            }
            if (string.Equals(newPlan.PlanType, "monthly", StringComparison.OrdinalIgnoreCase))
            {
                newEndDate = today.AddMonths(1).AddDays(-1); // "Clear" (1 tháng sau)
            }

            // BƯỚC 5: Tạo (Create) Gói Mới
            var newSubscription = new Subscription
            {
                UserId = oldSubscription.UserId, // (Lấy UserId từ Gói Cũ)
                PlanId = newPlanId,
                StartDate = today,
                EndDate = newEndDate, // (Đã tính ở Bước 4)
                Status = "Active"
            };

            _context.Subscriptions.Add(newSubscription);

            // BƯỚC 6: "Clear" (Save)
            await _context.SaveChangesAsync();

            // BƯỚC 7: Trả về Gói Mới (DTO)
            // (Tái sử dụng (reuse) hàm GetById (đã có Include Plan) cho "clear")
            return await GetSubscriptionByIdAsync(newSubscription.SubscriptionId);
        }

        private SubscriptionDto MapToDto(Subscription s)
        {
            return new SubscriptionDto
            {
                SubscriptionId = s.SubscriptionId,
                UserId = s.UserId,
                Status = s.Status,
                StartDate = s.StartDate,
                EndDate = s.EndDate,

                PlanId = s.PlanId ?? 0,
                PlanName = s.Plan?.PlanName ?? "N/A",
                PlanType = s.Plan?.PlanType,
                Price = s.Plan?.Price ?? 0,
                Currency = s.Plan?.Currency ?? "N/A"
            };
        }
    }
}