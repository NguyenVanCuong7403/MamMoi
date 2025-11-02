using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Security;

namespace MamMoi.Infrastructure.Services;

/// <summary>
/// User service - xử lý business logic cho User
/// </summary>
public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly TokenService _tokenService;

    public UserService(IUserRepository userRepository, TokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<object?> GetByIdAsync(Guid id)
    {
        
        var userId = int.Parse(id.ToString().Split('-')[0], System.Globalization.NumberStyles.HexNumber) % int.MaxValue;
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null)
            return null;

        // Map to DTO để không expose entity trực tiếp
        return MapToDetailDto((User)user);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto createDto)
    {
        if (string.IsNullOrEmpty(createDto.Email))
            throw new ArgumentException("Email là bắt buộc");

        if (await _userRepository.ExistsAsync(createDto.Email))
            throw new InvalidOperationException("Email này đã tồn tại");

        var userEntity = new User
        {
            Email = createDto.Email,
            FullName = createDto.FullName,
            PasswordHash = HashPassword(createDto.Password),
            RoleId = createDto.RoleId, 
            Phone = createDto.Phone,
            Address = createDto.Address,
            ProfileImageUrl = createDto.ProfileImageUrl,
            PreferredLanguage = createDto.PreferredLanguage,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var createdUser = (User)await _userRepository.AddAsync(userEntity);
        var finalUser = (User)await _userRepository.GetByIdAsync(createdUser.UserId); 
        return MapToDto(finalUser);
    }
    public async Task<UserDetailDto?> UpdateAsync(Guid id, AdminUpdateUserDto updateDto)
    {
     
        var userId = int.Parse(id.ToString().Split('-')[0], System.Globalization.NumberStyles.HexNumber) % int.MaxValue;
        var userEntity = (User?)await _userRepository.GetByIdAsync(userId);

        if (userEntity == null)
        {
            return null;
        }

        userEntity.FullName = updateDto.FullName;
        userEntity.Phone = updateDto.Phone;
        userEntity.Address = updateDto.Address;
        userEntity.RoleId = updateDto.RoleId;
        userEntity.IsActive = updateDto.IsActive; 
        userEntity.UpdatedAt = DateTime.UtcNow; 

        await _userRepository.UpdateAsync(userEntity);

        return MapToDetailDto(userEntity);
    }
    public async Task<object?> UpdateAsync(Guid id, object dto)
    {
        if (dto is not UpdateUserDto updateDto)
            throw new ArgumentException("Invalid DTO type");

        var userId = int.Parse(id.ToString().Split('-')[0], System.Globalization.NumberStyles.HexNumber) % int.MaxValue;
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return null;

        var userEntity = (User)user;

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

        var userEntity = (User)user;
        await _userRepository.DeleteAsync(userEntity.UserId);
        return true;
    }

    public async Task<object?> GetByEmailAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
            return null;

        return MapToDto((User)user);
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync(string? searchName, string? email, int? roleId)
    {
        var users = await _userRepository.GetAllAsync(searchName,email,roleId);
        return users.Select(u => MapToDto((User)u));
    }

    // Helper methods
    private UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = new Guid(user.UserId, (short)0, (short)0, new byte[8]), 
            Email = user.Email,
            FullName = user.FullName,
            RoleName = user.Role?.RoleName ?? "N/A",
            CreatedAt = user.CreatedAt
        };
    }
    private UserDetailDto MapToDetailDto(User user)
    {
        return new UserDetailDto
        {
            Id = new Guid(user.UserId, (short)0, (short)0, new byte[8]),
            RoleName = user.Role?.RoleName ?? "N/A",
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
            UpdatedAt = user.UpdatedAt
        };
    }

    public async Task<bool> ResetPasswordAsync(Guid id, AdminResetPasswordDto dto)
    {

        var userId = int.Parse(id.ToString().Split('-')[0], System.Globalization.NumberStyles.HexNumber) % int.MaxValue;
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return false; 
        }

        var userEntity = (User)user;
        userEntity.PasswordHash = HashPassword(dto.NewPassword);
        userEntity.UpdatedAt = DateTime.UtcNow; 

        await _userRepository.UpdateAsync(userEntity);
        return true;
    }
    private byte[] HashPassword(string password)
    {
        
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        return sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
    }

  
}
