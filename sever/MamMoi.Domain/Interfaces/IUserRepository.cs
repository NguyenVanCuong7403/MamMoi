namespace MamMoi.Domain.Interfaces;

public interface IUserRepository
{
    Task<dynamic?> GetByIdAsync(int userId);
    Task<dynamic?> GetByEmailAsync(string email);
    Task<IEnumerable<dynamic>> GetAllAsync();
    Task<dynamic> AddAsync(dynamic user);
    Task UpdateAsync(dynamic user);
    Task DeleteAsync(int userId);
    Task<bool> ExistsAsync(string email);
}