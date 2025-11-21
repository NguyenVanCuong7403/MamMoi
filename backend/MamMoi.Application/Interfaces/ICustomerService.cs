using MamMoi.Application.DTOs.BusinessAdmin;
using MamMoi.Application.DTOs.SystemAdmin;
using MamMoi.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace MamMoi.Application.Interfaces
{
    public interface ICustomerService
    {
        Task<IEnumerable<SysUserDto>> GetCustomersAsync(
            string? searchName,
            string? email,
            bool? isActive);
        Task<CustomerDetailDto?> GetCustomerDetailsAsync(int userId);
        Task<IEnumerable<ActivityLogDto>?> GetCustomerActivityLogsAsync(int userId);
    }
}
