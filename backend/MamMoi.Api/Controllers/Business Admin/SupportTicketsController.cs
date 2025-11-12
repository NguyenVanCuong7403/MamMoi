using MamMoi.Application.DTOs.BusinessAdminDto;
using MamMoi.Application.Interfaces; 
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace MamMoi.Api.Controllers.Business_Admin
{
    [ApiController]
    [Route("api/support-tickets")] 
    [Authorize(Roles = "Business Admin")] 
    public class SupportTicketsController : ControllerBase
    {
        private readonly ISupportTicketService _ticketService;

        public SupportTicketsController(ISupportTicketService ticketService)
        {
            _ticketService = ticketService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<SupportTicketDto>), 200)]
        public async Task<IActionResult> GetTickets(
            [FromQuery] SupportTicketQueryParameters queryParams)
        {
            var tickets = await _ticketService.GetTicketsAsync(queryParams);
            return Ok(tickets);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(SupportTicketDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetTicketById(int id)
        {
            var ticket = await _ticketService.GetTicketByIdAsync(id);
            if (ticket == null) return NotFound();
            return Ok(ticket);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(204)] 
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateTicket(
            int id,
            [FromBody] SupportTicketUpdateDto dto)
        {
            var success = await _ticketService.UpdateTicketAsync(id, dto);
            if (!success) return NotFound(new { Message = "Ticket not found." });
            return NoContent();
        }
    }
}
