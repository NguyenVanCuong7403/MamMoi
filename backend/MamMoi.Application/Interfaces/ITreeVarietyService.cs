using MamMoi.Application.DTOs;
using MamMoi.Application.DTOs.BusinessAdmin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface ITreeVarietyService
    {
        Task<IReadOnlyList<DTOs.TreeVarietyDto>> GetAllAsync(int? treeTypeId = null, CancellationToken ct = default);
        Task<IEnumerable<DTOs.BusinessAdmin.TreeVarietyDto>> GetAllTreeVarietiesAsync();
        Task<DTOs.BusinessAdmin.TreeVarietyDto?> GetTreeVarietyByIdAsync(int varietyId);
        Task<IEnumerable<DTOs.BusinessAdmin.TreeVarietyDto>> GetTreeVarietiesByTreeTypeAsync(int treeTypeId);
        Task<DTOs.BusinessAdmin.TreeVarietyDto> CreateTreeVarietyAsync(TreeVarietyCreateUpdateDto dto);
        Task<bool> UpdateTreeVarietyAsync(int varietyId, TreeVarietyCreateUpdateDto dto);
        Task<bool> DeleteTreeVarietyAsync(int varietyId);
    }
}
