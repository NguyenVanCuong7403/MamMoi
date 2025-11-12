using Microsoft.EntityFrameworkCore;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;

namespace MamMoi.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Garden data access.
/// Handles all database operations related to gardens.
/// </summary>
public class GardenRepository : IGardenRepository
{
    private readonly CapstoneDb01Context _context;

    public GardenRepository(CapstoneDb01Context context)
    {
        _context = context;
    }

    /// <summary>
    /// Create a new garden in the database
    /// </summary>
    public async Task<dynamic> CreateAsync(dynamic garden)
    {
        var gardenEntity = (Garden)garden;
        await _context.Gardens.AddAsync(gardenEntity);
        await _context.SaveChangesAsync();
        
        // Load related data after creation
        await _context.Entry(gardenEntity)
            .Reference(g => g.User)
            .LoadAsync();
        
        return gardenEntity;
    }

    /// <summary>
    /// Get garden by ID with all related data
    /// </summary>
    public async Task<dynamic?> GetByIdAsync(int gardenId)
    {
        return await _context.Gardens
            .Include(g => g.User)
            .Include(g => g.Trees)
            .Include(g => g.GardenMembers)
                .ThenInclude(gm => gm.User)
            .FirstOrDefaultAsync(g => g.GardenId == gardenId);
    }

    /// <summary>
    /// Get paginated gardens for a user (owner or member) with optional search
    /// </summary>
    public async Task<(List<dynamic> gardens, int totalCount)> GetGardensByUserIdAsync(
        int userId, 
        int pageNumber, 
        int pageSize, 
        string? searchTerm)
    {
        // Build query: gardens where user is owner OR member
        var query = _context.Gardens
            .Include(g => g.User)
            .Include(g => g.Trees)
            .Where(g => g.UserId == userId || 
                       g.GardenMembers.Any(gm => gm.UserId == userId));

        // Apply search filter if provided
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(g => g.Name.Contains(searchTerm));
        }

        // Get total count for pagination
        var totalCount = await query.CountAsync();

        // Apply pagination and order by creation date (newest first)
        var gardens = await query
            .OrderByDescending(g => g.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (gardens.Cast<dynamic>().ToList(), totalCount);
    }

    /// <summary>
    /// Update an existing garden
    /// </summary>
    public async Task UpdateAsync(dynamic garden)
    {
        var gardenEntity = (Garden)garden;
        _context.Gardens.Update(gardenEntity);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Check if user is the owner of the garden
    /// </summary>
    public async Task<bool> IsOwnerAsync(int gardenId, int userId)
    {
        return await _context.Gardens
            .AnyAsync(g => g.GardenId == gardenId && g.UserId == userId);
    }

    /// <summary>
    /// Check if user has access to the garden (owner or member)
    /// </summary>
    public async Task<bool> HasAccessAsync(int gardenId, int userId)
    {
        return await _context.Gardens
            .AnyAsync(g => g.GardenId == gardenId && 
                          (g.UserId == userId || 
                           g.GardenMembers.Any(gm => gm.UserId == userId)));
    }
}
