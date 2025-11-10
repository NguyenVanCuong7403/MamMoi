using MamMoi.Application.DTOs.BusinessAdminDto;
using MamMoi.Application.DTOs.SystemAdminDto;
using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MamMoi.Api.Controllers
{
    [ApiController]
    [Route("api/customers")]
    [Authorize(Roles = "Business Admin")]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomersController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        /// <summary>
        /// Get all customers (Users who have paid) (Business Admin)
        /// </summary>
        /// <param name="searchName">Optional: Search by full name</param>
        /// <param name="email">Optional: Search by email</param>
        /// <param name="isActive">Optional: Filter by status (true/false)</param>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<UserDto>), 200)]
        public async Task<IActionResult> GetAllCustomers(
            [FromQuery] string? searchName,
            [FromQuery] string? email,
            [FromQuery] bool? isActive)
        {
            var customers = await _customerService.GetCustomersAsync(searchName, email, isActive);
            return Ok(customers);
        }

        /// <param name="id">The UserId of the customer</param>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(CustomerDetailDto), 200)]
        [ProducesResponseType(404)] // Báo 404 nếu không tìm thấy
        public async Task<IActionResult> GetCustomerDetails(int id)
        {
            var customerDetail = await _customerService.GetCustomerDetailsAsync(id);

            if (customerDetail == null)
            {
                // Trả về 404 nếu Service không tìm thấy (hoặc không phải customer)
                return NotFound(new { Message = "Customer not found." });
            }

            return Ok(customerDetail); // Trả về 200 OK + DTO chi tiết
        }

        [HttpGet("{id}/activity-logs")]
        [ProducesResponseType(typeof(IEnumerable<ActivityLogDto>), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetCustomerActivityLogs(int id)
        {

            var logs = await _customerService.GetCustomerActivityLogsAsync(id);

            if (logs == null)
            {
                return NotFound(new { Message = "Customer not found." });
            }

            return Ok(logs); 
        }
    }
}