using MamMoi.Application.DTOs.BusinessAdmin;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.Services.BusinessAdmin
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly MamMoiDbContext _context;

        public AnalyticsService(MamMoiDbContext context)
        {
            _context = context;
        }

        public async Task<AnalyticsDashboardDto> GetRevenueAnalyticsAsync()
        {
            var today = DateOnly.FromDateTime(DateTime.Now);
            var startOfThisMonth = new DateOnly(today.Year, today.Month, 1);
            var startOfNextMonth = startOfThisMonth.AddMonths(1);
            var startOf12MonthsAgo = startOfThisMonth.AddYears(-1);

            // Lấy Subscriptions 
            var activeSubs = await _context.Subscriptions
                .Include(s => s.Plan)
                .Where(s => s.Status == "Active")
                .AsNoTracking()
                .ToListAsync();

            var newSubsThisMonth = await _context.Subscriptions
                .Include(s => s.Plan)
                .Where(s => s.StartDate >= startOfThisMonth && s.StartDate < startOfNextMonth)
                .AsNoTracking()
                .ToListAsync();

            var churnedSubsThisMonth = await _context.Subscriptions
                .Include(s => s.Plan)
                .Where(s =>
                    (s.Status == "Cancelled" || s.Status == "Expired") &&
                    s.EndDate.HasValue &&
                    s.EndDate.Value >= startOfThisMonth &&
                    s.EndDate.Value < startOfNextMonth
                )
                .AsNoTracking()
                .ToListAsync();

            //  Tính Chỉ số Hiện tại
            // (Hàm GetNormalizedPrice(s) đã được sửa ở dưới)
            decimal currentMRR = activeSubs.Sum(s => GetNormalizedPrice(s));
            int totalActiveSubs = activeSubs.Count;

            // Tính Tăng trưởng Tháng Này
            decimal newMRR = newSubsThisMonth.Sum(s => GetNormalizedPrice(s));
            int newSubsCount = newSubsThisMonth.Count;

            decimal churnedMRR = churnedSubsThisMonth.Sum(s => GetNormalizedPrice(s));
            int churnedSubsCount = churnedSubsThisMonth.Count;

            decimal netMRRGrowth = newMRR - churnedMRR;

            // Tính Dữ liệu Chart (12 tháng qua)
            // (Query 1 lần "clear", xử lý C#)
            var allSubsIn12Months = await _context.Subscriptions
                .Include(s => s.Plan) // <-- FIX: JOIN sang Plan
                .Where(s =>
                    (s.StartDate >= startOf12MonthsAgo && s.StartDate < startOfNextMonth) || // (New)
                    (s.EndDate.HasValue && s.EndDate.Value >= startOf12MonthsAgo && s.EndDate.Value < startOfNextMonth) // (Churned)
                )
                .AsNoTracking()
                .ToListAsync();

            var chartData = new List<MonthlyMRRMovementDto>();
            for (int i = 0; i < 12; i++)
            {
                var month = startOfThisMonth.AddMonths(-i);
                var monthKey = $"{month.Year}-{month.Month:D2}";

                var newMRRInMonth = allSubsIn12Months
                    .Where(s => s.StartDate.Year == month.Year && s.StartDate.Month == month.Month)
                    .Sum(s => GetNormalizedPrice(s));

                var churnedMRRInMonth = allSubsIn12Months
                    .Where(s => s.EndDate.HasValue && s.EndDate.Value.Year == month.Year && s.EndDate.Value.Month == month.Month)
                    .Sum(s => GetNormalizedPrice(s));

                chartData.Add(new MonthlyMRRMovementDto
                {
                    Month = monthKey,
                    NewMRR = newMRRInMonth,
                    ChurnedMRR = churnedMRRInMonth
                });
            }

            var dashboard = new AnalyticsDashboardDto
            {
                CurrentMRR = currentMRR,
                NetMRRGrowthThisMonth = netMRRGrowth,
                NewMRRThisMonth = newMRR,
                ChurnedMRRThisMonth = churnedMRR,
                TotalActiveSubscriptions = totalActiveSubs,
                NewSubscriptionsThisMonth = newSubsCount,
                CancellationsThisMonth = churnedSubsCount,
                MRRMovementLast12Months = chartData.OrderBy(c => c.Month).ToList()
            };

            return dashboard;
        }
        private decimal GetNormalizedPrice(Subscription s)
        {
            if (s.Plan == null) return 0;

            if (string.Equals(s.Plan.PlanType, "annual", StringComparison.OrdinalIgnoreCase))
            {
                return s.Plan.Price / 12;
            }

            return s.Plan.Price;
        }
    }
}
