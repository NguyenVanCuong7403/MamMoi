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
    Task<object> CreateAsync(object dto);
    Task<object?> UpdateAsync(Guid id, object dto);
    Task<bool> DeleteAsync(Guid id);
    Task<object?> GetByEmailAsync(string email);
    Task<IEnumerable<object>> GetAllAsync();
    Task<bool> BanUserAsync(int userId);
    Task<bool> UnbanUserAsync(int userId);
}
