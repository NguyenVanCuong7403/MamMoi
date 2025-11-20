using MamMoi.Application.DTOs.BusinessAdmin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface IPaymentService
    {
        Task<IEnumerable<PaymentDto>> GetPaymentHistoryAsync(
            PaymentQueryParameters queryParams
        );
    }
}
