using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs
{
    public record TreeListItemDto(
     int TreeId,
     string? TreeCode,
     string? TreeName,
     string GardenName,
     string TreeTypeName,
     string StageName,
     string HealthStatus,
     decimal? HealthScore,
     DateTime CreatedAt
 );
}
