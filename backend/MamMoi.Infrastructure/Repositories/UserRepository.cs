using Microsoft.EntityFrameworkCore;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;

namespace MamMoi.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly MamMoiDbContext _context;

    public UserRepository(MamMoiDbContext context)
    {
        _context = context;
    }

    public async Task<dynamic?> GetByIdAsync(int userId)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId);
    }

    public async Task<dynamic?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<IEnumerable<dynamic>> GetAllAsync()
    {
        var users = await _context.Users.Include(u => u.Role).ToListAsync();
        return users.Cast<dynamic>();
    }

    public async Task<dynamic> AddAsync(dynamic user)
    {
        var userEntity = (User)user;
        await _context.Users.AddAsync(userEntity);
        await _context.SaveChangesAsync();
        return userEntity;
    }

    public async Task UpdateAsync(dynamic user)
    {
        var userEntity = (User)user;
        _context.Users.Update(userEntity);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(string email)
    {
        return await _context.Users.AnyAsync(u => u.Email == email);
    }
}