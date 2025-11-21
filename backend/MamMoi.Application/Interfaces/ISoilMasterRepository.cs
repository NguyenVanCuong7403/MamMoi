using MamMoi.Application.DTOs.SystemAdmin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface ISoilMasterRepository
    {
        Task<IEnumerable<SoilMasterDto>> GetAllAsync();
        Task<SoilMasterDto> GetByIdAsync(int id);
        Task<SoilMasterDto> CreateAsync(SoilMasterDto soilMaster);
        Task<SoilMasterDto> UpdateAsync(SoilMasterDto soilMaster);
        Task<bool> DeleteAsync(int id);
    }
}