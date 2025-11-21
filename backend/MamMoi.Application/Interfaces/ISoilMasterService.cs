using MamMoi.Application.DTOs.SystemAdmin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface ISoilMasterService
    {
        Task<IEnumerable<SoilMasterDropdownDto>> GetSoilMasterDropdownAsync();
        Task<IEnumerable<SoilMasterDto>> GetAllAsync();
        Task<SoilMasterDto> GetByIdAsync(int id);
        Task<SoilMasterDto> CreateAsync(CreateSoilMasterDto dto);
        Task<SoilMasterDto> UpdateAsync(int id, UpdateSoilMasterDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
