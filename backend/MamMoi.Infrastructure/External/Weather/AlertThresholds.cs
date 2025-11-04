using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.External.Weather
{
    public sealed class AlertThresholds
    {
        public double RainHeavyMm3h { get; init; } = 20;
        public double WindStrongMs { get; init; } = 10;
        public double TempHotC { get; init; } = 38;
        public double TempColdC { get; init; } = 10;
        public int HumidityHighPct { get; init; } = 90;
        public int CloudinessHighPct { get; init; } = 95;
    }
}
