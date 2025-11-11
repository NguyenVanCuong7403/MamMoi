using MamMoi.Application.DTOs;

namespace MamMoi.Application.Interfaces
{
    public interface IWeatherService
    {
        // --- Theo lat/lon (nếu còn dùng) ---
        Task<CurrentWeatherDto> GetCurrentAsync(double lat, double lon, CancellationToken ct);
        Task<ForecastDto> GetForecastAsync(double lat, double lon, int hoursOrDays, CancellationToken ct);
        Task<IReadOnlyList<WeatherAlertDto>> GetAlertsAsync(double lat, double lon, CancellationToken ct);

        // --- Theo location (tên địa danh) ---
        Task<CurrentWeatherDto> GetCurrentByLocationAsync(string location, CancellationToken ct);
        Task<ForecastDto> GetForecastByLocationAsync(string location, int range, CancellationToken ct);
        Task<IReadOnlyList<WeatherAlertDto>> GetAlertsByLocationAsync(string location, CancellationToken ct);

        // --- Lưu & cập nhật ---
        Task SetTreeLocationAsync(int treeId, SetTreeLocationRequest req, CancellationToken ct);
        Task<int> SaveWeatherHistoryAsync(int treeId, CurrentWeatherDto data, CancellationToken ct);
    }
}
