using System.Text.RegularExpressions;
using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.External.Weather;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace MamMoi.Infrastructure.Services;

public sealed class WeatherService : IWeatherService
{
    private readonly IWeatherProvider _provider;
    private readonly MamMoiDbContext _db;
    private readonly AlertThresholds _th;

    private static string NormalizeLocationQuery(string location)
    {
        var s = (location ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(s)) return s;

        s = Regex.Replace(s, @"\s+", " ");

        var first = s.Split(',', ';', '|')[0].Trim();
        var lower = first.ToLowerInvariant();

        var prefixes = new[]
        {
            "thành phố ",
            "tp. ",
            "tp ",
            "tỉnh ",
            "thị xã ",
            "tx. ",
            "tx ",
        };

        foreach (var p in prefixes)
        {
            if (lower.StartsWith(p))
            {
                first = first.Substring(p.Length).Trim();
                lower = first.ToLowerInvariant();
                break;
            }
        }

        var mapped = lower switch
        {
            "hà nội" => "Hanoi",
            "đà nẵng" => "Da Nang",
            "hồ chí minh" => "Ho Chi Minh City",
            "hcm" => "Ho Chi Minh City",
            "sài gòn" => "Ho Chi Minh City",
            _ => first
        };

        var query = mapped;
        if (!query.Contains(',')) query = $"{query},VN";
        return query;
    }

    public WeatherService(
        IWeatherProvider provider,
        MamMoiDbContext db,
        IOptions<AlertThresholds> thresholds // cấu hình ngưỡng cảnh báo
    )
    {
        _provider = provider;
        _db = db;
        _th = thresholds.Value;
    }

    // ================= CURRENT & FORECAST =================

    public Task<CurrentWeatherDto> GetCurrentAsync(double lat, double lon, CancellationToken ct)
        => _provider.FetchCurrentAsync(lat, lon, ct);

    public Task<ForecastDto> GetForecastAsync(double lat, double lon, int hoursOrDays, CancellationToken ct)
        => _provider.FetchForecastAsync(lat, lon, hoursOrDays, ct);

    // ================= ALERTS (official -> fallback local) =================

    public async Task<IReadOnlyList<WeatherAlertDto>> GetAlertsAsync(double lat, double lon, CancellationToken ct)
    {
        // 1) thử lấy cảnh báo “chính chủ” (có gói One Call mới có)
        var official = await _provider.FetchAlertsAsync(lat, lon, ct);
        if (official.Count > 0) return official;

        // 2) fallback: tự sinh từ current + forecast
        var now = await _provider.FetchCurrentAsync(lat, lon, ct);
        var fc = await _provider.FetchForecastAsync(lat, lon, 72, ct); // 3 ngày, step 3h

        var local = new List<WeatherAlertDto>();
        local.AddRange(GenerateFromCurrent(now, DateTime.UtcNow));
        local.AddRange(GenerateFromForecast(fc));

        // gộp trùng theo (event + start)
        var dedup = local
            .GroupBy(a => (a.Event, a.Start))
            .Select(g => g.First())
            .OrderBy(a => a.Start)
            .ToList();

        return dedup;
    }

    private IEnumerable<WeatherAlertDto> GenerateFromCurrent(CurrentWeatherDto cur, DateTime nowUtc)
    {
        var list = new List<WeatherAlertDto>();

        // Quy đổi mưa 1h sang ngưỡng 3h (xấp xỉ)
        if ((cur.Rain1h ?? 0) >= _th.RainHeavyMm3h / 3.0)
        {
            list.Add(new WeatherAlertDto
            {
                Event = "Mưa lớn (Hiện tại)",
                Sender = "Local Smart Alerts",
                Description = $"Lượng mưa ước tính {cur.Rain1h:0.0} mm/1h. Cân nhắc che phủ, thoát nước gốc.",
                Start = nowUtc,
                End = nowUtc.AddHours(3)
            });
        }

        if (cur.WindSpeed >= _th.WindStrongMs)
        {
            list.Add(new WeatherAlertDto
            {
                Event = "Gió mạnh (Hiện tại)",
                Sender = "Local Smart Alerts",
                Description = $"Gió {cur.WindSpeed:0.0} m/s. Cột chống/bao lưới bảo vệ cành, quả.",
                Start = nowUtc,
                End = nowUtc.AddHours(3)
            });
        }

        if (cur.Temperature >= _th.TempHotC)
        {
            list.Add(new WeatherAlertDto
            {
                Event = "Nắng nóng (Hiện tại)",
                Sender = "Local Smart Alerts",
                Description = $"Nhiệt độ {cur.Temperature:0.#}°C. Tưới/mulch, tránh sốc nhiệt.",
                Start = nowUtc,
                End = nowUtc.AddHours(3)
            });
        }

        if (cur.Temperature <= _th.TempColdC)
        {
            list.Add(new WeatherAlertDto
            {
                Event = "Trời rét (Hiện tại)",
                Sender = "Local Smart Alerts",
                Description = $"Nhiệt độ {cur.Temperature:0.#}°C. Che chắn gốc/cành non.",
                Start = nowUtc,
                End = nowUtc.AddHours(3)
            });
        }

        return list;
    }

    private IEnumerable<WeatherAlertDto> GenerateFromForecast(ForecastDto fc)
    {
        var list = new List<WeatherAlertDto>();

        foreach (var it in fc.Items)
        {
            if ((it.RainMm ?? 0) >= _th.RainHeavyMm3h)
            {
                list.Add(new WeatherAlertDto
                {
                    Event = "Mưa lớn (Dự báo)",
                    Sender = "Local Smart Alerts",
                    Description = $"Dự báo mưa {it.RainMm:0.#} mm/3h vào {it.At:HH:mm dd/MM}.",
                    Start = it.At,
                    End = it.At.AddHours(3)
                });
            }

            if (it.WindSpeed >= _th.WindStrongMs)
            {
                list.Add(new WeatherAlertDto
                {
                    Event = "Gió mạnh (Dự báo)",
                    Sender = "Local Smart Alerts",
                    Description = $"Gió {it.WindSpeed:0.0} m/s vào {it.At:HH:mm dd/MM}.",
                    Start = it.At,
                    End = it.At.AddHours(3)
                });
            }

            if (it.TempMax >= _th.TempHotC)
            {
                list.Add(new WeatherAlertDto
                {
                    Event = "Nắng nóng (Dự báo)",
                    Sender = "Local Smart Alerts",
                    Description = $"Nhiệt độ tối đa {it.TempMax:0.#}°C vào {it.At:HH:mm dd/MM}.",
                    Start = it.At,
                    End = it.At.AddHours(3)
                });
            }

            if (it.TempMin <= _th.TempColdC)
            {
                list.Add(new WeatherAlertDto
                {
                    Event = "Trời rét (Dự báo)",
                    Sender = "Local Smart Alerts",
                    Description = $"Nhiệt độ tối thiểu {it.TempMin:0.#}°C vào {it.At:HH:mm dd/MM}.",
                    Start = it.At,
                    End = it.At.AddHours(3)
                });
            }
        }

        return list;
    }

    // ================= TREE LOCATION & HISTORY =================

    public async Task SetTreeLocationAsync(int treeId, SetTreeLocationRequest req, CancellationToken ct)
    {
        var tree = await _db.Trees.FirstOrDefaultAsync(x => x.TreeId == treeId, ct)
                   ?? throw new KeyNotFoundException("Tree not found");

   
        tree.Location = req.LocationNote;

        await _db.SaveChangesAsync(ct);
    }

    public async Task<int> SaveWeatherHistoryAsync(int treeId, CurrentWeatherDto data, CancellationToken ct)
    {
        var e = new WeatherHistory
        {
            TreeId = treeId,
            IsForecast = false,
            ForecastDate = null,
            ForecastHorizonDays = null,
            DataSource = data.Source,
            ApirespondedAt = DateTime.UtcNow,
            DataQuality = "raw",
            RawApiresponse = null // có thể serialize DTO nếu bạn muốn lưu chi tiết
        };
        _db.WeatherHistories.Add(e);
        await _db.SaveChangesAsync(ct);
        return e.WeatherId;
    }

    // MamMoi.Infrastructure/Services/WeatherService.cs  (bổ sung)
    public Task<CurrentWeatherDto> GetCurrentByLocationAsync(string location, CancellationToken ct)
        => _provider.FetchCurrentByQueryAsync(NormalizeLocationQuery(location), ct);

    public Task<ForecastDto> GetForecastByLocationAsync(string location, int range, CancellationToken ct)
        => _provider.FetchForecastByQueryAsync(NormalizeLocationQuery(location), ct);

    // Alerts theo location: geocode trước, rồi dùng FetchAlertsAsync(lat,lon)
    public async Task<IReadOnlyList<WeatherAlertDto>> GetAlertsByLocationAsync(string location, CancellationToken ct)
    {
        var pos = await _provider.GeocodeAsync(NormalizeLocationQuery(location), ct);
        if (pos is null) return Array.Empty<WeatherAlertDto>();
        var (lat, lon) = pos.Value;

        // ưu tiên official; nếu rỗng thì fallback giống GetAlertsAsync
        var official = await _provider.FetchAlertsAsync(lat, lon, ct);
        if (official.Count > 0) return official;

        var now = await _provider.FetchCurrentAsync(lat, lon, ct);
        var fc = await _provider.FetchForecastAsync(lat, lon, 72, ct);
        var local = new List<WeatherAlertDto>();
        local.AddRange(GenerateFromCurrent(now, DateTime.UtcNow));
        local.AddRange(GenerateFromForecast(fc));
        return local.GroupBy(a => (a.Event, a.Start)).Select(g => g.First()).OrderBy(a => a.Start).ToList();
    }

}
