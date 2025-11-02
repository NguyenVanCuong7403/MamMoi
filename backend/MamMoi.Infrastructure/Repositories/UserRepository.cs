using Microsoft.EntityFrameworkCore;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;

namespace MamMoi.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly CapstoneDbContext _context;

    public UserRepository(CapstoneDbContext context)
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
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<IEnumerable<dynamic>> GetAllAsync(string? searchName, string? email, int? roleId)
    {
        var query = _context.Users
            .Include(u => u.Role)
            .AsQueryable();
        if (!string.IsNullOrWhiteSpace(searchName))
        {
            var searchTerm = searchName.Trim().ToLower();
            query = query.Where(u => u.FullName.ToLower().Contains(searchTerm));
        }

        if (!string.IsNullOrWhiteSpace(email))
        {
            var searchEmail = email.Trim().ToLower();
            query = query.Where(u => u.Email.ToLower().Contains(searchEmail));
        }

        if (roleId.HasValue && roleId.Value > 0)
        {
            query = query.Where(u => u.RoleId == roleId.Value);
        }
        var users = await query
            .AsNoTracking()
            .ToListAsync();

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