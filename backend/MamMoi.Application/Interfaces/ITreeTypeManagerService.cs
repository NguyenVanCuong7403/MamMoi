using MamMoi.Application.DTOs.SystemAdmin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface ITreeTypeManagerService
    {
        // CREATE
        Task<TreeTypeDto> CreateTreeTypeAsync(TreeTypeCreateUpdateDto dto);

        // READ (Get All)
        Task<IEnumerable<TreeTypeDto>> GetAllTreeTypesAsync();

        // READ (Get By Id)
        Task<TreeTypeDto?> GetTreeTypeByIdAsync(int treeTypeId);

        // UPDATE
        Task<bool> UpdateTreeTypeAsync(int treeTypeId, TreeTypeCreateUpdateDto dto);

        // DELETE (Soft Delete)
        Task<bool> DeleteTreeTypeAsync(int treeTypeId);
    }
}
