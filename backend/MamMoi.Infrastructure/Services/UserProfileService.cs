using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;

namespace MamMoi.Infrastructure.Services;

/// <summary>
/// Service for user profile operations
/// </summary>
public class UserProfileService : IUserProfileService
{
    private readonly IUserRepository _userRepository;
    private readonly CapstoneDb01Context _context;
    private readonly string _uploadPath;
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".bmp" };

    public UserProfileService(IUserRepository userRepository, CapstoneDb01Context context, IWebHostEnvironment environment)
    {
        _userRepository = userRepository;
        _context = context;

        // Get the web root path, fallback to ContentRootPath/wwwroot if WebRootPath is null
        var webRootPath = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        _uploadPath = Path.Combine(webRootPath, "uploads", "avatars");

        // Create upload directory if it doesn't exist
        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
        }
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null)
            return null;

        return MapToProfileDto(user);
    }

    public async Task<UserProfileDto?> UpdateUserProfileAsync(int userId, EditUserProfileDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null)
            return null;

        // Check if email is being changed and already exists for another user
        if (user.Email != dto.Email && await _context.Users.AnyAsync(u => u.Email == dto.Email && u.UserId != userId))
        {
            throw new InvalidOperationException("Email already exists");
        }

        // Update user properties
        user.FullName = dto.FullName;
        user.Email = dto.Email;
        user.Phone = dto.Phone;
        user.Address = dto.Address;
        user.ExperienceLevel = dto.ExperienceLevel;
        user.PreferredLanguage = dto.PreferredLanguage;
        user.NotificationPreferences = dto.NotificationPreferences;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToProfileDto(user);
    }

    public async Task<AvatarUploadResponseDto> UploadAvatarAsync(int userId, IFormFile imageFile, int cropX, int cropY, int cropWidth, int cropHeight)
    {
        // Validate file
        if (imageFile == null || imageFile.Length == 0)
        {
            return new AvatarUploadResponseDto
            {
                Success = false,
                Message = "No file uploaded"
            };
        }

        // Check file size (5MB max)
        if (imageFile.Length > MaxFileSize)
        {
            return new AvatarUploadResponseDto
            {
                Success = false,
                Message = $"File size exceeds maximum allowed size of {MaxFileSize / (1024 * 1024)}MB"
            };
        }

        // Check file extension
        var extension = Path.GetExtension(imageFile.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return new AvatarUploadResponseDto
            {
                Success = false,
                Message = $"Invalid file type. Allowed types: {string.Join(", ", AllowedExtensions)}"
            };
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return new AvatarUploadResponseDto
            {
                Success = false,
                Message = "User not found"
            };
        }

        try
        {
            // Delete old avatar if exists
            if (!string.IsNullOrEmpty(user.ProfileImageUrl))
            {
                await DeleteAvatarAsync(userId);
            }

            // Generate unique filename
            var fileName = $"{userId}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(_uploadPath, fileName);

            // Process and crop image
            using (var image = await Image.LoadAsync(imageFile.OpenReadStream()))
            {
                // Convert percentage-based crop values to pixel values
                int pixelX = (int)(image.Width * cropX / 100.0);
                int pixelY = (int)(image.Height * cropY / 100.0);
                int pixelWidth = (int)(image.Width * cropWidth / 100.0);
                int pixelHeight = (int)(image.Height * cropHeight / 100.0);

                // Ensure crop dimensions are within image bounds
                pixelX = Math.Max(0, Math.Min(pixelX, image.Width - 1));
                pixelY = Math.Max(0, Math.Min(pixelY, image.Height - 1));
                pixelWidth = Math.Min(pixelWidth, image.Width - pixelX);
                pixelHeight = Math.Min(pixelHeight, image.Height - pixelY);

                // Apply crop
                image.Mutate(x => x.Crop(new Rectangle(pixelX, pixelY, pixelWidth, pixelHeight)));

                // Resize to standard avatar size (e.g., 400x400)
                image.Mutate(x => x.Resize(400, 400));

                // Save as JPEG with quality 85
                await image.SaveAsJpegAsync(filePath, new JpegEncoder { Quality = 85 });
            }

            // Update user profile image URL
            user.ProfileImageUrl = $"/uploads/avatars/{fileName}";
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return new AvatarUploadResponseDto
            {
                Success = true,
                ImageUrl = user.ProfileImageUrl,
                Message = "Avatar uploaded successfully"
            };
        }
        catch (Exception ex)
        {
            return new AvatarUploadResponseDto
            {
                Success = false,
                Message = $"Error uploading avatar: {ex.Message}"
            };
        }
    }

    public async Task<bool> DeleteAvatarAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || string.IsNullOrEmpty(user.ProfileImageUrl))
            return false;

        try
        {
            // Extract filename from URL
            var fileName = Path.GetFileName(user.ProfileImageUrl);
            var filePath = Path.Combine(_uploadPath, fileName);

            // Delete physical file if exists
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            // Update user record
            user.ProfileImageUrl = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }
        catch
        {
            return false;
        }
    }

    private UserProfileDto MapToProfileDto(User user)
    {
        return new UserProfileDto
        {
            UserId = user.UserId,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            ProfileImageUrl = user.ProfileImageUrl,
            ExperienceLevel = user.ExperienceLevel,
            PreferredLanguage = user.PreferredLanguage,
            NotificationPreferences = user.NotificationPreferences,
            IsActive = user.IsActive,
            LastLoginAt = user.LastLoginAt,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            RoleName = user.Role?.RoleName ?? "Unknown"
        };
    }

    /// <summary>
    /// Get the last login timestamp for a user
    /// Lấy thời gian đăng nhập gần nhất từ bảng User (LastLoginAt)
    /// </summary>
    public async Task<DateTime?> GetLastLoginAsync(int userId)
    {
        var user = await _context.Users
            .Where(u => u.UserId == userId)
            .Select(u => u.LastLoginAt)
            .FirstOrDefaultAsync();

        return user;
    }
}
