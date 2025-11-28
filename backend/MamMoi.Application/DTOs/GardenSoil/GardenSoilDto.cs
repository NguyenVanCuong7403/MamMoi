using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs.GardenSoil
{
    // GardenSoilDto.cs
    public record GardenSoilDto(
        int GardenSoilId,
        int GardenId,
        int SoilMasterId,
        string? SoilName,
        string? CustomLabel,
        string? Notes
    );

}
