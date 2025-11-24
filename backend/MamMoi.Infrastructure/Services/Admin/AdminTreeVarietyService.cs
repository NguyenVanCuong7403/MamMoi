using MamMoi.Application.DTOs.Admin;
using MamMoi.Application.Interfaces.Admin;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MamMoi.Infrastructure.Services.Admin;

/// <summary>
/// Service for admin tree variety management
/// </summary>
public class AdminTreeVarietyService : IAdminTreeVarietyService
{
    private readonly MamMoiDbContext _dbContext;
    private readonly ILogger<AdminTreeVarietyService> _logger;

    public AdminTreeVarietyService(
        MamMoiDbContext dbContext,
        ILogger<AdminTreeVarietyService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<(List<TreeVarietyListItemDto> varieties, int totalCount)> GetAllTreeVarietiesAsync(
        int page = 1,
        int pageSize = 20,
        string? searchTerm = null,
        int? treeTypeId = null)
    {
        var query = _dbContext.TreeVarietys
            .Include(v => v.TreeType)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(v =>
                (v.VarietyName != null && v.VarietyName.Contains(searchTerm)) ||
                (v.VarietyDescription != null && v.VarietyDescription.Contains(searchTerm)));
        }

        if (treeTypeId.HasValue)
        {
            query = query.Where(v => v.TreeTypeId == treeTypeId.Value);
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Get paginated results
        var varieties = await query
            .OrderBy(v => v.VarietyName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(v => new TreeVarietyListItemDto
            {
                VarietyId = v.VarietyId,
                TreeTypeId = v.TreeTypeId,
                TreeTypeName = v.TreeType.TreeTypeName,
                VarietyName = v.VarietyName,
                TreesCount = v.Trees.Count
            })
            .ToListAsync();

        return (varieties, totalCount);
    }

    public async Task<TreeVarietyDetailDto?> GetTreeVarietyByIdAsync(int varietyId)
    {
        var variety = await _dbContext.TreeVarietys
            .Include(v => v.TreeType)
            .FirstOrDefaultAsync(v => v.VarietyId == varietyId);

        if (variety == null)
            return null;

        return new TreeVarietyDetailDto
        {
            VarietyId = variety.VarietyId,
            TreeTypeId = variety.TreeTypeId,
            TreeTypeName = variety.TreeType.TreeTypeName,
            VarietyName = variety.VarietyName,
            VarietyDescription = variety.VarietyDescription,
            ImageUrl = variety.ImageUrl,
            TreesCount = await _dbContext.Trees.CountAsync(t => t.VarietyId == varietyId)
        };
    }

    public async Task<List<TreeVarietyListItemDto>> GetVarietiesByTreeTypeIdAsync(int treeTypeId)
    {
        return await _dbContext.TreeVarietys
            .Include(v => v.TreeType)
            .Where(v => v.TreeTypeId == treeTypeId)
            .OrderBy(v => v.VarietyName)
            .Select(v => new TreeVarietyListItemDto
            {
                VarietyId = v.VarietyId,
                TreeTypeId = v.TreeTypeId,
                TreeTypeName = v.TreeType.TreeTypeName,
                VarietyName = v.VarietyName,
                TreesCount = v.Trees.Count
            })
            .ToListAsync();
    }

    public async Task<TreeVarietyDetailDto> CreateTreeVarietyAsync(CreateTreeVarietyDto dto)
    {
        // Validate TreeTypeId
        var treeTypeExists = await _dbContext.TreeTypes.AnyAsync(t => t.TreeTypeId == dto.TreeTypeId);
        if (!treeTypeExists)
            throw new InvalidOperationException("TreeType not found");

        var variety = new TreeVariety
        {
            TreeTypeId = dto.TreeTypeId,
            VarietyName = dto.VarietyName,
            VarietyDescription = dto.VarietyDescription,
            ImageUrl = dto.ImageUrl
        };

        _dbContext.TreeVarietys.Add(variety);
        await _dbContext.SaveChangesAsync();

        return await GetTreeVarietyByIdAsync(variety.VarietyId) ?? throw new Exception("Failed to create tree variety");
    }

    public async Task<TreeVarietyDetailDto?> UpdateTreeVarietyAsync(int varietyId, UpdateTreeVarietyDto dto)
    {
        var variety = await _dbContext.TreeVarietys.FindAsync(varietyId);
        if (variety == null)
            return null;

        // Update fields if provided
        if (dto.TreeTypeId.HasValue)
        {
            var treeTypeExists = await _dbContext.TreeTypes.AnyAsync(t => t.TreeTypeId == dto.TreeTypeId.Value);
            if (!treeTypeExists)
                throw new InvalidOperationException("TreeType not found");
            variety.TreeTypeId = dto.TreeTypeId.Value;
        }

        if (!string.IsNullOrWhiteSpace(dto.VarietyName))
            variety.VarietyName = dto.VarietyName;

        if (dto.VarietyDescription != null)
            variety.VarietyDescription = dto.VarietyDescription;

        if (dto.ImageUrl != null)
            variety.ImageUrl = dto.ImageUrl;

        await _dbContext.SaveChangesAsync();

        return await GetTreeVarietyByIdAsync(varietyId);
    }

    public async Task<bool> DeleteTreeVarietyAsync(int varietyId)
    {
        var variety = await _dbContext.TreeVarietys.FindAsync(varietyId);
        if (variety == null)
            return false;

        // Check if variety is used by any trees
        var isUsed = await _dbContext.Trees.AnyAsync(t => t.VarietyId == varietyId);
        if (isUsed)
            throw new InvalidOperationException("Cannot delete variety that is used by trees");

        _dbContext.TreeVarietys.Remove(variety);
        await _dbContext.SaveChangesAsync();

        return true;
    }
}

