using Microsoft.AspNetCore.Mvc;
using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace MamMoi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserProfileController : ControllerBase
{
    private readonly IUserProfileService _userProfileService;
    private readonly ILogger<UserProfileController> _logger;

    public UserProfileController(IUserProfileService userProfileService, ILogger<UserProfileController> logger)
    {
        _userProfileService = userProfileService;
        _logger = logger;
    }

    /// <summary>
    /// Get user profile by user ID
    /// Display user info
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>User profile information</returns>
    [HttpGet("{userId}")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserProfile(int userId)
    {
        try
        {
            var profile = await _userProfileService.GetUserProfileAsync(userId);

            if (profile == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user profile for user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while retrieving user profile" });
        }
    }

    /// <summary>
    /// Edit user profile with full validation
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="dto">Updated profile data</param>
    /// <returns>Updated user profile</returns>
    [HttpPut("{userId}")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserProfile(int userId, [FromBody] EditUserProfileDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                message = "Validation failed",
                errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
            });
        }

        try
        {
            var updatedProfile = await _userProfileService.UpdateUserProfileAsync(userId, dto);

            if (updatedProfile == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(updatedProfile);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user profile for user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while updating user profile" });
        }
    }

    /// <summary>
    /// Upload profile avatar with image crop and 5MB max size
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="image">The image file (max 5MB)</param>
    /// <param name="cropX">Crop X position (percentage 0-100)</param>
    /// <param name="cropY">Crop Y position (percentage 0-100)</param>
    /// <param name="cropWidth">Crop width (percentage 10-100)</param>
    /// <param name="cropHeight">Crop height (percentage 10-100)</param>
    /// <returns>Upload response with image URL</returns>
    [HttpPost("{userId}/avatar")]
    [ProducesResponseType(typeof(AvatarUploadResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(5 * 1024 * 1024)] // 5MB limit
    public async Task<IActionResult> UploadAvatar(
        int userId,
        [Required] IFormFile image,
        [Range(0, 100)] int cropX = 0,
        [Range(0, 100)] int cropY = 0,
        [Range(10, 100)] int cropWidth = 100,
        [Range(10, 100)] int cropHeight = 100)
    {
        if (image == null)
        {
            return BadRequest(new { message = "Image file is required" });
        }

        try
        {
            var result = await _userProfileService.UploadAvatarAsync(
                userId,
                image,
                cropX,
                cropY,
                cropWidth,
                cropHeight);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading avatar for user {UserId}", userId);
            return StatusCode(500, new
            {
                success = false,
                message = "An error occurred while uploading avatar"
            });
        }
    }

    /// <summary>
    /// Delete user avatar
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>Success response</returns>
    [HttpDelete("{userId}/avatar")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAvatar(int userId)
    {
        try
        {
            var result = await _userProfileService.DeleteAvatarAsync(userId);

            if (!result)
            {
                return NotFound(new { message = "User or avatar not found" });
            }

            return Ok(new { message = "Avatar deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting avatar for user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while deleting avatar" });
        }
    }

    /// <summary>
    /// Get last login timestamp for a user
    /// Lấy thời gian đăng nhập gần nhất từ bảng User (LastLoginAt)
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>Last login timestamp</returns>
    [HttpGet("{userId}/last-login")]
    [ProducesResponseType(typeof(DateTime?), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLastLogin(int userId)
    {
        try
        {
            var lastLoginAt = await _userProfileService.GetLastLoginAsync(userId);

            return Ok(new
            {
                userId = userId,
                lastLoginAt = lastLoginAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting last login for user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while retrieving last login" });
        }
    }
}
