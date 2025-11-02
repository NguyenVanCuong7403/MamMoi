using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MamMoi.Application.DTOs.Auth;
using MamMoi.Application.Interfaces.Auth;

namespace MamMoi.Api.Controllers;

/// <summary>
/// Authentication Controller - Xử lý các API về đăng ký, đăng nhập, OTP
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// CHỨC NĂNG 1: Đăng ký tài khoản mới
    /// POST /api/auth/register
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            var response = await _authService.RegisterAsync(request);
            return Ok(new
            {
                success = true,
                data = response
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration");
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi. Vui lòng thử lại sau."
            });
        }
    }

    /// <summary>
    /// CHỨC NĂNG 2: Xác thực OTP
    /// POST /api/auth/verify-otp
    /// </summary>
    [HttpPost("verify-otp")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequestDto request)
    {
        try
        {
            var response = await _authService.VerifyOtpAsync(request);
            return Ok(new
            {
                success = true,
                data = response
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during OTP verification");
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi. Vui lòng thử lại sau."
            });
        }
    }

    /// <summary>
    /// CHỨC NĂNG 3: Gửi lại OTP
    /// POST /api/auth/resend-otp
    /// </summary>
    [HttpPost("resend-otp")]
    [AllowAnonymous]
    public async Task<IActionResult> ResendOtp([FromBody] ResendOtpRequestDto request)
    {
        try
        {
            var response = await _authService.ResendOtpAsync(request);
            return Ok(new
            {
                success = true,
                data = response
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during OTP resend");
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi. Vui lòng thử lại sau."
            });
        }
    }

    /// <summary>
    /// CHỨC NĂNG 4: Đăng nhập với Email/Password
    /// POST /api/auth/login
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var response = await _authService.LoginAsync(request.Email, request.Password);
            return Ok(new
            {
                success = true,
                data = response
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi. Vui lòng thử lại sau."
            });
        }
    }

    /// <summary>
    /// CHỨC NĂNG 6: Đăng xuất
    /// POST /api/auth/logout
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        try
        {
            // Lấy userId từ token JWT
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Token không hợp lệ."
                });
            }

            var userId = int.Parse(userIdClaim.Value);
            await _authService.LogoutAsync(userId);

            return Ok(new
            {
                success = true,
                message = "Đăng xuất thành công."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500, new
            {
                success = false,
                message = "Đã xảy ra lỗi. Vui lòng thử lại sau."
            });
        }
    }

    /// <summary>
    /// Test endpoint - Kiểm tra authentication hoạt động
    /// GET /api/auth/me
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var name = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        return Ok(new
        {
            success = true,
            data = new
            {
                userId,
                email,
                name,
                role
            }
        });
    }

    /// <summary>
    /// API 7: Forgot Password - Gửi mã reset password qua email
    /// </summary>
    /// <param name="request">Email cần reset password</param>
    /// <returns>Thông báo đã gửi email</returns>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
    {
        try
        {
            var result = await _authService.ForgotPasswordAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new AuthResponseDto
            {
                Success = false,
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new AuthResponseDto
            {
                Success = false,
                Message = "Có lỗi xảy ra khi xử lý yêu cầu: " + ex.Message
            });
        }
    }

    /// <summary>
    /// API 8: Reset Password - Đổi password với reset token từ email
    /// </summary>
    /// <param name="request">Email, reset token và password mới</param>
    /// <returns>Thông báo reset thành công</returns>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        try
        {
            var result = await _authService.ResetPasswordAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new AuthResponseDto
            {
                Success = false,
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new AuthResponseDto
            {
                Success = false,
                Message = "Có lỗi xảy ra khi xử lý yêu cầu: " + ex.Message
            });
        }
    }

    /// <summary>
    /// API 9: Change Password - Đổi password khi đã đăng nhập
    /// </summary>
    /// <param name="request">Password hiện tại và password mới</param>
    /// <returns>Thông báo đổi password thành công</returns>
    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        try
        {
            // Lấy userId từ JWT token
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new AuthResponseDto
                {
                    Success = false,
                    Message = "Token không hợp lệ"
                });
            }

            var result = await _authService.ChangePasswordAsync(userId, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new AuthResponseDto
            {
                Success = false,
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new AuthResponseDto
            {
                Success = false,
                Message = "Có lỗi xảy ra khi xử lý yêu cầu: " + ex.Message
            });
        }
    }
}

