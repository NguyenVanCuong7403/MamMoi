using MamMoi.Application.DTOs.BusinessAdmin;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface ITreeVarietyService
    {
        // CREATE
        Task<TreeVarietyDto> CreateTreeVarietyAsync(TreeVarietyCreateUpdateDto dto);

        // READ (Get All)
        Task<IEnumerable<TreeVarietyDto>> GetAllTreeVarietiesAsync();

        // READ (Get By Id)
        Task<TreeVarietyDto?> GetTreeVarietyByIdAsync(int varietyId);

        // UPDATE
        Task<bool> UpdateTreeVarietyAsync(int varietyId, TreeVarietyCreateUpdateDto dto);

        // DELETE (Soft Delete)
        Task<bool> DeleteTreeVarietyAsync(int varietyId);

        // READ (Get By TreeType)
        Task<IEnumerable<TreeVarietyDto>> GetTreeVarietiesByTreeTypeAsync(int treeTypeId);
    }
}