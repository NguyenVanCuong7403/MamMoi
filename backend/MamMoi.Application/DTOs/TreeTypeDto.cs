using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs
{
    public record TreeTypeDto(
     int TreeTypeId,
     string TreeTypeName,
     string ScientificName,
     string? Category,
     int SoilMasterId,
     bool IsActive
 );
}
