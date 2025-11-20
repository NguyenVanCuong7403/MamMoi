using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs
{
    public record TreeVarietyDto(
        int VarietyId,
        int TreeTypeId,
        string TreeVarietyName,
        string Description
 );
}
