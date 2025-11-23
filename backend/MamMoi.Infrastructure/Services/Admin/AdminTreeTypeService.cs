using MamMoi.Application.DTOs.Admin;
using MamMoi.Application.Interfaces;
using MamMoi.Application.Interfaces.Admin;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MamMoi.Infrastructure.Services.Admin;

/// <summary>
/// Service for admin tree type management
/// </summary>
public class AdminTreeTypeService : IAdminTreeTypeService
{
    private readonly MamMoiDbContext _dbContext;
    private readonly ILogger<AdminTreeTypeService> _logger;
    private readonly IImageUploadService _imageUploadService;

    public AdminTreeTypeService(
        MamMoiDbContext dbContext,
        ILogger<AdminTreeTypeService> logger,
        IImageUploadService imageUploadService)
    {
        _dbContext = dbContext;
        _logger = logger;
        _imageUploadService = imageUploadService;
    }

    public async Task<(List<TreeTypeListItemDto> treeTypes, int totalCount)> GetAllTreeTypesAsync(
        int page = 1,
        int pageSize = 20,
        string? searchTerm = null,
        bool? isActive = null)
    {
        var query = _dbContext.TreeTypes
            .Include(t => t.SoilMaster)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(t =>
                t.TreeTypeName.Contains(searchTerm) ||
                t.ScientificName.Contains(searchTerm) ||
                (t.Category != null && t.Category.Contains(searchTerm)));
        }

        if (isActive.HasValue)
        {
            query = query.Where(t => t.IsActive == isActive.Value);
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Get paginated results
        var treeTypes = await query
            .OrderBy(t => t.TreeTypeName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TreeTypeListItemDto
            {
                TreeTypeId = t.TreeTypeId,
                SoilMasterId = t.SoilMasterId,
                SoilMasterName = t.SoilMaster.SoilName,
                TreeTypeName = t.TreeTypeName,
                ScientificName = t.ScientificName,
                Description = t.Description,
                Category = t.Category,
                AverageLifespanYears = t.AverageLifespanYears,
                OptimalTemperatureMin = t.OptimalTemperatureMin,
                OptimalTemperatureMax = t.OptimalTemperatureMax,
                OptimalHumidityMin = t.OptimalHumidityMin,
                OptimalHumidityMax = t.OptimalHumidityMax,
                DroughtTolerance = t.DroughtTolerance,
                FloodTolerance = t.FloodTolerance,
                FrostTolerance = t.FrostTolerance,
                WindTolerance = t.WindTolerance,
                ImageUrl = t.ImageUrl,
                IsActive = t.IsActive,
                VarietiesCount = t.TreeVarieties.Count,
                TreesCount = t.Trees.Count,
                GrowthStagesCount = t.TreeGrowthStages.Count
            })
            .ToListAsync();

        return (treeTypes, totalCount);
    }

    public async Task<TreeTypeDetailDto?> GetTreeTypeByIdAsync(int treeTypeId)
    {
        var treeType = await _dbContext.TreeTypes
            .Include(t => t.SoilMaster)
            .FirstOrDefaultAsync(t => t.TreeTypeId == treeTypeId);

        if (treeType == null)
            return null;

        return new TreeTypeDetailDto
        {
            TreeTypeId = treeType.TreeTypeId,
            SoilMasterId = treeType.SoilMasterId,
            SoilMasterName = treeType.SoilMaster.SoilName,
            TreeTypeName = treeType.TreeTypeName,
            ScientificName = treeType.ScientificName,
            Description = treeType.Description,
            Category = treeType.Category,
            AverageLifespanYears = treeType.AverageLifespanYears,
            OptimalTemperatureMin = treeType.OptimalTemperatureMin,
            OptimalTemperatureMax = treeType.OptimalTemperatureMax,
            OptimalHumidityMin = treeType.OptimalHumidityMin,
            OptimalHumidityMax = treeType.OptimalHumidityMax,
            DroughtTolerance = treeType.DroughtTolerance,
            FloodTolerance = treeType.FloodTolerance,
            FrostTolerance = treeType.FrostTolerance,
            WindTolerance = treeType.WindTolerance,
            ImageUrl = treeType.ImageUrl,
            IsActive = treeType.IsActive,
            VarietiesCount = await _dbContext.TreeVarietys.CountAsync(v => v.TreeTypeId == treeTypeId),
            TreesCount = await _dbContext.Trees.CountAsync(t => t.TreeTypeId == treeTypeId),
            GrowthStagesCount = await _dbContext.TreeGrowthStages.CountAsync(s => s.TreeTypeId == treeTypeId)
        };
    }

    public async Task<TreeTypeDetailDto> CreateTreeTypeAsync(CreateTreeTypeDto dto)
    {
        // Validate SoilMasterId
        var soilMasterExists = await _dbContext.SoilMasters.AnyAsync(s => s.SoilMasterId == dto.SoilMasterId);
        if (!soilMasterExists)
            throw new InvalidOperationException("SoilMaster not found");

        // Check if TreeTypeName already exists
        var nameExists = await _dbContext.TreeTypes
            .AnyAsync(t => t.TreeTypeName == dto.TreeTypeName);
        if (nameExists)
            throw new InvalidOperationException("TreeType name already exists");

        var treeType = new TreeType
        {
            SoilMasterId = dto.SoilMasterId,
            TreeTypeName = dto.TreeTypeName,
            ScientificName = dto.ScientificName,
            Description = dto.Description,
            Category = dto.Category,
            AverageLifespanYears = dto.AverageLifespanYears,
            OptimalTemperatureMin = dto.OptimalTemperatureMin,
            OptimalTemperatureMax = dto.OptimalTemperatureMax,
            OptimalHumidityMin = dto.OptimalHumidityMin,
            OptimalHumidityMax = dto.OptimalHumidityMax,
            DroughtTolerance = dto.DroughtTolerance,
            FloodTolerance = dto.FloodTolerance,
            FrostTolerance = dto.FrostTolerance,
            WindTolerance = dto.WindTolerance,
            ImageUrl = dto.ImageUrl,
            IsActive = dto.IsActive
        };

        _dbContext.TreeTypes.Add(treeType);
        await _dbContext.SaveChangesAsync();

        return await GetTreeTypeByIdAsync(treeType.TreeTypeId) ?? throw new Exception("Failed to create tree type");
    }

    public async Task<TreeTypeDetailDto?> UpdateTreeTypeAsync(int treeTypeId, UpdateTreeTypeDto dto)
    {
        var treeType = await _dbContext.TreeTypes.FindAsync(treeTypeId);
        if (treeType == null)
            return null;

        // Update fields if provided
        if (dto.SoilMasterId.HasValue)
        {
            var soilMasterExists = await _dbContext.SoilMasters.AnyAsync(s => s.SoilMasterId == dto.SoilMasterId.Value);
            if (!soilMasterExists)
                throw new InvalidOperationException("SoilMaster not found");
            treeType.SoilMasterId = dto.SoilMasterId.Value;
        }

        if (!string.IsNullOrWhiteSpace(dto.TreeTypeName))
        {
            var nameExists = await _dbContext.TreeTypes
                .AnyAsync(t => t.TreeTypeName == dto.TreeTypeName && t.TreeTypeId != treeTypeId);
            if (nameExists)
                throw new InvalidOperationException("TreeType name already exists");
            treeType.TreeTypeName = dto.TreeTypeName;
        }

        if (!string.IsNullOrWhiteSpace(dto.ScientificName))
            treeType.ScientificName = dto.ScientificName;

        if (dto.Description != null)
            treeType.Description = dto.Description;

        if (dto.Category != null)
            treeType.Category = dto.Category;

        if (dto.AverageLifespanYears.HasValue)
            treeType.AverageLifespanYears = dto.AverageLifespanYears;

        if (dto.OptimalTemperatureMin.HasValue)
            treeType.OptimalTemperatureMin = dto.OptimalTemperatureMin;

        if (dto.OptimalTemperatureMax.HasValue)
            treeType.OptimalTemperatureMax = dto.OptimalTemperatureMax;

        if (dto.OptimalHumidityMin.HasValue)
            treeType.OptimalHumidityMin = dto.OptimalHumidityMin;

        if (dto.OptimalHumidityMax.HasValue)
            treeType.OptimalHumidityMax = dto.OptimalHumidityMax;

        if (dto.DroughtTolerance != null)
            treeType.DroughtTolerance = dto.DroughtTolerance;

        if (dto.FloodTolerance != null)
            treeType.FloodTolerance = dto.FloodTolerance;

        if (dto.FrostTolerance != null)
            treeType.FrostTolerance = dto.FrostTolerance;

        if (dto.WindTolerance != null)
            treeType.WindTolerance = dto.WindTolerance;

        // Handle ImageUrl update - allow setting to null/empty to remove image
        if (dto.ImageUrl != null)
        {
            var newImageUrl = string.IsNullOrWhiteSpace(dto.ImageUrl) ? null : dto.ImageUrl;
            
            // Delete old image if exists and is being changed or removed
            if (!string.IsNullOrEmpty(treeType.ImageUrl) && treeType.ImageUrl != newImageUrl)
            {
                await _imageUploadService.DeleteImageAsync(treeType.ImageUrl);
            }
            
            treeType.ImageUrl = newImageUrl;
        }

        if (dto.IsActive.HasValue)
            treeType.IsActive = dto.IsActive.Value;

        await _dbContext.SaveChangesAsync();

        return await GetTreeTypeByIdAsync(treeTypeId);
    }

    public async Task<bool> DeleteTreeTypeAsync(int treeTypeId)
    {
        var treeType = await _dbContext.TreeTypes.FindAsync(treeTypeId);
        if (treeType == null)
            return false;

        // Delete image file if exists
        if (!string.IsNullOrEmpty(treeType.ImageUrl))
        {
            await _imageUploadService.DeleteImageAsync(treeType.ImageUrl);
        }

        // Soft delete by setting IsActive = false
        treeType.IsActive = false;
        await _dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ActivateTreeTypeAsync(int treeTypeId)
    {
        var treeType = await _dbContext.TreeTypes.FindAsync(treeTypeId);
        if (treeType == null)
            return false;

        treeType.IsActive = true;
        await _dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeactivateTreeTypeAsync(int treeTypeId)
    {
        return await DeleteTreeTypeAsync(treeTypeId);
    }
}

