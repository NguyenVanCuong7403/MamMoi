using MamMoi.Data;
using MamMoi.Interfaces;
using MamMoi.Models;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context) { }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }
    }
}
