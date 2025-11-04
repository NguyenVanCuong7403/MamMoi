using MamMoi.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface IWeatherProvider
    {
        Task<CurrentWeatherDto> FetchCurrentAsync(double lat, double lon, CancellationToken ct);
        Task<ForecastDto> FetchForecastAsync(double lat, double lon, int hoursOrDays, CancellationToken ct);
        Task<IReadOnlyList<WeatherAlertDto>> FetchAlertsAsync(double lat, double lon, CancellationToken ct);
    }
}
