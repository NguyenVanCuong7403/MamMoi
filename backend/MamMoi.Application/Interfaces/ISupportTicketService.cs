using MamMoi.Application.DTOs.BusinessAdminDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface ISupportTicketService
    {
        Task<IEnumerable<SupportTicketDto>> GetTicketsAsync(
            SupportTicketQueryParameters queryParams
        );
        Task<SupportTicketDto?> GetTicketByIdAsync(int ticketId);
        Task<bool> UpdateTicketAsync(int ticketId, SupportTicketUpdateDto dto);
    }
}
