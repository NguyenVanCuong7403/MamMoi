using MamMoi.Application.DTOs;
using MamMoi.Application.DTOs.BusinessAdminDto;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore; 
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.Services.BusinessAdminServices
{
    public class SupportTicketService : ISupportTicketService
    {
        private readonly CapstoneDbContext _context;

        public SupportTicketService(CapstoneDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SupportTicketDto>> GetTicketsAsync(
            SupportTicketQueryParameters queryParams)
        {
            var query = _context.SupportRequests
                .Include(sr => sr.User) 
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(queryParams.Status))
            {
                query = query.Where(sr => sr.Status == queryParams.Status);
            }

            if (!string.IsNullOrWhiteSpace(queryParams.UserSearchTerm))
            {
                var searchTerm = queryParams.UserSearchTerm.ToLower().Trim();
                query = query.Where(sr =>
                    sr.User != null && 
                    (sr.User.FullName.ToLower().Contains(searchTerm) ||
                     sr.User.Email.ToLower().Contains(searchTerm))
                );
            }
            var tickets = await query
                .OrderByDescending(sr => sr.RequestDate) 
                .ToListAsync(); 
            return tickets.Select(sr => MapToDto(sr));
        }

        public async Task<SupportTicketDto?> GetTicketByIdAsync(int ticketId)
        {
            var ticket = await _context.SupportRequests
                .Include(sr => sr.User) 
                .AsNoTracking()
                .FirstOrDefaultAsync(sr => sr.RequestId == ticketId);

            return ticket == null ? null : MapToDto(ticket);
        }

        public async Task<bool> UpdateTicketAsync(int ticketId, SupportTicketUpdateDto dto)
        {
            var ticket = await _context.SupportRequests
                .FirstOrDefaultAsync(sr => sr.RequestId == ticketId);

            if (ticket == null) return false; 

            ticket.Status = dto.Status;
            ticket.Resolution = dto.Resolution;

            if (dto.Status == "Closed")
            {
                ticket.ClosedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        private SupportTicketDto MapToDto(SupportRequest sr)
        {
            return new SupportTicketDto
            {
                RequestId = sr.RequestId,
                RequestDate = sr.RequestDate,
                Subject = sr.Subject,
                Description = sr.Description,
                Category = sr.Category,
                Priority = sr.Priority,
                Status = sr.Status,
                Resolution = sr.Resolution,
                ResolvedAt = sr.ResolvedAt,
                ClosedAt = sr.ClosedAt,

                UserId = sr.UserId,
                UserFullName = sr.User?.FullName ?? "N/A",
                UserEmail = sr.User?.Email ?? "N/A"
            };
        }
    }
}
