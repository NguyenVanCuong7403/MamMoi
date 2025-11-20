using MamMoi.Application.DTOs.BusinessAdmin;
using MamMoi.Application.DTOs;
using MamMoi.Application.DTOs.SystemAdmin;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MamMoi.Application.DTOs.SystemAdmin.MamMoi.Application.DTOs.SystemAdmin;

namespace MamMoi.Infrastructure.Services.BusinessAdmin
{

    public class CustomerService : ICustomerService
    {
        private readonly MamMoiDbContext _context;

        public CustomerService(MamMoiDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SysUserDto>> GetCustomersAsync(
            string? searchName,
            string? email,
            bool? isActive)
        {

            var query = _context.Users
                .Include(u => u.Role)
                .AsQueryable();

            query = query.Where(u => _context.Payments.Any(p => p.UserId == u.UserId));

            if (!string.IsNullOrWhiteSpace(searchName))
            {
                query = query.Where(u => u.FullName.ToLower().Contains(searchName.Trim().ToLower()));
            }
            if (!string.IsNullOrWhiteSpace(email))
            {
                query = query.Where(u => u.Email.ToLower().Contains(email.Trim().ToLower()));
            }
            if (isActive.HasValue)
            {
                query = query.Where(u => u.IsActive == isActive.Value);
            }

            var customers = await query
                .OrderBy(u => u.FullName)
                .AsNoTracking()
                .ToListAsync();

            return customers.Select(user => new SysUserDto
            {
                UserId =  user.UserId,
                Email = user.Email,
                FullName = user.FullName,
                CreatedAt = user.CreatedAt,
                RoleName = user.Role?.RoleName ?? "N/A"
            });
        }

        public async Task<CustomerDetailDto?> GetCustomerDetailsAsync(int userId)
        {

            var user = await _context.Users
                .Include(u => u.Role)
                .AsNoTracking()
                .FirstOrDefaultAsync(u =>
                    u.UserId == userId &&
                    _context.Payments.Any(p => p.UserId == u.UserId)
                );
            if (user == null) return null;

            var payments = await _context.Payments
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.PaymentDate)
                .AsNoTracking()
                .ToListAsync();

            var subscriptions = await _context.Subscriptions
                .Include(s => s.Plan)
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.StartDate)
                .AsNoTracking()
                .ToListAsync();


            var customerDetail = new CustomerDetailDto
            {
                UserId = user.UserId,
                Email = user.Email,
                FullName = user.FullName,
                Phone = user.Phone,
                Address = user.Address,
                ProfileImageUrl = user.ProfileImageUrl,
                IsActive = user.IsActive,
                RoleName = user.Role?.RoleName ?? "N/A",
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,

                Payments = payments.Select(p => new CustomerDetailDto.PaymentHistoryDto
                {
                    PaymentID = p.PaymentId,
                    PaymentDate = p.PaymentDate,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod,
                    TransactionStatus = p.TransactionStatus,
                    TransactionID = p.TransactionId
                }).ToList(),


                Subscriptions = subscriptions.Select(s => new CustomerDetailDto.SubscriptionHistoryDto
                {
                    SubscriptionID = s.SubscriptionId,
                    Status = s.Status,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,

                    PlanName = s.Plan?.PlanName ?? "N/A",
                    Price = s.Plan?.Price ?? 0
                }).ToList()
            };

            return customerDetail;
        }

        public async Task<IEnumerable<ActivityLogDto>?> GetCustomerActivityLogsAsync(int userId)
        {

            var isCustomer = await _context.Users
                .AnyAsync(u => u.UserId == userId &&
                               _context.Payments.Any(p => p.UserId == u.UserId));

            if (!isCustomer)
            {
                return null;
            }

            var logs = await _context.ActivityLogs
                .Where(log => log.UserId == userId)
                .AsNoTracking()
                .OrderByDescending(log => log.CreatedAt)
                .Select(log => new ActivityLogDto
                {
                    LogID = log.LogId,
                    CreatedAt = log.CreatedAt,
                    ActivityType = log.ActivityType,
                    ActivityDescription = log.ActivityDescription,
                    EntityType = log.EntityType,
                    EntityID = log.EntityId,
                })
                .ToListAsync();

            return logs;
        }
    }
}