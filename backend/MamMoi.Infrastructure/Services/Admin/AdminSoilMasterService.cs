using MamMoi.Application.DTOs.Admin;
using MamMoi.Application.Interfaces.Admin;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MamMoi.Infrastructure.Services.Admin;

/// <summary>
/// Service for admin soil master management
/// </summary>
public class AdminSoilMasterService : IAdminSoilMasterService
{
    private readonly MamMoiDbContext _dbContext;
    private readonly ILogger<AdminSoilMasterService> _logger;

    public AdminSoilMasterService(
        MamMoiDbContext dbContext,
        ILogger<AdminSoilMasterService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<(List<SoilMasterListItemDto> soilMasters, int totalCount)> GetAllSoilMastersAsync(
        int page = 1,
        int pageSize = 20,
        string? searchTerm = null)
    {
        var query = _dbContext.SoilMasters.AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(s =>
                s.SoilName.Contains(searchTerm) ||
                (s.Texture != null && s.Texture.Contains(searchTerm)) ||
                (s.Drainage != null && s.Drainage.Contains(searchTerm)) ||
                (s.Notes != null && s.Notes.Contains(searchTerm)));
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Get paginated results
        var soilMasters = await query
            .OrderBy(s => s.SoilName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new SoilMasterListItemDto
            {
                SoilMasterId = s.SoilMasterId,
                SoilName = s.SoilName,
                Texture = s.Texture,
                Drainage = s.Drainage,
                TreeTypesCount = s.TreeTypes.Count,
                GardenSoilsCount = s.GardenSoils.Count
            })
            .ToListAsync();

        return (soilMasters, totalCount);
    }

    public async Task<SoilMasterDetailDto?> GetSoilMasterByIdAsync(int soilMasterId)
    {
        var soilMaster = await _dbContext.SoilMasters
            .FirstOrDefaultAsync(s => s.SoilMasterId == soilMasterId);

        if (soilMaster == null)
            return null;

        return new SoilMasterDetailDto
        {
            SoilMasterId = soilMaster.SoilMasterId,
            SoilName = soilMaster.SoilName,
            Texture = soilMaster.Texture,
            Drainage = soilMaster.Drainage,
            OrganicMatterPct = soilMaster.OrganicMatterPct,
            EcDSM = soilMaster.EcDSM,
            Notes = soilMaster.Notes,
            CreatedAt = soilMaster.CreatedAt,
            UpdatedAt = soilMaster.UpdatedAt,
            TreeTypesCount = await _dbContext.TreeTypes.CountAsync(t => t.SoilMasterId == soilMasterId),
            GardenSoilsCount = await _dbContext.GardenSoils.CountAsync(g => g.SoilMasterId == soilMasterId)
        };
    }

    public async Task<SoilMasterDetailDto> CreateSoilMasterAsync(CreateSoilMasterDto dto)
    {
        // Check if SoilName already exists (unique constraint)
        var nameExists = await _dbContext.SoilMasters
            .AnyAsync(s => s.SoilName == dto.SoilName);
        if (nameExists)
            throw new InvalidOperationException("SoilMaster name already exists");

        var soilMaster = new SoilMaster
        {
            SoilName = dto.SoilName,
            Texture = dto.Texture,
            Drainage = dto.Drainage,
            OrganicMatterPct = dto.OrganicMatterPct,
            EcDSM = dto.EcDSM,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.SoilMasters.Add(soilMaster);
        await _dbContext.SaveChangesAsync();

        return await GetSoilMasterByIdAsync(soilMaster.SoilMasterId) ?? throw new Exception("Failed to create soil master");
    }

    public async Task<SoilMasterDetailDto?> UpdateSoilMasterAsync(int soilMasterId, UpdateSoilMasterDto dto)
    {
        var soilMaster = await _dbContext.SoilMasters.FindAsync(soilMasterId);
        if (soilMaster == null)
            return null;

        // Update fields if provided
        if (!string.IsNullOrWhiteSpace(dto.SoilName))
        {
            var nameExists = await _dbContext.SoilMasters
                .AnyAsync(s => s.SoilName == dto.SoilName && s.SoilMasterId != soilMasterId);
            if (nameExists)
                throw new InvalidOperationException("SoilMaster name already exists");
            soilMaster.SoilName = dto.SoilName;
        }

        if (dto.Texture != null)
            soilMaster.Texture = dto.Texture;

        if (dto.Drainage != null)
            soilMaster.Drainage = dto.Drainage;

        if (dto.OrganicMatterPct.HasValue)
            soilMaster.OrganicMatterPct = dto.OrganicMatterPct;

        if (dto.EcDSM.HasValue)
            soilMaster.EcDSM = dto.EcDSM;

        if (dto.Notes != null)
            soilMaster.Notes = dto.Notes;

        soilMaster.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return await GetSoilMasterByIdAsync(soilMasterId);
    }

    public async Task<bool> DeleteSoilMasterAsync(int soilMasterId)
    {
        var soilMaster = await _dbContext.SoilMasters.FindAsync(soilMasterId);
        if (soilMaster == null)
            return false;

        // Check if soil master is used by any tree types
        var isUsedByTreeTypes = await _dbContext.TreeTypes.AnyAsync(t => t.SoilMasterId == soilMasterId);
        if (isUsedByTreeTypes)
            throw new InvalidOperationException("Cannot delete soil master that is used by tree types");

        // Check if soil master is used by any garden soils
        var isUsedByGardenSoils = await _dbContext.GardenSoils.AnyAsync(g => g.SoilMasterId == soilMasterId);
        if (isUsedByGardenSoils)
            throw new InvalidOperationException("Cannot delete soil master that is used by garden soils");

        _dbContext.SoilMasters.Remove(soilMaster);
        await _dbContext.SaveChangesAsync();

        return true;
    }
}

