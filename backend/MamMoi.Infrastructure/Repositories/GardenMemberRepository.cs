using Microsoft.EntityFrameworkCore;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;

namespace MamMoi.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for GardenMember data access.
/// </summary>
public class GardenMemberRepository : IGardenMemberRepository
{
    private readonly CapstoneDb01Context _context;

    public GardenMemberRepository(CapstoneDb01Context context)
    {
        _context = context;
    }

    /// <summary>
    /// Add a member to a garden
    /// </summary>
    public async Task<dynamic> AddAsync(dynamic gardenMember)
    {
        var memberEntity = (GardenMember)gardenMember;
        await _context.GardenMembers.AddAsync(memberEntity);
        await _context.SaveChangesAsync();
        return memberEntity;
    }

    /// <summary>
    /// Get all members of a garden
    /// </summary>
    public async Task<List<dynamic>> GetByGardenIdAsync(int gardenId)
    {
        var members = await _context.GardenMembers
            .Include(gm => gm.User)
            .Include(gm => gm.Role)
            .Where(gm => gm.GardenId == gardenId)
            .ToListAsync();
        
        return members.Cast<dynamic>().ToList();
    }

    /// <summary>
    /// Remove a member from a garden
    /// </summary>
    public async Task RemoveAsync(int memberId)
    {
        var member = await _context.GardenMembers.FindAsync(memberId);
        if (member != null)
        {
            _context.GardenMembers.Remove(member);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Get all garden memberships for a user
    /// </summary>
    public async Task<List<dynamic>> GetByUserIdAsync(int userId)
    {
        var memberships = await _context.GardenMembers
            .Include(gm => gm.Garden)
            .Where(gm => gm.UserId == userId)
            .ToListAsync();

        return memberships.Cast<dynamic>().ToList();
    }
}
