using MamMoi.Application.DTOs.BusinessAdmin;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.Services.BusinessAdmin
{
    public class TreeVarietyService : ITreeVarietyService
    {
        private readonly MamMoiDbContext _context;

        public TreeVarietyService(MamMoiDbContext context)
        {
            _context = context;
        }

        // CREATE
        public async Task<TreeVarietyDto> CreateTreeVarietyAsync(TreeVarietyCreateUpdateDto dto)
        {
            var treeVariety = MapFromDto(new TreeVariety(), dto);

            _context.TreeVarieties.Add(treeVariety);
            await _context.SaveChangesAsync();

            return (await GetTreeVarietyByIdAsync(treeVariety.VarietyId))!;
        }

        // READ (Get All)
        public async Task<IEnumerable<TreeVarietyDto>> GetAllTreeVarietiesAsync()
        {
            var treeVarieties = await _context.TreeVarieties
                .Include(tv => tv.TreeType)
                .AsNoTracking()
                .ToListAsync();

            return treeVarieties.Select(tv => MapToDto(tv));
        }

        // READ (Get By Id)
        public async Task<TreeVarietyDto?> GetTreeVarietyByIdAsync(int varietyId)
        {
            var treeVariety = await _context.TreeVarieties
                .Include(tv => tv.TreeType)
                .AsNoTracking()
                .FirstOrDefaultAsync(tv => tv.VarietyId == varietyId);

            return treeVariety == null ? null : MapToDto(treeVariety);
        }

        // UPDATE
        public async Task<bool> UpdateTreeVarietyAsync(int varietyId, TreeVarietyCreateUpdateDto dto)
        {
            var treeVariety = await _context.TreeVarieties.FindAsync(varietyId);
            if (treeVariety == null) return false;

            MapFromDto(treeVariety, dto);
            await _context.SaveChangesAsync();
            return true;
        }

        // DELETE (Soft Delete - chưa implement, cần thêm IsActive field)
        public async Task<bool> DeleteTreeVarietyAsync(int varietyId)
        {
            var treeVariety = await _context.TreeVarieties.FindAsync(varietyId);
            if (treeVariety == null) return false;

            _context.TreeVarieties.Remove(treeVariety);
            await _context.SaveChangesAsync();
            return true;
        }

        // READ (Get By TreeType)
        public async Task<IEnumerable<TreeVarietyDto>> GetTreeVarietiesByTreeTypeAsync(int treeTypeId)
        {
            var treeVarieties = await _context.TreeVarieties
                .Include(tv => tv.TreeType)
                .Where(tv => tv.TreeTypeId == treeTypeId)
                .AsNoTracking()
                .ToListAsync();

            return treeVarieties.Select(tv => MapToDto(tv));
        }

        // Helper methods
        private TreeVarietyDto MapToDto(TreeVariety tv)
        {
            return new TreeVarietyDto
            {
                VarietyId = tv.VarietyId,
                TreeTypeId = tv.TreeTypeId,
                TreeTypeName = tv.TreeType?.TreeTypeName,
                VarietyName = tv.VarietyName,
                VarietyDescription = tv.VarietyDescription
            };
        }

        private TreeVariety MapFromDto(TreeVariety treeVariety, TreeVarietyCreateUpdateDto dto)
        {
            treeVariety.TreeTypeId = dto.TreeTypeId;
            treeVariety.VarietyName = dto.VarietyName;
            treeVariety.VarietyDescription = dto.VarietyDescription;
            return treeVariety;
        }
    }
}