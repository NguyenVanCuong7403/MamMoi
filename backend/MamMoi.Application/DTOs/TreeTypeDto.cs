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
     bool IsActive,
     string? Description = null,
     string? ImageUrl = null,
     int? AverageLifespanYears = null,
     decimal? OptimalTemperatureMin = null,
     decimal? OptimalTemperatureMax = null,
     decimal? OptimalHumidityMin = null,
     decimal? OptimalHumidityMax = null,
     string? DroughtTolerance = null,
     string? FloodTolerance = null,
     string? FrostTolerance = null,
     string? WindTolerance = null,
     string? CareGuide = null,
     string? LightRequirement = null,
     string? WaterRequirement = null,
     string? Pests = null,
     string? SeasonalRoadmap = null
 );
}
