using MamMoi.Application.DTOs;
using System;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces;

/// <summary>
/// Service interface for user-related application operations.
/// Keep this minimal — implementations live in Infrastructure.
/// </summary>
public interface IUserService
{
    Task<object?> GetByIdAsync(Guid id);
    Task<UserDto> CreateAsync(CreateUserDto createDto);
    Task<UserDetailDto?> UpdateAsync(Guid id, AdminUpdateUserDto updateDto);
    Task<bool> DeleteAsync(Guid id);
    Task<object?> GetByEmailAsync(string email);
    Task<IEnumerable<UserDto>> GetAllAsync(string? searchName, string? email, int? roleId);
    Task<bool> ResetPasswordAsync(Guid id, AdminResetPasswordDto dto);
}
