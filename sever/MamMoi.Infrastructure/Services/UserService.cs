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
        // User.UserId is int, convert from Guid
        // Note: Adjust this if your UserId should be Guid
        var userId = int.Parse(id.ToString().Split('-')[0], System.Globalization.NumberStyles.HexNumber) % int.MaxValue;
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user == null)
            return null;

        // Map to DTO để không expose entity trực tiếp
        return MapToDto((User)user);
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

        // Save
        var createdUser = await _userRepository.AddAsync(user);
        
        return MapToDto((User)createdUser);
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

        // Update fields
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

        return MapToDto((User)user);
    }

    public async Task<IEnumerable<object>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(u => MapToDto((User)u));
    }

    // Helper methods
    private UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = Guid.NewGuid(), // Generate new Guid or map from UserId
            Email = user.Email,
            FullName = user.FullName,
            CreatedAt = user.CreatedAt
        };
    }

    private byte[] HashPassword(string password)
    {
        
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        return sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
    }
}
