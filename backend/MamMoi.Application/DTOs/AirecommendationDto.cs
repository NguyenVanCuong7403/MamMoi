using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs
{
    public record AirecommendationDto(
        int TreeId,
        DateOnly ForDate,
        string? ActionsJson,
        DateTime CreatedAt
        );
}
