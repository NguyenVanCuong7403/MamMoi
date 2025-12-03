using System;
using Microsoft.AspNetCore.Mvc;
using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;

namespace MamMoi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Get all users
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var users = await _userService.GetAllAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all users");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Create new user
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _userService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Update user basic info
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _userService.UpdateAsync(id, dto);
            if (result == null)
                return NotFound(new { message = "User not found" });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Delete user
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var result = await _userService.DeleteAsync(id);
            if (!result)
                return NotFound(new { message = "User not found" });

            return Ok(new { message = "User deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    #region User Profile Endpoints

    /// <summary>
    /// View user profile
    /// GET: api/users/profile/{userId}
    /// </summary>
    [HttpGet("profile/{userId}")]
    public async Task<IActionResult> GetProfile(int userId)
    {
        try
        {
            if (userId <= 0)
                return BadRequest(new { message = "Invalid user ID" });

            var profile = await _userService.GetProfileAsync(userId);
            if (profile == null)
                return NotFound(new { message = "User not found" });

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user profile");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Edit user profile with full validation
    /// PUT: api/users/profile/{userId}
    /// </summary>
    [HttpPut("profile/{userId}")]
    public async Task<IActionResult> EditProfile(int userId, [FromBody] EditProfileDto dto)
    {
        try
        {
            if (userId <= 0)
                return BadRequest(new { message = "Invalid user ID" });

            if (dto == null)
                return BadRequest(new { message = "Profile data is required" });

            var profile = await _userService.EditProfileAsync(userId, dto);
            if (profile == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                message = "Profile updated successfully",
                data = profile
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error editing user profile");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Upload or update user avatar
    /// POST: api/users/{userId}/avatar
    /// Accepts: multipart/form-data with image file
    /// Max size: 5MB
    /// Allowed types: image/jpeg, image/png, image/webp
    /// </summary>
    [HttpPost("{userId}/avatar")]
    public async Task<IActionResult> UploadAvatar(int userId, IFormFile file)
    {
        try
        {
            if (userId <= 0)
                return BadRequest(new { message = "Invalid user ID" });

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file provided" });

            // Read file into byte array
            byte[] imageData;
            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                imageData = memoryStream.ToArray();
            }
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var response = await _userService.UploadAvatarAsync(userId, imageData, file.ContentType, baseUrl);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading avatar");
            return StatusCode(500, new { message = "Internal server error", details = ex.Message });
        }
    }

    /// <summary>
    /// Delete user avatar
    /// DELETE: api/users/{userId}/avatar
    /// </summary>
    [HttpDelete("{userId}/avatar")]
    public async Task<IActionResult> DeleteAvatar(int userId)
    {
        try
        {
            if (userId <= 0)
                return BadRequest(new { message = "Invalid user ID" });

            var response = await _userService.DeleteAvatarAsync(userId);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting avatar");
            return StatusCode(500, new { message = "Internal server error", details = ex.Message });
        }
    }

    /// <summary>
    /// Ban user account
    /// POST: api/users/{userId}/ban
    /// Requires: Admin authorization
    /// </summary>
    [HttpPost("{userId}/ban")]
    public async Task<IActionResult> BanAccount(int userId, [FromBody] BanAccountDto dto)
    {
        try
        {
            if (userId <= 0)
                return BadRequest(new { message = "Invalid user ID" });

            if (dto == null)
                return BadRequest(new { message = "Ban data is required" });

            if (string.IsNullOrWhiteSpace(dto.Reason))
                return BadRequest(new { message = "Ban reason is required" });

            var result = await _userService.BanAccountAsync(userId, dto);

            if (!result)
                return BadRequest(new { message = "Failed to ban account" });

            var bannedUntil = dto.DurationDays > 0 ? (DateTime?)DateTime.UtcNow.AddDays((double)dto.DurationDays) : null;

            return Ok(new
            {
                message = "Account banned successfully",
                userId = userId,
                bannedAt = DateTime.UtcNow,
                bannedUntil = bannedUntil
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error banning account");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Unban user account
    /// POST: api/users/{userId}/unban
    /// Requires: Admin authorization
    /// </summary>
    [HttpPost("{userId}/unban")]
    public async Task<IActionResult> UnbanAccount(int userId)
    {
        try
        {
            if (userId <= 0)
                return BadRequest(new { message = "Invalid user ID" });

            var result = await _userService.UnbanAccountAsync(userId);

            if (!result)
                return BadRequest(new { message = "Failed to unban account" });

            return Ok(new
            {
                message = "Account unbanned successfully",
                userId = userId,
                unbannedAt = DateTime.UtcNow
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unbanning account");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get user ban status and information
    /// GET: api/users/{userId}/ban-info
    /// </summary>
    [HttpGet("{userId}/ban-info")]
    public async Task<IActionResult> GetBanInfo(int userId)
    {
        try
        {
            if (userId <= 0)
                return BadRequest(new { message = "Invalid user ID" });

            var banInfo = await _userService.GetBanInfoAsync(userId);

            if (banInfo == null)
                return NotFound(new { message = "User not found" });

            return Ok(banInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ban info");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Check if account is currently banned
    /// GET: api/users/{userId}/is-banned
    /// </summary>
    [HttpGet("{userId}/is-banned")]
    public async Task<IActionResult> IsAccountBanned(int userId)
    {
        try
        {
            if (userId <= 0)
                return BadRequest(new { message = "Invalid user ID" });

            var isBanned = await _userService.IsAccountBannedAsync(userId);

            return Ok(new
            {
                userId = userId,
                isBanned = isBanned
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking ban status");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    #endregion

    #region Profile OTP Endpoints

    /// <summary>
    /// Send OTP for profile update (email/phone change)
    /// POST: api/users/{userId}/profile/otp/send
    /// </summary>
    [HttpPost("{userId}/profile/otp/send")]
    public async Task<IActionResult> SendProfileOtp(int userId, [FromBody] SendProfileOtpRequestDto dto)
    {
        try
        {
            if (userId <= 0)
                return BadRequest(new { success = false, message = "Invalid user ID" });

            if (dto == null)
                return BadRequest(new { success = false, message = "Request data is required" });

            // For testing, return OTP code (remove in production for security)
            var otpCode = await _userService.SendProfileOtpAsync(userId, dto);
            
            return Ok(new
            {
                success = true,
                message = dto.UpdateType == "email" 
                    ? "Đã gửi mã OTP tới email. Vui lòng kiểm tra hộp thư." 
                    : "Đã gửi mã OTP tới số điện thoại. Vui lòng kiểm tra tin nhắn.",
                // Remove this in production for security
                otpCode = otpCode
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending profile OTP for user {UserId}", userId);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Verify OTP for profile update
    /// POST: api/users/profile/otp/verify
    /// </summary>
    [HttpPost("profile/otp/verify")]
    public async Task<IActionResult> VerifyProfileOtp([FromBody] VerifyProfileOtpRequestDto dto)
    {
        try
        {
            if (dto == null)
                return BadRequest(new { success = false, message = "Request data is required" });

            if (dto.UserId <= 0)
                return BadRequest(new { success = false, message = "Invalid user ID" });

            var verified = await _userService.VerifyProfileOtpAsync(dto);
            
            if (!verified)
                return BadRequest(new { success = false, message = "Xác thực OTP thất bại." });

            return Ok(new
            {
                success = true,
                message = dto.UpdateType == "email"
                    ? "Đã xác thực OTP thành công. Email đã được cập nhật."
                    : "Đã xác thực OTP thành công. Số điện thoại đã được cập nhật."
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying profile OTP for user {UserId}", dto?.UserId);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    #endregion
}
