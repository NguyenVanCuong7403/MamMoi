using MamMoi.Application.DTOs.BusinessAdminDto;
using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MamMoi.Api.Controllers
{
    [ApiController]
    [Route("api/payments")]
    //[Authorize(Roles = "Business Admin")] 
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        /// <summary>
        /// Get all payment history (Business Admin)
        /// </summary>
        /// <param name="queryParams">Filter/Search parameters</param>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<PaymentDto>), 200)]
        public async Task<IActionResult> GetPaymentHistory(
            [FromQuery] PaymentQueryParameters queryParams)
        {
            var payments = await _paymentService.GetPaymentHistoryAsync(queryParams);
            return Ok(payments);
        }
    }
}