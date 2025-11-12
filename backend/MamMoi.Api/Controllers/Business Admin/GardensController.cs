using MamMoi.Application.DTOs.BusinessAdminDto;
using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MamMoi.Api.Controllers.Business_Admin
{
    [ApiController]
    [Route("api/gardens")] 
    [Authorize(Roles = "Business Admin")] 
    public class GardensController : ControllerBase
    {
        private readonly IGardenService _gardenService;

        public GardensController(IGardenService gardenService)
        {
            _gardenService = gardenService;
        }

        // GET /api/gardens/123/members
        [HttpGet("{gardenId}/members")]
        [ProducesResponseType(typeof(IEnumerable<GardenMemberDto>), 200)]
        public async Task<IActionResult> GetGardenMembers(int gardenId)
        {
            var members = await _gardenService.GetMembersInGardenAsync(gardenId);
            return Ok(members);
        }

        // POST /api/gardens/123/members
        [HttpPost("{gardenId}/members")]
        [ProducesResponseType(typeof(GardenMemberDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> AddGardenMember(
            int gardenId,
            [FromBody] GardenMemberAddDto dto)
        {
            var newMember = await _gardenService.AddMemberToGardenAsync(gardenId, dto);

            if (newMember == null)
            {
                return BadRequest(new { Message = "User is already a member of this garden." });
            }

            return CreatedAtAction(
                nameof(GetGardenMembers), 
                new { gardenId = gardenId },
                newMember
            );
        }
        // DELETE /api/gardens/123/members/567 (567 = UserID của Staff)
        [HttpDelete("{gardenId}/members/{userId}")]
        [ProducesResponseType(204)] // 204 No Content
        [ProducesResponseType(404)]
        public async Task<IActionResult> RemoveGardenMember(int gardenId, int userId)
        {
            var success = await _gardenService.RemoveMemberFromGardenAsync(gardenId, userId);
            if (!success) return NotFound(new { Message = "Member not found in this garden." });
            return NoContent();
        }
    }
}
