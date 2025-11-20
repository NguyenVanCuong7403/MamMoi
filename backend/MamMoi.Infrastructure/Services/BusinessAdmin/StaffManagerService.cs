
using MamMoi.Application.DTOs.BusinessAdmin;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.Services.BusinessAdmin
{
    public class StaffService : IStaffService
    {
        private readonly MamMoiDbContext _context;

        public StaffService(MamMoiDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<StaffDto>> GetAllStaffAsync()
        {

            var staffListRaw = await _context.Users
                .AsNoTracking()
                .Where(u => u.RoleId == 3)
                .ToListAsync();

            return staffListRaw.Select(u => MapToDto(u));

        }

        public async Task<StaffDto?> GetStaffByIdAsync(int staffId)
        {
            var staff = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == staffId && u.RoleId == 3);

            return staff == null ? null : MapToDto(staff);
        }

        public async Task<IEnumerable<StaffPerformanceDto>> GetStaffPerformanceMetricsAsync()
        {
            var staffList = await _context.Users
                .Where(u => u.RoleId == 3)
                .AsNoTracking()
                .ToListAsync();

            var staffIds = staffList.Select(s => s.UserId).ToList();
            if (!staffIds.Any())
                return new List<StaffPerformanceDto>();

            // KPI 1: Assignments (GardenMembers)
            var kpi1_Assignments = await _context.GardenMembers
                .Where(m => staffIds.Contains(m.UserId))
                .GroupBy(m => m.UserId)
                .Select(g => new { UserId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(k => k.UserId, v => v.Count);

            // KPI 2: Tasks Completed (CareSchedules)
            var kpi2_Tasks = await _context.CareSchedules
                .Where(cs => cs.CompletedByUserId != null && staffIds.Contains(cs.CompletedByUserId.Value))
                .GroupBy(cs => cs.CompletedByUserId.Value)
                .Select(g => new { UserId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(k => k.UserId, v => v.Count);

            // KPI 3: Activity Logs (30 Ngày)
            var thirtyDaysAgo = DateTime.Now.AddDays(-30);
            var kpi3_Logs = await _context.ActivityLogs
                .Where(al => staffIds.Contains(al.UserId) && al.CreatedAt >= thirtyDaysAgo)
                .GroupBy(al => al.UserId)
                .Select(g => new { UserId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(k => k.UserId, v => v.Count);

            var results = new List<StaffPerformanceDto>();
            foreach (var staff in staffList)
            {
                results.Add(new StaffPerformanceDto
                {
                    UserId = staff.UserId,
                    FullName = staff.FullName,
                    Email = staff.Email,
                    Phone = staff.Phone,
                    IsActive = staff.IsActive,
                    CreatedAt = staff.CreatedAt,
                    ProfileImageUrl = staff.ProfileImageUrl,
                    ExperienceLevel = staff.ExperienceLevel,

                    TotalGardensAssigned = kpi1_Assignments.GetValueOrDefault(staff.UserId, 0),
                    TotalTasksCompleted = kpi2_Tasks.GetValueOrDefault(staff.UserId, 0),
                    ActivityCountLast30Days = kpi3_Logs.GetValueOrDefault(staff.UserId, 0)
                });
            }

            return results;
        }
        private StaffDto MapToDto(User user)
        {
            return new StaffDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                ProfileImageUrl = user.ProfileImageUrl,
                ExperienceLevel = user.ExperienceLevel
            };
        }
    }
}
