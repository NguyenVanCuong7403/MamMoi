using MamMoi.Application.DTOs.GardenSoil;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface IGardenSoilService
    {
        Task<GardenSoilDto?> GetByIdAsync(int id, CancellationToken ct = default);

        Task<List<GardenSoilDto>> GetByGardenAsync(int gardenId, CancellationToken ct = default);

        Task<List<GardenSoilDto>> GetByTreeAsync(int treeId, CancellationToken ct = default);

        Task<List<GardenSoilDto>> GetByTreeTypeInGardenAsync(int typeId, int gardenId, CancellationToken ct = default);
        

        Task<List<GardenSoilDto>> GetAllAsync(CancellationToken ct = default);
    }
}
