using System;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;
using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Security;
using UserEntity = MamMoi.Infrastructure.Models.User;

namespace MamMoi.Infrastructure.Services.Users;

/// <summary>
/// User service - xử lý business logic cho User
/// </summary>
public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly TokenService _tokenService;
    private readonly IWebHostEnvironment _environment;

    // Avatar upload configuration
    private const long MaxAvatarSize = 5242880; // 5MB
    private const string AvatarDirectory = "uploads/avatars";
    private readonly string[] AllowedMimeTypes = { "image/jpeg", "image/png", "image/webp" };
    private readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };

    public UserService(
        IUserRepository userRepository,
        TokenService tokenService,
        IWebHostEnvironment environment)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _environment = environment;
    }

    #region Existing Methods

    public async Task<object?> GetByIdAsync(Guid id)
    {
        var userId = int.Parse(id.ToString().Split('-')[0], System.Globalization.NumberStyles.HexNumber) % int.MaxValue;
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
            return null;

        return MapToDto((UserEntity)user);
    }

    public async Task<object> CreateAsync(object dto)
    {
        if (dto is not CreateUserDto createDto)
            throw new ArgumentException("Invalid DTO type");

        // Validation
        if (string.IsNullOrEmpty(createDto.Email))
            throw new ArgumentException("Email is required");

        // Check duplicate
        if (await _userRepository.ExistsAsync(createDto.Email))
            throw new InvalidOperationException("Email already exists");

        // Create entity
        var user = new User
        {
            Email = createDto.Email,
            FullName = createDto.FullName ?? string.Empty,
            PasswordHash = HashPassword(createDto.Password),
            RoleId = 2, // Default role (adjust based on your Role table)
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var createdUser = await _userRepository.AddAsync(user);
        return MapToDto((UserEntity)createdUser);
    }

    public async Task<object?> UpdateAsync(Guid id, object dto)
    {
        if (dto is not UpdateUserDto updateDto)
            throw new ArgumentException("Invalid DTO type");

        var userId = int.Parse(id.ToString().Split('-')[0], System.Globalization.NumberStyles.HexNumber) % int.MaxValue;
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return null;

        var userEntity = (UserEntity)user;

        if (!string.IsNullOrEmpty(updateDto.Email))
            userEntity.Email = updateDto.Email;

        if (!string.IsNullOrEmpty(updateDto.FullName))
            userEntity.FullName = updateDto.FullName;

        userEntity.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(userEntity);
        return MapToDto(userEntity);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var userId = int.Parse(id.ToString().Split('-')[0], System.Globalization.NumberStyles.HexNumber) % int.MaxValue;
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return false;

        await _userRepository.DeleteAsync(userId);
        return true;
    }

    public async Task<object?> GetByEmailAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
            return null;

        return MapToDto((UserEntity)user);
    }

    public async Task<IEnumerable<object>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(u => MapToDto((UserEntity)u));
    }

    #endregion

    #region Profile Management Methods

    /// <summary>
    /// Get user profile with detailed information
    /// </summary>
    public async Task<ProfileViewDto?> GetProfileAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return null;

        var userEntity = (UserEntity)user;
        return MapToProfileViewDto(userEntity);
    }

    /// <summary>
    /// Edit user profile with comprehensive validation
    /// </summary>
    public async Task<ProfileViewDto?> EditProfileAsync(int userId, EditProfileDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return null;

        var userEntity = (UserEntity)user;

        // Validate FullName
        if (!string.IsNullOrEmpty(dto.FullName))
        {
            if (dto.FullName.Length > 255)
                throw new ArgumentException("FullName cannot exceed 255 characters");
            if (string.IsNullOrWhiteSpace(dto.FullName))
                throw new ArgumentException("FullName cannot be empty or whitespace");
            userEntity.FullName = dto.FullName.Trim();
        }

        // Validate Phone
        if (!string.IsNullOrEmpty(dto.Phone))
        {
            if (dto.Phone.Length > 20)
                throw new ArgumentException("Phone cannot exceed 20 characters");
            if (!IsValidPhoneNumber(dto.Phone))
                throw new ArgumentException("Phone number format is invalid");
            userEntity.Phone = dto.Phone.Trim();
        }

        // Validate Address
        if (!string.IsNullOrEmpty(dto.Address))
        {
            if (dto.Address.Length > 500)
                throw new ArgumentException("Address cannot exceed 500 characters");
            userEntity.Address = dto.Address.Trim();
        }

        // Validate ExperienceLevel
        if (!string.IsNullOrEmpty(dto.ExperienceLevel))
        {
            var validLevels = new[] { "Beginner", "Intermediate", "Advanced", "Expert" };
            if (!validLevels.Contains(dto.ExperienceLevel))
                throw new ArgumentException($"Experience level must be one of: {string.Join(", ", validLevels)}");
            userEntity.ExperienceLevel = dto.ExperienceLevel;
        }

        // Validate PreferredLanguage
        if (!string.IsNullOrEmpty(dto.PreferredLanguage))
        {
            if (dto.PreferredLanguage.Length > 10)
                throw new ArgumentException("Preferred language code is invalid");
            userEntity.PreferredLanguage = dto.PreferredLanguage.ToLower();
        }

        // Validate NotificationPreferences
        if (!string.IsNullOrEmpty(dto.NotificationPreferences))
        {
            if (dto.NotificationPreferences.Length > 1000)
                throw new ArgumentException("Notification preferences data is too large");
            if (!IsValidJson(dto.NotificationPreferences))
                throw new ArgumentException("Notification preferences must be valid JSON");
            userEntity.NotificationPreferences = dto.NotificationPreferences;
        }

        userEntity.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(userEntity);
        return MapToProfileViewDto(userEntity);
    }

    /// <summary>
    /// Upload user avatar with validation
    /// </summary>
    public async Task<AvatarUploadResponseDto> UploadAvatarAsync(int userId, byte[] imageData, string mimeType)
    {
        // Validate user exists
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return new AvatarUploadResponseDto
            {
                Success = false,
                Message = "User not found"
            };

        var userEntity = (UserEntity)user;

        // Validate image data
        if (imageData == null || imageData.Length == 0)
            return new AvatarUploadResponseDto
            {
                Success = false,
                Message = "Image data is required"
            };

        // Validate file size
        if (imageData.Length > MaxAvatarSize)
            return new AvatarUploadResponseDto
            {
                Success = false,
                Message = $"File size exceeds maximum of {MaxAvatarSize / 1048576}MB"
            };

        // Validate MIME type
        if (!AllowedMimeTypes.Contains(mimeType))
            return new AvatarUploadResponseDto
            {
                Success = false,
                Message = $"File type not allowed. Allowed types: {string.Join(", ", AllowedMimeTypes)}"
            };

        try
        {
            // Create upload directory if not exists
            var uploadPath = Path.Combine(_environment.WebRootPath, AvatarDirectory);
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            // Generate unique filename
            var extension = GetExtensionFromMimeType(mimeType);
            var fileName = $"avatar_{userId}_{DateTime.UtcNow.Ticks}{extension}";
            var filePath = Path.Combine(uploadPath, fileName);

            // Delete old avatar if exists
            if (!string.IsNullOrEmpty(userEntity.ProfileImageUrl))
            {
                var oldFilePath = Path.Combine(_environment.WebRootPath, userEntity.ProfileImageUrl.TrimStart('/'));
                if (File.Exists(oldFilePath))
                    File.Delete(oldFilePath);
            }

            // Save new avatar
            await File.WriteAllBytesAsync(filePath, imageData);

            // Update user profile image URL
            userEntity.ProfileImageUrl = $"/uploads/avatars/{fileName}";
            userEntity.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(userEntity);

            return new AvatarUploadResponseDto
            {
                Success = true,
                AvatarUrl = userEntity.ProfileImageUrl,
                Message = "Avatar uploaded successfully"
            };
        }
        catch (Exception ex)
        {
            return new AvatarUploadResponseDto
            {
                Success = false,
                Message = $"Failed to upload avatar: {ex.Message}"
            };
        }
    }

    /// <summary>
    /// Delete user avatar
    /// </summary>
    public async Task<DeleteAvatarResponseDto> DeleteAvatarAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return new DeleteAvatarResponseDto
            {
                Success = false,
                Message = "User not found"
            };

        var userEntity = (UserEntity)user;

        try
        {
            // Delete avatar file if exists
            if (!string.IsNullOrEmpty(userEntity.ProfileImageUrl))
            {
                var filePath = Path.Combine(_environment.WebRootPath, userEntity.ProfileImageUrl.TrimStart('/'));
                if (File.Exists(filePath))
                    File.Delete(filePath);
            }

            // Update user profile
            userEntity.ProfileImageUrl = null;
            userEntity.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(userEntity);

            return new DeleteAvatarResponseDto
            {
                Success = true,
                Message = "Avatar deleted successfully"
            };
        }
        catch (Exception ex)
        {
            return new DeleteAvatarResponseDto
            {
                Success = false,
                Message = $"Failed to delete avatar: {ex.Message}"
            };
        }
    }

    /// <summary>
    /// Ban user account
    /// </summary>
    public async Task<bool> BanAccountAsync(int userId, BanAccountDto dto)
    {
        // Validate user exists
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException("User not found");

        var userEntity = (UserEntity)user;

        // Set IsActive to false (banned)
        userEntity.IsActive = false;
        userEntity.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(userEntity);
        return true;
    }

    /// <summary>
    /// Unban user account
    /// </summary>
    public async Task<bool> UnbanAccountAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException("User not found");

        var userEntity = (UserEntity)user;

        // Set IsActive to true (active)
        userEntity.IsActive = true;
        userEntity.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(userEntity);
        return true;
    }

    /// <summary>
    /// Check if account is currently banned
    /// </summary>
    public async Task<bool> IsAccountBannedAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return false;

        var userEntity = (UserEntity)user;
        return !userEntity.IsActive;
    }

    /// <summary>
    /// Get ban information for user
    /// </summary>
    public async Task<BanInfoDto?> GetBanInfoAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return null;

        var userEntity = (UserEntity)user;

        return new BanInfoDto
        {
            UserId = userId,
            IsBanned = !userEntity.IsActive
        };
    }
    private UserDto MapToDto(User user)
    {
        return new UserDto
        {
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            Phone = user.Phone,
            Address = user.Address,
            ProfileImageUrl = user.ProfileImageUrl,
            ExperienceLevel = user.ExperienceLevel,
            PreferredLanguage = user.PreferredLanguage,
            IsActive = user.IsActive,
            LastLoginAt = user.LastLoginAt ?? DateTime.MinValue,
            CreatedAt = user.CreatedAt
        };
    }

    private ProfileViewDto MapToProfileViewDto(User user)
    {
        return new ProfileViewDto
        {
            UserId = user.UserId,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            ProfileImageUrl = user.ProfileImageUrl,
            ExperienceLevel = user.ExperienceLevel,
            PreferredLanguage = user.PreferredLanguage,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }

    private byte[] HashPassword(string password)
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        return sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
    }

    private bool IsValidPhoneNumber(string phone)
    {
        // Basic phone validation: 10-20 digits and common separators
        var phonePattern = @"^\+?[1-9]\d{1,14}$|^[0-9\s\-\(\)\+]{10,20}$";
        return Regex.IsMatch(phone, phonePattern);
    }

    private bool IsValidJson(string json)
    {
        try
        {
            System.Text.Json.JsonDocument.Parse(json);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private string GetExtensionFromMimeType(string mimeType)
    {
        return mimeType switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => ".jpg"
        };
    }

    #endregion
}
