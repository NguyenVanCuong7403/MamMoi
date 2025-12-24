using MamMoi.Application.DTOs.Auth;
using MamMoi.Application.Interfaces;
using MamMoi.Application.Interfaces.Auth;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace MamMoi.Infrastructure.Services.Auth;

/// <summary>
/// Authentication Service - Xử lý logic đăng ký, đăng nhập, OTP
/// Dùng IMemoryCache để lưu OTP tạm (không lưu DB)
/// </summary>
public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly TokenService _tokenService;
    private readonly IMemoryCache _cache;
    private readonly MamMoiDbContext _context;

    public AuthService(
        IUserRepository userRepository,
        IEmailService emailService,
        ISmsService smsService,
        TokenService tokenService,
        IMemoryCache cache,
        MamMoiDbContext context)
    {
        _userRepository = userRepository;
        _emailService = emailService;
        _smsService = smsService;
        _tokenService = tokenService;
        _cache = cache;
        _context = context;
    }

    /// <summary>
    /// CHỨC NĂNG 1: Đăng ký user mới + Gửi OTP (qua Email hoặc SMS)
    /// </summary>
    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        // 1. Normalize phone if provided
        var normalizedPhone = !string.IsNullOrWhiteSpace(request.Phone) 
            ? NormalizePhoneNumber(request.Phone) 
            : null;

        // 2. Kiểm tra email hoặc phone đã tồn tại chưa
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            if (await _userRepository.ExistsAsync(request.Email))
            {
                throw new InvalidOperationException("Email đã được đăng ký. Vui lòng dùng email khác.");
            }
        }

        if (!string.IsNullOrWhiteSpace(normalizedPhone))
        {
            var phoneExists = await _context.Users.AnyAsync(u => u.Phone == normalizedPhone);
            if (phoneExists)
            {
                throw new InvalidOperationException("Số điện thoại đã được đăng ký. Vui lòng dùng số khác.");
            }
        }

        // 3. Hash password
        var passwordHash = HashPassword(request.Password);

        // 4. Tạo user mới (chưa verify)
        var user = new User
        {
            Email = request.Email ?? "", // Allow empty email for phone-only registration
            FullName = request.FullName,
            Phone = normalizedPhone,
            PasswordHash = passwordHash,
            RoleId = 3, // Role Farmer mặc định
            IsActive = false, // Chưa active vì chưa verify
            CreatedAt = DateTime.Now
        };

        // 5. Lưu user vào DB
        var createdUser = await _userRepository.AddAsync(user);
        var userEntity = (User)createdUser;

        // 6. Generate OTP (6 số random)
        var otpCode = GenerateOtp();

        // 7. Xác định kênh gửi OTP: ưu tiên email, fallback to phone
        bool sentViaEmail = false;
        bool sentViaSms = false;

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            // Gửi OTP qua Email
            var cacheKey = $"otp_{request.Email}";
            var otpData = new { Code = otpCode, UserId = userEntity.UserId, CreatedAt = DateTime.Now };
            _cache.Set(cacheKey, otpData, TimeSpan.FromMinutes(5));

            try
            {
                await _emailService.SendOtpEmailAsync(request.Email, request.FullName, otpCode);
                sentViaEmail = true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WARNING] Failed to send OTP email: {ex.Message}");
                Console.WriteLine($"[OTP CODE for {request.Email}]: {otpCode}");
            }
        }
        else if (!string.IsNullOrWhiteSpace(normalizedPhone))
        {
            // Gửi OTP qua SMS (phone-only registration)
            var cacheKey = $"otp_phone_{normalizedPhone}";
            var otpData = new { Code = otpCode, UserId = userEntity.UserId, CreatedAt = DateTime.Now };
            _cache.Set(cacheKey, otpData, TimeSpan.FromMinutes(5));

            try
            {
                await _smsService.SendOtpSmsAsync(normalizedPhone, otpCode);
                sentViaSms = true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WARNING] Failed to send OTP SMS: {ex.Message}");
                Console.WriteLine($"[OTP CODE for {normalizedPhone}]: {otpCode}");
            }
        }

        // 8. Trả response
        string message = sentViaEmail
            ? "Đăng ký thành công! Vui lòng kiểm tra email để nhận mã OTP."
            : sentViaSms
                ? "Đăng ký thành công! Vui lòng kiểm tra tin nhắn SMS để nhận mã OTP."
                : "Đăng ký thành công! Mã OTP đã được tạo.";

        return new AuthResponseDto
        {
            UserId = userEntity.UserId,
            Email = userEntity.Email,
            FullName = userEntity.FullName,
            IsEmailVerified = false,
            AccessToken = null,
            RefreshToken = null,
            Message = message
        };
    }

    /// <summary>
    /// CHỨC NĂNG 2: Xác thực OTP (hỗ trợ cả Email và Phone)
    /// </summary>
    public async Task<AuthResponseDto> VerifyOtpAsync(VerifyOtpRequestDto request)
    {
        // 1. Determine cache key based on email or phone
        dynamic? otpData = null;
        string cacheKey = "";

        // Try email first
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            cacheKey = $"otp_{request.Email}";
            _cache.TryGetValue<dynamic>(cacheKey, out otpData);
        }

        // If not found and phone is provided, try phone
        if (otpData == null && !string.IsNullOrWhiteSpace(request.Phone))
        {
            var normalizedPhone = NormalizePhoneNumber(request.Phone);
            cacheKey = $"otp_phone_{normalizedPhone}";
            _cache.TryGetValue<dynamic>(cacheKey, out otpData);
        }

        if (otpData == null)
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

        // 4. Active user (đã verify email/phone)
        userEntity.IsActive = true;
        userEntity.UpdatedAt = DateTime.Now;
        await _userRepository.UpdateAsync(userEntity);

        // 5. Xóa OTP khỏi cache (đã dùng rồi)
        _cache.Remove(cacheKey);

        // 6. Generate tokens
        var accessToken = _tokenService.GenerateToken(
            userEntity.UserId.ToString(),
            userEntity.FullName,
            userEntity.Email ?? userEntity.Phone ?? "",
            new[] { userEntity.Role?.RoleName ?? "User" }
        );

        var refreshToken = GenerateRefreshToken();

        // 7. Lưu refresh token vào cache (expire sau 7 ngày, 2 mappings)
        var refreshTokenKey = $"refresh_{userEntity.UserId}";
        var tokenToUserKey = $"token_{refreshToken}"; // Mapping ngược: token → userId

        _cache.Set(refreshTokenKey, refreshToken, TimeSpan.FromDays(7));
        _cache.Set(tokenToUserKey, userEntity.UserId, TimeSpan.FromDays(7)); // Lưu userId

        // 8. Gửi email chào mừng (chỉ khi có email)
        if (!string.IsNullOrEmpty(userEntity.Email))
        {
            try
            {
                await _emailService.SendWelcomeEmailAsync(userEntity.Email, userEntity.FullName);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WARNING] Failed to send welcome email: {ex.Message}");
            }
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
            TokenExpiresAt = DateTime.Now.AddDays(7),
            Message = "Xác thực thành công! Chào mừng bạn đến với MamMoi.",
            RoleId = userEntity.RoleId
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

        // 2. Kiểm tra tài khoản có bị khóa không
        if (userEntity.IsActive != true)
        {
            // Phân biệt giữa tài khoản bị khóa và tài khoản chưa xác thực
            // Nếu LastLoginAt != null, tài khoản đã từng đăng nhập (đã verify) → bị khóa bởi admin
            if (userEntity.LastLoginAt != null)
            {
                // Tài khoản đã từng active nhưng bị khóa bởi admin - không cho phép resend OTP
                throw new InvalidOperationException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.");
            }

            // Đối với Farmer (RoleId = 3): luôn cho phép resend OTP nếu chưa verify
            // Chỉ khóa hoàn toàn đối với Staff không có garden active
            if (userEntity.RoleId == 4) // Staff role
            {
                var hasActiveGarden = await _context.GardenMembers
                    .AnyAsync(gm => gm.UserId == userEntity.UserId && gm.Status == "Active");

                if (!hasActiveGarden)
                {
                    throw new InvalidOperationException("Tài khoản nhân viên tạm thời bị khóa do không có vườn hoạt động. Vui lòng liên hệ quản lý vườn để được phân công.");
                }
            }

            // Farmer hoặc Staff có garden active: cho phép resend OTP (tài khoản chưa verify)
        }
        else
        {
            // Tài khoản đã active → không cần resend OTP
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
            CreatedAt = DateTime.Now
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

        // 3. Kiểm tra tài khoản có active không
        if (userEntity.IsActive != true)
        {
            // Phân biệt giữa tài khoản bị khóa và tài khoản chưa xác thực
            // Nếu LastLoginAt != null, tài khoản đã từng đăng nhập (đã verify) → bị khóa bởi admin
            // Nếu LastLoginAt == null, tài khoản chưa từng đăng nhập → chưa verify
            if (userEntity.LastLoginAt != null)
            {
                // Tài khoản đã từng active nhưng bị khóa bởi admin
                throw new InvalidOperationException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.");
            }

            // Đối với Farmer (RoleId = 3): luôn cho phép resend OTP nếu chưa verify
            // Chỉ khóa hoàn toàn đối với Staff không có garden active
            if (userEntity.RoleId == 4) // Staff role
            {
                var hasActiveGarden = await _context.GardenMembers
                    .AnyAsync(gm => gm.UserId == userEntity.UserId && gm.Status == "Active");

                if (!hasActiveGarden)
                {
                    throw new InvalidOperationException("Tài khoản nhân viên tạm thời bị khóa do không có vườn hoạt động. Vui lòng liên hệ quản lý vườn để được phân công.");
                }
            }

            // Farmer hoặc Staff có garden active: cho phép resend OTP (tài khoản chưa verify)
            throw new InvalidOperationException("Tài khoản chưa được xác thực. Vui lòng kiểm tra email để nhận mã OTP hoặc sử dụng tính năng 'Gửi lại OTP'.");
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
        userEntity.LastLoginAt = DateTime.Now;
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
            ProfileImageUrl = userEntity.ProfileImageUrl,
            TokenExpiresAt = DateTime.Now.AddDays(7),
            Message = "Đăng nhập thành công!",
            RoleId = userEntity.RoleId
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
        if (user.IsActive != true)
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

        var tokenExpiry = DateTime.Now.AddDays(7); // Access Token hết hạn sau 1 tuần

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
        if (user.IsActive != true)
        {
            var userEntity = (User)user;
            // Phân biệt giữa tài khoản bị khóa và tài khoản chưa xác thực
            if (userEntity.LastLoginAt != null)
            {
                // Tài khoản đã từng active nhưng bị khóa bởi admin
                throw new InvalidOperationException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.");
            }
            // Tài khoản chưa được xác thực
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

        var userEntity = (User)user;

        // 1.5. Kiểm tra tài khoản có bị khóa không
        if (userEntity.IsActive != true)
        {
            // Phân biệt giữa tài khoản bị khóa và tài khoản chưa xác thực
            if (userEntity.LastLoginAt != null)
            {
                // Tài khoản đã từng active nhưng bị khóa bởi admin
                throw new InvalidOperationException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.");
            }

            // Nếu là staff và không có vườn active nào → tài khoản bị khóa hoàn toàn
            if (userEntity.RoleId == 4) // Staff role
            {
                var hasActiveGarden = await _context.GardenMembers
                    .AnyAsync(gm => gm.UserId == userEntity.UserId && gm.Status == "Active");

                if (!hasActiveGarden)
                {
                    throw new InvalidOperationException("Tài khoản nhân viên tạm thời bị khóa do không có vườn hoạt động. Vui lòng liên hệ quản lý vườn để được phân công.");
                }
            }

            // Tài khoản chưa được xác thực - không cho phép reset password
            throw new InvalidOperationException("Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP trước.");
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
        user.UpdatedAt = DateTime.Now;
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
    /// CHỨC NĂNG 8.5: Verify Reset OTP - Chỉ xác thực OTP reset password (không đổi password)
    /// </summary>
    public async Task<AuthResponseDto> VerifyResetOtpAsync(string email, string resetToken)
    {
        // 1. Kiểm tra user có tồn tại không
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
        {
            throw new InvalidOperationException("Email không tồn tại trong hệ thống.");
        }

        var userEntity = (User)user;

        // 2. Kiểm tra tài khoản có bị khóa không
        if (userEntity.IsActive != true)
        {
            if (userEntity.LastLoginAt != null)
            {
                throw new InvalidOperationException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.");
            }

            if (userEntity.RoleId == 4)
            {
                var hasActiveGarden = await _context.GardenMembers
                    .AnyAsync(gm => gm.UserId == userEntity.UserId && gm.Status == "Active");

                if (!hasActiveGarden)
                {
                    throw new InvalidOperationException("Tài khoản nhân viên tạm thời bị khóa do không có vườn hoạt động. Vui lòng liên hệ quản lý vườn để được phân công.");
                }
            }

            throw new InvalidOperationException("Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP trước.");
        }

        // 3. Lấy reset token từ cache
        var resetTokenKey = $"reset_{email}";
        if (!_cache.TryGetValue(resetTokenKey, out string? cachedToken))
        {
            throw new InvalidOperationException("Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.");
        }

        // 4. Verify reset token
        if (cachedToken != resetToken)
        {
            throw new InvalidOperationException("Mã OTP không đúng. Vui lòng thử lại.");
        }

        // 5. OTP hợp lệ - KHÔNG xóa khỏi cache (sẽ xóa khi reset password thực sự)
        return new AuthResponseDto
        {
            Success = true,
            Message = "Mã OTP hợp lệ. Vui lòng đặt mật khẩu mới."
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
        user.UpdatedAt = DateTime.Now;
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

    /// <summary>
    /// CHỨC NĂNG 9: Đăng nhập hoặc đăng ký với Google OAuth
    /// </summary>
    public async Task<AuthResponseDto> LoginWithGoogleAsync(string idToken)
    {
        if (string.IsNullOrWhiteSpace(idToken))
        {
            throw new InvalidOperationException("Google ID token is required");
        }

        // Decode Google ID token to get user info
        // Note: In production, you should verify the token with Google's API
        var googleUserInfo = DecodeGoogleToken(idToken);
        if (googleUserInfo == null)
        {
            throw new InvalidOperationException("Invalid Google ID token");
        }

        var email = googleUserInfo.Email;
        var fullName = googleUserInfo.Name ?? googleUserInfo.GivenName ?? "User";
        var googleId = googleUserInfo.Sub;

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new InvalidOperationException("Email not found in Google account");
        }

        // Check if user already exists
        var existingUser = await _userRepository.GetByEmailAsync(email);
        User userEntity;

        if (existingUser != null)
        {
            // User exists - log them in
            userEntity = (User)existingUser;
            
            // Update last login
            userEntity.LastLoginAt = DateTime.Now;
            if (string.IsNullOrEmpty(userEntity.ProfileImageUrl) && !string.IsNullOrEmpty(googleUserInfo.Picture))
            {
                userEntity.ProfileImageUrl = googleUserInfo.Picture;
            }
            await _userRepository.UpdateAsync(userEntity);
        }
        else
        {
            // User doesn't exist - create new user (auto-verified since Google verified)
            // Get default role (Farmer/User role, typically roleId = 2 or 3)
            var defaultRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.RoleName == "Farmer" || r.RoleName == "User");
            
            if (defaultRole == null)
            {
                // Fallback to roleId 2 if Farmer role doesn't exist
                defaultRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleId == 2);
            }

            if (defaultRole == null)
            {
                throw new InvalidOperationException("Default role not found. Please contact administrator.");
            }

            // Generate a random password hash (user won't need password for Google login)
            var randomPassword = Guid.NewGuid().ToString();
            var passwordHash = HashPassword(randomPassword);

            var newUser = new User
            {
                Email = email,
                FullName = fullName,
                PasswordHash = passwordHash,
                RoleId = defaultRole.RoleId,
                IsActive = true, // Auto-verified via Google
                ProfileImageUrl = googleUserInfo.Picture,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            userEntity = (User)await _userRepository.AddAsync(newUser);
        }

        // Generate tokens
        var accessToken = _tokenService.GenerateToken(
            userEntity.UserId.ToString(),
            userEntity.FullName,
            userEntity.Email,
            new[] { userEntity.Role?.RoleName ?? "User" }
        );

        var refreshToken = GenerateRefreshToken();

        // Save refresh token
        var refreshTokenKey = $"refresh_{userEntity.UserId}";
        var tokenToUserKey = $"token_{refreshToken}";
        _cache.Set(refreshTokenKey, refreshToken, TimeSpan.FromDays(7));
        _cache.Set(tokenToUserKey, userEntity.UserId, TimeSpan.FromDays(7));

        return new AuthResponseDto
        {
            UserId = userEntity.UserId,
            Email = userEntity.Email,
            FullName = userEntity.FullName,
            IsEmailVerified = true,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ProfileImageUrl = userEntity.ProfileImageUrl,
            TokenExpiresAt = DateTime.Now.AddDays(7),
            Message = existingUser != null ? "Đăng nhập thành công!" : "Đăng ký và đăng nhập thành công!",
            RoleId = userEntity.RoleId
        };
    }

    /// <summary>
    /// Decode Google ID token (simple JWT decode - in production, verify with Google)
    /// </summary>
    private GoogleUserInfo? DecodeGoogleToken(string idToken)
    {
        try
        {
            var parts = idToken.Split('.');
            if (parts.Length != 3) return null;

            var payload = parts[1];
            // Add padding if needed
            var padding = 4 - (payload.Length % 4);
            if (padding != 4)
            {
                payload += new string('=', padding);
            }
            payload = payload.Replace('-', '+').Replace('_', '/');

            var jsonBytes = Convert.FromBase64String(payload);
            var json = Encoding.UTF8.GetString(jsonBytes);
            var tokenData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(json);

            if (tokenData == null) return null;

            return new GoogleUserInfo
            {
                Sub = tokenData.GetValueOrDefault("sub")?.ToString() ?? "",
                Email = tokenData.GetValueOrDefault("email")?.ToString() ?? "",
                Name = tokenData.GetValueOrDefault("name")?.ToString(),
                GivenName = tokenData.GetValueOrDefault("given_name")?.ToString(),
                FamilyName = tokenData.GetValueOrDefault("family_name")?.ToString(),
                Picture = tokenData.GetValueOrDefault("picture")?.ToString()
            };
        }
        catch
        {
            return null;
        }
    }

    private class GoogleUserInfo
    {
        public string Sub { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? GivenName { get; set; }
        public string? FamilyName { get; set; }
        public string? Picture { get; set; }
    }

    /// <summary>
    /// CHỨC NĂNG 10: Gửi OTP qua SMS cho xác thực số điện thoại
    /// </summary>
    public async Task<AuthResponseDto> SendPhoneOtpAsync(SendPhoneOtpRequestDto request)
    {
        // 1. Normalize phone number
        var phone = NormalizePhoneNumber(request.Phone);

        // 2. Check if phone already exists and is verified
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Phone == phone && u.IsActive);
        if (existingUser != null)
        {
            throw new InvalidOperationException("Số điện thoại này đã được đăng ký. Vui lòng dùng số khác.");
        }

        // 3. Generate OTP
        var otpCode = GenerateOtp();

        // 4. Store OTP in cache (5 minutes)
        var cacheKey = $"phone_otp_{phone}";
        _cache.Set(cacheKey, otpCode, TimeSpan.FromMinutes(5));

        // 5. Send OTP via SMS
        try
        {
            await _smsService.SendOtpSmsAsync(phone, otpCode);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SMS ERROR] Failed to send OTP: {ex.Message}");
            Console.WriteLine($"[OTP CODE for {phone}]: {otpCode}");
        }

        return new AuthResponseDto
        {
            Success = true,
            Message = "Mã OTP đã được gửi đến số điện thoại của bạn."
        };
    }

    /// <summary>
    /// CHỨC NĂNG 11: Xác thực OTP từ SMS
    /// </summary>
    public async Task<AuthResponseDto> VerifyPhoneOtpAsync(VerifyPhoneOtpRequestDto request)
    {
        var phone = NormalizePhoneNumber(request.Phone);

        // 1. Get OTP from cache
        var cacheKey = $"phone_otp_{phone}";
        if (!_cache.TryGetValue(cacheKey, out string? cachedOtp))
        {
            throw new InvalidOperationException("Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.");
        }

        // 2. Verify OTP
        if (cachedOtp != request.OtpCode)
        {
            throw new InvalidOperationException("Mã OTP không đúng. Vui lòng thử lại.");
        }

        // 3. Mark phone as verified in cache (for registration flow)
        var verifiedKey = $"phone_verified_{phone}";
        _cache.Set(verifiedKey, true, TimeSpan.FromMinutes(30));

        // 4. Remove OTP from cache
        _cache.Remove(cacheKey);

        return new AuthResponseDto
        {
            Success = true,
            Message = "Xác thực số điện thoại thành công!"
        };
    }

    /// <summary>
    /// CHỨC NĂNG 12: Đăng nhập với Phone/Password
    /// </summary>
    public async Task<AuthResponseDto> LoginWithPhoneAsync(string phone, string password)
    {
        var normalizedPhone = NormalizePhoneNumber(phone);

        // 1. Find user by phone
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Phone == normalizedPhone);

        if (user == null)
        {
            throw new InvalidOperationException("Số điện thoại hoặc mật khẩu không đúng.");
        }

        // 2. Verify password
        if (!VerifyPassword(password, user.PasswordHash))
        {
            throw new InvalidOperationException("Số điện thoại hoặc mật khẩu không đúng.");
        }

        // 3. Check if account is active
        if (!user.IsActive)
        {
            throw new InvalidOperationException("Tài khoản chưa được xác thực hoặc đã bị khóa.");
        }

        // 4. Generate tokens
        var accessToken = _tokenService.GenerateToken(
            user.UserId.ToString(),
            user.FullName,
            user.Email ?? user.Phone ?? "",
            new[] { user.Role?.RoleName ?? "User" }
        );

        var refreshToken = GenerateRefreshToken();

        // 5. Save refresh token
        var refreshTokenKey = $"refresh_{user.UserId}";
        var tokenToUserKey = $"token_{refreshToken}";
        _cache.Set(refreshTokenKey, refreshToken, TimeSpan.FromDays(7));
        _cache.Set(tokenToUserKey, user.UserId, TimeSpan.FromDays(7));

        // 6. Update last login
        user.LastLoginAt = DateTime.Now;
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            IsEmailVerified = true,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ProfileImageUrl = user.ProfileImageUrl,
            TokenExpiresAt = DateTime.Now.AddDays(7),
            Message = "Đăng nhập thành công!",
            RoleId = user.RoleId
        };
    }

    /// <summary>
    /// Normalize phone number to standard format
    /// </summary>
    private string NormalizePhoneNumber(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return phone;
        phone = phone.Trim().Replace(" ", "").Replace("-", "");
        if (phone.StartsWith("0") && phone.Length >= 10)
        {
            phone = "+84" + phone.Substring(1);
        }
        if (!phone.StartsWith("+"))
        {
            phone = "+" + phone;
        }
        return phone;
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
