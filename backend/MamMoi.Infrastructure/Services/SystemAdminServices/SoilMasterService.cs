using MamMoi.Application.DTOs.SystemAdminDto;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.Services.SystemAdminServices
{
    public class SoilMasterService : ISoilMasterService
    {
        private readonly CapstoneDbContext _context;

        public SoilMasterService(CapstoneDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SoilMasterDropdownDto>> GetSoilMasterDropdownAsync()
        {
            return await _context.SoilMasters
                .AsNoTracking()
                .OrderBy(s => s.SoilName)
                .Select(s => new SoilMasterDropdownDto
                {
                    SoilMasterID = s.SoilMasterId,
                    SoilName = s.SoilName
                })
                .ToListAsync();
        }
    }
}
