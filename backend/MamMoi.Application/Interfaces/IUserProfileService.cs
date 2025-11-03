using Microsoft.AspNetCore.Http;
using MamMoi.Application.DTOs;

namespace MamMoi.Application.Interfaces;

/// <summary>
/// Service interface for user profile operations
/// </summary>
public interface IUserProfileService
{
    /// <summary>
    /// Get user profile by user ID
    /// </summary>
    Task<UserProfileDto?> GetUserProfileAsync(int userId);

    /// <summary>
    /// Update user profile
    /// </summary>
    Task<UserProfileDto?> UpdateUserProfileAsync(int userId, EditUserProfileDto dto);

    /// <summary>
    /// Upload and crop user profile avatar
    /// </summary>
    Task<AvatarUploadResponseDto> UploadAvatarAsync(int userId, IFormFile imageFile, int cropX, int cropY, int cropWidth, int cropHeight);

    /// <summary>
    /// Delete user avatar
    /// </summary>
    Task<bool> DeleteAvatarAsync(int userId);

    /// <summary>
    /// Get the last login timestamp for a user
    /// Lấy thời gian đăng nhập gần nhất từ bảng User
    /// </summary>
    Task<DateTime?> GetLastLoginAsync(int userId);
}
