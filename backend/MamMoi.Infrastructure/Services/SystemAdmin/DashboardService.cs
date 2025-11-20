using MamMoi.Application.DTOs.SystemAdmin;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace MamMoi.Infrastructure.Services.SystemAdmin
{
    public class DashboardService : IDashboardService
    {
        private readonly MamMoiDbContext _context;

        public DashboardService(MamMoiDbContext context)
        {
            _context = context;
        }

        public async Task<SystemStatisticsDto> GetSystemStatisticsAsync()
        {

            var totalUsers = await _context.Users.CountAsync();
            var totalFarmers = await _context.Users.CountAsync(u => u.RoleId == 4); // RoleID = 4 (Farmer)
            var totalStaff = await _context.Users.CountAsync(u => u.RoleId == 3); // RoleID = 3 (Staff)

            var totalGardens = await _context.Gardens.CountAsync();
            var totalTrees = await _context.Trees.CountAsync();

            var openRequests = await _context.SupportRequests.CountAsync(s => s.Status == "Open");
            var closedRequests = await _context.SupportRequests.CountAsync(s => s.Status == "Closed");

            // Sum tiền, trừ các khoản đã refund (IsRefunded = true)
            var totalRevenue = await _context.Payments
                .Where(p => p.IsRefunded == false)
                .SumAsync(p => p.Amount); // Kiểu 'decimal'

            // Gán kết quả vào DTO
            var stats = new SystemStatisticsDto
            {
                TotalUsers = totalUsers,
                TotalFarmers = totalFarmers,
                TotalStaff = totalStaff,
                TotalGardens = totalGardens,
                TotalTrees = totalTrees,
                TotalTicketsOpen = openRequests,
                TotalTicketsClosed = closedRequests,
                TotalRevenue = totalRevenue
            };

            return stats;
        }
    }
}