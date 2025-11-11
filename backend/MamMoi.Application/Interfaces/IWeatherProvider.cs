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
        // ➕ mới: lấy theo chuỗi địa danh (city/địa chỉ ngắn)
        Task<CurrentWeatherDto> FetchCurrentByQueryAsync(string query, CancellationToken ct);
        Task<ForecastDto> FetchForecastByQueryAsync(string query, CancellationToken ct);

        // ➕ mới: geocode để lấy lat/lon từ chuỗi (phục vụ Alerts)
        Task<(double lat, double lon)?> GeocodeAsync(string query, CancellationToken ct);
    }
}
