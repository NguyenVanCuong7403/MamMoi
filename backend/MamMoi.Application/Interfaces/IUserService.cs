using System;
using System.Threading.Tasks;
using MamMoi.Application.DTOs;

namespace MamMoi.Application.Interfaces;

/// <summary>
/// Service interface for user-related application operations.
/// Keep this minimal — implementations live in Infrastructure.
/// </summary>
public interface IUserService
{
    Task<object?> GetByIdAsync(Guid id);
    Task<object> CreateAsync(object dto);
    Task<object?> UpdateAsync(Guid id, object dto);
    Task<bool> DeleteAsync(Guid id);
    Task<object?> GetByEmailAsync(string email);
    Task<IEnumerable<object>> GetAllAsync();

    // User Profile Operations
    /// <summary>Get user profile details</summary>
    Task<ProfileViewDto?> GetProfileAsync(int userId);

    /// <summary>Edit user profile with validation</summary>
    Task<ProfileViewDto?> EditProfileAsync(int userId, EditProfileDto dto);

    /// <summary>Upload/Update user avatar</summary>
    Task<AvatarUploadResponseDto> UploadAvatarAsync(int userId, byte[] imageData, string mimeType, string baseUrl);

    /// <summary>Delete user avatar</summary>
    Task<DeleteAvatarResponseDto> DeleteAvatarAsync(int userId);

    /// <summary>Ban user account</summary>
    Task<bool> BanAccountAsync(int userId, BanAccountDto dto);

    /// <summary>Unban user account</summary>
    Task<bool> UnbanAccountAsync(int userId);

    /// <summary>Check if account is banned</summary>
    Task<bool> IsAccountBannedAsync(int userId);

    /// <summary>Get ban information for user</summary>
    Task<BanInfoDto?> GetBanInfoAsync(int userId);
}

/// <summary>
/// DTO for ban information
/// </summary>
public class BanInfoDto
{
    public int UserId { get; set; }
    /// <summary>Account is banned (true = banned, false = active)</summary>
    public bool IsBanned { get; set; }
}
