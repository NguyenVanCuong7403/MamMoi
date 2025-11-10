using MamMoi.Application.DTOs.BusinessAdminDto;
using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace MamMoi.Api.Controllers
{
    [ApiController]
    [Route("api/subscriptions")]
    //[Authorize(Roles = "Business Admin")] 
    public class SubscriptionsController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;

        public SubscriptionsController(ISubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        [HttpPost]
        [ProducesResponseType(typeof(SubscriptionDto), 201)] 
        public async Task<IActionResult> CreateSubscription(
            [FromBody] SubscriptionCreateUpdateDto dto)
        {
 
            var newSubscription = await _subscriptionService.CreateSubscriptionAsync(dto);

            return CreatedAtAction(
                nameof(GetSubscriptionById), 
                new { id = newSubscription.SubscriptionId },
                newSubscription
            );
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(SubscriptionDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetSubscriptionById(int id)
        {
            var subscription = await _subscriptionService.GetSubscriptionByIdAsync(id);
            if (subscription == null)
            {
                return NotFound();
            }
            return Ok(subscription);
        }


        [HttpPut("{id}")]
        [ProducesResponseType(204)] 
        [ProducesResponseType(404)] 
        public async Task<IActionResult> UpdateSubscription(
            int id,
            [FromBody] SubscriptionCreateUpdateDto dto)
        {
            var success = await _subscriptionService.UpdateSubscriptionAsync(id, dto);
            if (!success)
            {
                return NotFound();
            }
            return NoContent(); 
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(204)] 
        [ProducesResponseType(404)] 
        public async Task<IActionResult> DeleteSubscription(int id)
        {
            var success = await _subscriptionService.DeleteSubscriptionAsync(id);
            if (!success)
            {
                return NotFound();
            }
            return NoContent(); 
        }

        [HttpPut("{id}/change-plan")]
        [ProducesResponseType(typeof(SubscriptionDto), 200)] // Trả về Gói Mới
        [ProducesResponseType(400)] // Bad Request
        [ProducesResponseType(404)] // Not Found
        public async Task<IActionResult> ChangePlan(
            int id,
            [FromBody] SubscriptionChangePlanDto dto)
        {
            var newSubscription = await _subscriptionService.ChangeSubscriptionPlanAsync(
                id, // oldSubscriptionId
                dto.NewPlanId
            );

            if (newSubscription == null)
            return BadRequest(new
            {
                Message = "Cannot change plan. Old subscription not found, not active, or new plan ID invalid."
            });

            return Ok(newSubscription);
        }
    }
}