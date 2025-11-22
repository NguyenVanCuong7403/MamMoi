using MamMoi.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface ITreeVarietyService
    {
        Task<IReadOnlyList<TreeVarietyDto>> GetAllAsync(CancellationToken ct = default);
    }
}
