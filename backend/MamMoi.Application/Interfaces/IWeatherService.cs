using MamMoi.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface IWeatherService
    {
        Task<CurrentWeatherDto> GetCurrentAsync(double lat, double lon, CancellationToken ct);
        Task<ForecastDto> GetForecastAsync(double lat, double lon, int hoursOrDays, CancellationToken ct);
        Task<IReadOnlyList<WeatherAlertDto>> GetAlertsAsync(double lat, double lon, CancellationToken ct);

        Task SetTreeLocationAsync(int treeId, SetTreeLocationRequest req, CancellationToken ct);
        Task<int> SaveWeatherHistoryAsync(int treeId, CurrentWeatherDto data, CancellationToken ct);
    }
}
