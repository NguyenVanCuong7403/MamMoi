using MamMoi.Application.DTOs.SystemAdminDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface ITreeTypeService
    {
        Task<IEnumerable<TreeTypeDto>> GetAllTreeTypesAsync();
        Task<TreeTypeDto?> GetTreeTypeByIdAsync(int treeTypeId);
        Task<TreeTypeDto> CreateTreeTypeAsync(TreeTypeCreateUpdateDto dto);
        Task<bool> UpdateTreeTypeAsync(int treeTypeId, TreeTypeCreateUpdateDto dto);
        Task<bool> DeleteTreeTypeAsync(int treeTypeId); // (Soft Delete)
    }
}
