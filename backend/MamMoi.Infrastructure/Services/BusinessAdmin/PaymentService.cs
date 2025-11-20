using MamMoi.Application.DTOs.BusinessAdmin;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.Services.BusinessAdmin
{
    public class PaymentService : IPaymentService
    {
        private readonly MamMoiDbContext _context;

        public PaymentService(MamMoiDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PaymentDto>> GetPaymentHistoryAsync(
            PaymentQueryParameters queryParams)
        {
            var query = _context.Payments.AsQueryable();

            if (!string.IsNullOrWhiteSpace(queryParams.Status))
            {
                query = query.Where(p =>
                    p.TransactionStatus != null &&
                    p.TransactionStatus == queryParams.Status
                );
            }

            if (queryParams.DateFrom.HasValue)
            {
                var startDate = queryParams.DateFrom.Value.ToDateTime(TimeOnly.MinValue);
                query = query.Where(p => p.PaymentDate >= startDate);
            }

            if (queryParams.DateTo.HasValue)
            {
                var endDate = queryParams.DateTo.Value.ToDateTime(TimeOnly.MaxValue);
                query = query.Where(p => p.PaymentDate <= endDate);
            }


            var joinedQuery = query.Join(
                _context.Users,
                payment => payment.UserId,
                user => user.UserId,
                (payment, user) => new { Payment = payment, User = user }
            );

            if (!string.IsNullOrWhiteSpace(queryParams.UserSearchTerm))
            {
                var searchTerm = queryParams.UserSearchTerm.ToLower().Trim();
                joinedQuery = joinedQuery.Where(x =>
                    x.User.FullName.ToLower().Contains(searchTerm) ||
                    x.User.Email.ToLower().Contains(searchTerm)
                );
            }

            var results = await joinedQuery
                .OrderByDescending(x => x.Payment.PaymentDate)
                .AsNoTracking()
                .Select(x => new PaymentDto
                {
                    PaymentId = x.Payment.PaymentId,
                    PaymentDate = x.Payment.PaymentDate,
                    Amount = x.Payment.Amount,
                    Currency = x.Payment.Currency,
                    TransactionStatus = x.Payment.TransactionStatus,
                    PaymentMethod = x.Payment.PaymentMethod,

                    UserId = x.User.UserId,
                    FullName = x.User.FullName,
                    Email = x.User.Email
                })
                .ToListAsync();

            return results;
        }
    }
}