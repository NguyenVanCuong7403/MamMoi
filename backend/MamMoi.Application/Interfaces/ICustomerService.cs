using MamMoi.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface ICustomerService
    {
        Task<IEnumerable<UserDto>> GetCustomersAsync(
            string? searchName,
            string? email,
            bool? isActive);
        Task<CustomerDetailDto?> GetCustomerDetailsAsync(int userId);
        Task<IEnumerable<ActivityLogDto>?> GetCustomerActivityLogsAsync(int userId);
    }
}