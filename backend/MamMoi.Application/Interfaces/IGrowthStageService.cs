using MamMoi.Application.DTOs.SystemAdminDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface IGrowthStageService
    {
        Task<IEnumerable<TreeTypeDropdownDto>> GetTreeTypeDropdownAsync();

        Task<IEnumerable<GrowthStageDto>> GetAllGrowthStagesAsync(int? treeTypeId); // (Filter)
        Task<GrowthStageDto?> GetGrowthStageByIdAsync(int stageId);
        Task<GrowthStageDto> CreateGrowthStageAsync(GrowthStageCreateUpdateDto dto);
        Task<bool> UpdateGrowthStageAsync(int stageId, GrowthStageCreateUpdateDto dto);
        Task<bool> DeleteGrowthStageAsync(int stageId); // (Hard Delete)
    }
}
