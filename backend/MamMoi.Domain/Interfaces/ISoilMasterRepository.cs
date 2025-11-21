using MamMoi.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Domain.Interfaces
{
    public interface ISoilMasterRepository
    {
        Task<IEnumerable<SoilMaster>> GetAllAsync();
        Task<SoilMaster> GetByIdAsync(int id);
        Task<SoilMaster> CreateAsync(SoilMaster soilMaster);
        Task<SoilMaster> UpdateAsync(SoilMaster soilMaster);
        Task<bool> DeleteAsync(int id);
    }
}