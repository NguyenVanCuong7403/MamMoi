using MamMoi.Application.DTOs.Auth;
using MamMoi.Application.Interfaces.Auth;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Security;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Cryptography;
using System.Text;

namespace MamMoi.Infrastructure.Services.Auth;

/// <summary>
/// Authentication Service - Xử lý logic đăng ký, đăng nhập, OTP
/// Dùng IMemoryCache để lưu OTP tạm (không lưu DB)
/// </summary>
public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;
    private readonly TokenService _tokenService;
    private readonly IMemoryCache _cache;

    public AuthService(
        IUserRepository userRepository, 
        IEmailService emailService,
        TokenService tokenService,
        IMemoryCache cache)
    {
        _userRepository = userRepository;
        _emailService = emailService;
        _tokenService = tokenService;
        _cache = cache;
    }

    /// <summary>
    /// CHỨC NĂNG 1: Đăng ký user mới + Gửi OTP
    /// </summary>
    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        // 1. Kiểm tra email đã tồn tại chưa
        if (await _userRepository.ExistsAsync(request.Email))
        {
            throw new InvalidOperationException("Email đã được đăng ký. Vui lòng dùng email khác.");
        }

        // 2. Hash password
        var passwordHash = HashPassword(request.Password);

        // 3. Tạo user mới (chưa verify)
        var user = new User
        {
            Email = request.Email,
            FullName = request.FullName,
            Phone = request.Phone,
            PasswordHash = passwordHash,
            RoleId = 3, // Role Farmer mặc định - có thể tạo vườn và giao cho Staff
            IsActive = false, // Chưa active vì chưa verify email
            CreatedAt = DateTime.UtcNow
        };

        // 4. Lưu user vào DB
        var createdUser = await _userRepository.AddAsync(user);
        var userEntity = (User)createdUser;

        // 5. Generate OTP (6 số random)
        var otpCode = GenerateOtp();

        // 6. Lưu OTP vào cache (expire sau 5 phút)
        var cacheKey = $"otp_{request.Email}";
        var otpData = new 
        { 
            Code = otpCode, 
            UserId = userEntity.UserId,
            CreatedAt = DateTime.UtcNow 
        };
        _cache.Set(cacheKey, otpData, TimeSpan.FromMinutes(5));

        // 7. Gửi OTP qua email (TEMPORARY: Skip để test)
        try
        {
            await _emailService.SendOtpEmailAsync(request.Email, request.FullName, otpCode);
        }
        catch (Exception ex)
        {
            // Log lỗi email nhưng không throw - cho phép register tiếp
            Console.WriteLine($"[WARNING] Failed to send OTP email: {ex.Message}");
            // OTP vẫn lưu trong cache, user có thể lấy từ log
            Console.WriteLine($"[OTP CODE for {request.Email}]: {otpCode}");
        }

        // 8. Trả response (chưa có token vì chưa verify)
        return new AuthResponseDto
        {
            UserId = userEntity.UserId,
            Email = userEntity.Email,
            FullName = userEntity.FullName,
            IsEmailVerified = false,
            AccessToken = null,
            RefreshToken = null,
            Message = "Đăng ký thành công! Vui lòng kiểm tra email để nhận mã OTP."
        };
    }

    /// <summary>
    /// CHỨC NĂNG 2: Xác thực OTP
    /// </summary>
    public async Task<AuthResponseDto> VerifyOtpAsync(VerifyOtpRequestDto request)
    {
        // 1. Lấy OTP từ cache
        var cacheKey = $"otp_{request.Email}";
        if (!_cache.TryGetValue<dynamic>(cacheKey, out var otpData) || otpData == null)
        {
            throw new InvalidOperationException("Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.");
        }

        // 2. Kiểm tra OTP có đúng không
        if (otpData.Code != request.OtpCode)
        {
            throw new InvalidOperationException("Mã OTP không đúng. Vui lòng thử lại.");
        }

        // 3. Lấy user từ DB
        var user = await _userRepository.GetByIdAsync((int)otpData.UserId);
        if (user == null)
        {
            throw new InvalidOperationException("Không tìm thấy user.");
        }

        var userEntity = (User)user;

        // 4. Active user (đã verify email)
        userEntity.IsActive = true;
        userEntity.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(userEntity);

        // 5. Xóa OTP khỏi cache (đã dùng rồi)
        _cache.Remove(cacheKey);

        // 6. Generate tokens
        var accessToken = _tokenService.GenerateToken(
            userEntity.UserId.ToString(), 
            userEntity.FullName, 
            userEntity.Email,
            new[] { userEntity.Role?.RoleName ?? "User" }
        );

        var refreshToken = GenerateRefreshToken();

        // 7. Lưu refresh token vào cache (expire sau 7 ngày, 2 mappings)
        var refreshTokenKey = $"refresh_{userEntity.UserId}";
        var tokenToUserKey = $"token_{refreshToken}"; // Mapping ngược: token → userId
        
        _cache.Set(refreshTokenKey, refreshToken, TimeSpan.FromDays(7));
        _cache.Set(tokenToUserKey, userEntity.UserId, TimeSpan.FromDays(7)); // Lưu userId

        // 8. Gửi email chào mừng (TEMPORARY: Skip để test)
        try
        {
            await _emailService.SendWelcomeEmailAsync(userEntity.Email, userEntity.FullName);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WARNING] Failed to send welcome email: {ex.Message}");
        }

        // 9. Trả response với tokens
        return new AuthResponseDto
        {
            UserId = userEntity.UserId,
            Email = userEntity.Email,
            FullName = userEntity.FullName,
            IsEmailVerified = true,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            TokenExpiresAt = DateTime.UtcNow.AddMinutes(60),
            Message = "Xác thực thành công! Chào mừng bạn đến với MamMoi."
        };
    }

    /// <summary>
    /// CHỨC NĂNG 3: Gửi lại OTP
    /// </summary>
    public async Task<AuthResponseDto> ResendOtpAsync(ResendOtpRequestDto request)
    {
        // 1. Kiểm tra email có tồn tại không
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new InvalidOperationException("Email không tồn tại trong hệ thống.");
        }

        var userEntity = (User)user;

        // 2. Kiểm tra user đã verify chưa
        if (userEntity.IsActive)
        {
            throw new InvalidOperationException("Email đã được xác thực rồi.");
        }

        // 3. Generate OTP mới
        var otpCode = GenerateOtp();

        // 4. Lưu OTP mới vào cache (ghi đè OTP cũ)
        var cacheKey = $"otp_{request.Email}";
        var otpData = new 
        { 
            Code = otpCode, 
            UserId = userEntity.UserId,
            CreatedAt = DateTime.UtcNow 
        };
        _cache.Set(cacheKey, otpData, TimeSpan.FromMinutes(5));

        // 5. Gửi OTP mới qua email (TEMPORARY: Skip để test)
        try
        {
            await _emailService.SendOtpEmailAsync(request.Email, userEntity.FullName, otpCode);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WARNING] Failed to send OTP email: {ex.Message}");
            Console.WriteLine($"[OTP CODE for {request.Email}]: {otpCode}");
        }

        // 6. Trả response
        return new AuthResponseDto
        {
            UserId = userEntity.UserId,
            Email = userEntity.Email,
            FullName = userEntity.FullName,
            IsEmailVerified = false,
            Message = "Đã gửi lại mã OTP mới. Vui lòng kiểm tra email."
        };
    }

    /// <summary>
    /// CHỨC NĂNG 4: Đăng nhập với Email/Password
    /// </summary>
    public async Task<AuthResponseDto> LoginAsync(string email, string password)
    {
        // 1. Tìm user theo email
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
        {
            throw new InvalidOperationException("Email hoặc mật khẩu không đúng.");
        }

        var userEntity = (User)user;

        // 2. Kiểm tra password
        if (!VerifyPassword(password, userEntity.PasswordHash))
        {
            throw new InvalidOperationException("Email hoặc mật khẩu không đúng.");
        }

        // 3. Kiểm tra đã verify email chưa
        if (!userEntity.IsActive)
        {
            throw new InvalidOperationException("Vui lòng xác thực email trước khi đăng nhập.");
        }

        // 4. Generate tokens
        var accessToken = _tokenService.GenerateToken(
            userEntity.UserId.ToString(), 
            userEntity.FullName, 
            userEntity.Email,
            new[] { userEntity.Role?.RoleName ?? "User" }
        );

        var refreshToken = GenerateRefreshToken();

        // 5. Lưu refresh token vào cache (2 mappings)
        var refreshTokenKey = $"refresh_{userEntity.UserId}";
        var tokenToUserKey = $"token_{refreshToken}"; // Mapping ngược: token → userId
        
        _cache.Set(refreshTokenKey, refreshToken, TimeSpan.FromDays(7));
        _cache.Set(tokenToUserKey, userEntity.UserId, TimeSpan.FromDays(7)); // Lưu userId

        // 6. Cập nhật last login
        userEntity.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(userEntity);

        // 7. Trả response
        return new AuthResponseDto
        {
            UserId = userEntity.UserId,
            Email = userEntity.Email,
            FullName = userEntity.FullName,
            IsEmailVerified = true,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            TokenExpiresAt = DateTime.UtcNow.AddMinutes(60),
            Message = "Đăng nhập thành công!"
        };
    }

    /// <summary>
    /// CHỨC NĂNG 5: Làm mới Access Token bằng Refresh Token
    /// </summary>
    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            throw new InvalidOperationException("Refresh token không hợp lệ.");
        }

        // 1. Lấy userId từ mapping: token → userId
        var tokenToUserKey = $"token_{refreshToken}";
        if (!_cache.TryGetValue(tokenToUserKey, out int userId))
        {
            throw new InvalidOperationException("Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
        }

        // 2. Verify token còn khớp với user không
        var refreshTokenKey = $"refresh_{userId}";
        if (!_cache.TryGetValue(refreshTokenKey, out string? cachedToken) || cachedToken != refreshToken)
        {
            throw new InvalidOperationException("Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
        }

        // 3. Lấy thông tin user từ DB
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User không tồn tại.");
        }

        // 4. Kiểm tra user còn active không
        if (!user.IsActive)
        {
            throw new InvalidOperationException("Tài khoản đã bị vô hiệu hóa.");
        }

        // 5. Generate Access Token mới
        var roleName = user.Role?.RoleName ?? "User";
        string[] roles = new string[] { roleName };
        var newAccessToken = _tokenService.GenerateToken(
            userId: user.UserId.ToString(),
            username: user.FullName,
            email: user.Email,
            roles: roles
        );

        var tokenExpiry = DateTime.UtcNow.AddMinutes(60); // Access Token hết hạn sau 60 phút

        // 6. Trả về token mới (Refresh Token giữ nguyên)
        return new AuthResponseDto
        {
            Success = true,
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            IsEmailVerified = true,
            AccessToken = newAccessToken,
            RefreshToken = refreshToken, // Giữ nguyên Refresh Token cũ
            TokenExpiresAt = tokenExpiry,
            Message = "Access token đã được làm mới thành công."
        };
    }

    /// <summary>
    /// CHỨC NĂNG 6: Đăng xuất (xóa refresh token)
    /// </summary>
    public async Task LogoutAsync(int userId)
    {
        // Lấy refresh token trước khi xóa
        var refreshTokenKey = $"refresh_{userId}";
        if (_cache.TryGetValue(refreshTokenKey, out string? refreshToken))
        {
            // Xóa cả 2 mappings
            var tokenToUserKey = $"token_{refreshToken}";
            _cache.Remove(tokenToUserKey); // Xóa mapping: token → userId
        }
        
        _cache.Remove(refreshTokenKey); // Xóa mapping: userId → token
        
        await Task.CompletedTask;
    }

    /// <summary>
    /// CHỨC NĂNG 7: Forgot Password - Gửi reset token qua email
    /// </summary>
    public async Task<AuthResponseDto> ForgotPasswordAsync(ForgotPasswordRequestDto request)
    {
        // 1. Kiểm tra user có tồn tại không
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new InvalidOperationException("Email không tồn tại trong hệ thống.");
        }

        // 2. Kiểm tra tài khoản đã được kích hoạt chưa
        if (!user.IsActive)
        {
            throw new InvalidOperationException("Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP trước.");
        }

        // 3. Generate reset token (6 số)
        var resetToken = GenerateOtp();

        // 4. Lưu reset token vào cache (15 phút)
        var resetTokenKey = $"reset_{user.Email}";
        _cache.Set(resetTokenKey, resetToken, TimeSpan.FromMinutes(15));

        // 5. Gửi reset token qua email
        try
        {
            await _emailService.SendPasswordResetEmailAsync(user.Email, user.FullName, resetToken);
        }
        catch (Exception ex)
        {
            // Nếu gửi email lỗi, hiển thị token trong console để test
            Console.WriteLine($"[RESET TOKEN for {user.Email}]: {resetToken}");
            Console.WriteLine($"Email error: {ex.Message}");
        }

        return new AuthResponseDto
        {
            Success = true,
            Message = "Mã reset password đã được gửi đến email của bạn. Vui lòng kiểm tra (có thể trong spam)."
        };
    }

    /// <summary>
    /// CHỨC NĂNG 8: Reset Password - Đổi password với reset token
    /// </summary>
    public async Task<AuthResponseDto> ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        // 1. Kiểm tra user có tồn tại không
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new InvalidOperationException("Email không tồn tại trong hệ thống.");
        }

        // 2. Lấy reset token từ cache
        var resetTokenKey = $"reset_{user.Email}";
        if (!_cache.TryGetValue(resetTokenKey, out string? cachedToken))
        {
            throw new InvalidOperationException("Mã reset password không hợp lệ hoặc đã hết hạn.");
        }

        // 3. Verify reset token
        if (cachedToken != request.ResetToken)
        {
            throw new InvalidOperationException("Mã reset password không đúng.");
        }

        // 4. Hash password mới
        var newPasswordHash = HashPassword(request.NewPassword);

        // 5. Cập nhật password trong DB
        user.PasswordHash = newPasswordHash;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        // 6. Xóa reset token khỏi cache
        _cache.Remove(resetTokenKey);

        // 7. Xóa refresh token cũ (force logout)
        var refreshTokenKey = $"refresh_{user.UserId}";
        _cache.Remove(refreshTokenKey);

        return new AuthResponseDto
        {
            Success = true,
            Message = "Password đã được reset thành công. Vui lòng đăng nhập với password mới."
        };
    }

    /// <summary>
    /// CHỨC NĂNG 9: Change Password - Đổi password khi đã login
    /// </summary>
    public async Task<AuthResponseDto> ChangePasswordAsync(int userId, ChangePasswordRequestDto request)
    {
        // 1. Lấy thông tin user
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User không tồn tại.");
        }

        // 2. Verify password hiện tại
        if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            throw new InvalidOperationException("Password hiện tại không đúng.");
        }

        // 3. Kiểm tra password mới khác password cũ
        if (request.CurrentPassword == request.NewPassword)
        {
            throw new InvalidOperationException("Password mới phải khác password hiện tại.");
        }

        // 4. Hash password mới
        var newPasswordHash = HashPassword(request.NewPassword);

        // 5. Cập nhật password trong DB
        user.PasswordHash = newPasswordHash;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        // 6. Xóa refresh token (force re-login)
        var refreshTokenKey = $"refresh_{user.UserId}";
        _cache.Remove(refreshTokenKey);

        return new AuthResponseDto
        {
            Success = true,
            Message = "Password đã được thay đổi thành công. Vui lòng đăng nhập lại."
        };
    }

    #region Helper Methods

    /// <summary>
    /// Generate OTP ngẫu nhiên (6 số)
    /// </summary>
    private string GenerateOtp()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }

    /// <summary>
    /// Generate Refresh Token ngẫu nhiên
    /// </summary>
    private string GenerateRefreshToken()
    {
        var randomBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    /// <summary>
    /// Hash password bằng SHA256 (nên dùng BCrypt trong production)
    /// </summary>
    private byte[] HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        return sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
    }

    /// <summary>
    /// Verify password
    /// </summary>
    private bool VerifyPassword(string password, byte[] passwordHash)
    {
        var inputHash = HashPassword(password);
        return inputHash.SequenceEqual(passwordHash);
    }

    #endregion
}
