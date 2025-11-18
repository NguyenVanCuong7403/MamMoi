using System.Net.Http.Json;
using System.Text.Json;
using System.Globalization;
using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace MamMoi.Infrastructure.External.Weather;

public sealed class OpenWeatherMapProvider : IWeatherProvider
{
    private readonly HttpClient _http;
    private readonly string _apiKey, _units, _lang;

    public OpenWeatherMapProvider(HttpClient http, IConfiguration cfg)  
    {
        _http = http;
        _apiKey = cfg["Weather:ApiKey"] ?? throw new InvalidOperationException("Missing Weather:ApiKey");
        _units = cfg["Weather:Units"] ?? "metric";
        _lang = cfg["Weather:Lang"] ?? "en";
    }

    // ---------------- GET CURRENT WEATHER ----------------
    public async Task<CurrentWeatherDto> FetchCurrentAsync(double lat, double lon, CancellationToken ct)
    {
        var url = $"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={_apiKey}&units={_units}&lang={_lang}";
        var resp = await _http.GetAsync(url, ct);
        var jsonString = await resp.Content.ReadAsStringAsync(ct);

        if (!resp.IsSuccessStatusCode)
            throw new Exception($"OpenWeather error: {(int)resp.StatusCode} - {jsonString}");

        var root = JsonDocument.Parse(jsonString).RootElement;

        string location = root.TryGetProperty("name", out var nameProp) ? (nameProp.GetString() ?? "Unknown") : "Unknown";
        var main = root.GetProperty("main");
        var wind = root.GetProperty("wind");
        var weather = root.GetProperty("weather")[0];

        int cloudiness = 0;
        if (root.TryGetProperty("clouds", out var cloudsProp) &&
            cloudsProp.ValueKind == JsonValueKind.Object &&
            cloudsProp.TryGetProperty("all", out var allProp))
        {
            cloudiness = allProp.GetInt32();
        }

        long dtUnix = root.TryGetProperty("dt", out var dtProp) ? dtProp.GetInt64() : DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        return new CurrentWeatherDto
        {
            Latitude = lat,
            Longitude = lon,
            LocationName = location,
            Temperature = main.TryGetProperty("temp", out var t) ? t.GetDouble() : 0,
            FeelsLike = main.TryGetProperty("feels_like", out var fl) ? fl.GetDouble() : 0,
            Humidity = main.TryGetProperty("humidity", out var h) ? h.GetInt32() : 0,
            WindSpeed = wind.TryGetProperty("speed", out var ws) ? ws.GetDouble() : 0,
            Cloudiness = cloudiness,
            WeatherMain = weather.TryGetProperty("main", out var wm) ? (wm.GetString() ?? "") : "",
            WeatherDescription = weather.TryGetProperty("description", out var wd) ? (wd.GetString() ?? "") : "",
            ObservedAt = DateTimeOffset.FromUnixTimeSeconds(dtUnix).UtcDateTime,
            Source = "OpenWeatherMap"
        };
    }

    // ---------------- GET FORECAST ----------------
    public async Task<ForecastDto> FetchForecastAsync(double lat, double lon, int hoursOrDays, CancellationToken ct)
    {
        var url = $"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={_apiKey}&units={_units}&lang={_lang}";
        var resp = await _http.GetAsync(url, ct);
        var jsonString = await resp.Content.ReadAsStringAsync(ct);

        if (!resp.IsSuccessStatusCode)
            throw new Exception($"OpenWeather forecast error: {(int)resp.StatusCode} - {jsonString}");

        var root = JsonDocument.Parse(jsonString).RootElement;
        var items = new List<ForecastItemDto>();

        if (!root.TryGetProperty("list", out var list) || list.ValueKind != JsonValueKind.Array)
            return new ForecastDto { Latitude = lat, Longitude = lon, Items = items };

        foreach (var it in list.EnumerateArray())
        {
            var main = it.GetProperty("main");
            var wind = it.GetProperty("wind");
            var weather = it.GetProperty("weather")[0];

            double? rain = null;
            if (it.TryGetProperty("rain", out var rainProp) && rainProp.TryGetProperty("3h", out var r3))
                rain = r3.GetDouble();

            // Ưu tiên dt (unix), nếu thiếu mới dùng dt_txt
            DateTime at;
            if (it.TryGetProperty("dt", out var dt))
            {
                at = DateTimeOffset.FromUnixTimeSeconds(dt.GetInt64()).UtcDateTime;
            }
            else
            {
                var s = it.TryGetProperty("dt_txt", out var dtt) ? dtt.GetString() : null;
                at = s != null
                    ? DateTime.Parse(s, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal).ToUniversalTime()
                    : DateTime.UtcNow;
            }

            items.Add(new ForecastItemDto
            {
                At = at,
                Temp = main.TryGetProperty("temp", out var t) ? t.GetDouble() : 0,
                TempMin = main.TryGetProperty("temp_min", out var tmin) ? tmin.GetDouble() : 0,
                TempMax = main.TryGetProperty("temp_max", out var tmax) ? tmax.GetDouble() : 0,
                Humidity = main.TryGetProperty("humidity", out var h) ? h.GetInt32() : 0,
                WindSpeed = wind.TryGetProperty("speed", out var ws) ? ws.GetDouble() : 0,
                Description = weather.TryGetProperty("description", out var wd) ? (wd.GetString() ?? "") : "",
                RainMm = rain
            });
        }

        return new ForecastDto { Latitude = lat, Longitude = lon, Items = items };
    }

    // ---------------- GET ALERTS ----------------
    public async Task<IReadOnlyList<WeatherAlertDto>> FetchAlertsAsync(double lat, double lon, CancellationToken ct)
    {
        var url = $"https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&appid={_apiKey}&units={_units}&lang={_lang}";

        using var resp = await _http.GetAsync(url, ct);
        var jsonString = await resp.Content.ReadAsStringAsync(ct);

        // Nếu không có gói OneCall sẽ trả 401/403/400 → trả rỗng để fallback
        if ((int)resp.StatusCode == 400 || (int)resp.StatusCode == 401 || (int)resp.StatusCode == 403)
            return Array.Empty<WeatherAlertDto>();

        if (!resp.IsSuccessStatusCode)
            throw new Exception($"OpenWeather alerts error: {(int)resp.StatusCode} - {jsonString}");

        var root = JsonDocument.Parse(jsonString).RootElement;
        if (!root.TryGetProperty("alerts", out var alerts) || alerts.ValueKind != JsonValueKind.Array)
            return Array.Empty<WeatherAlertDto>();

        var result = new List<WeatherAlertDto>();
        foreach (var a in alerts.EnumerateArray())
        {
            result.Add(new WeatherAlertDto
            {
                Event = a.TryGetProperty("event", out var ev) ? ev.GetString() ?? "" : "",
                Sender = a.TryGetProperty("sender_name", out var sn) ? sn.GetString() ?? "" : "",
                Description = a.TryGetProperty("description", out var d) ? d.GetString() ?? "" : "",
                Start = a.TryGetProperty("start", out var s) ? DateTimeOffset.FromUnixTimeSeconds(s.GetInt64()).UtcDateTime : DateTime.UtcNow,
                End = a.TryGetProperty("end", out var e) ? DateTimeOffset.FromUnixTimeSeconds(e.GetInt64()).UtcDateTime : DateTime.UtcNow.AddHours(3)
            });
        }
        return result;
    }

    public async Task<CurrentWeatherDto> FetchCurrentByQueryAsync(string query, CancellationToken ct)
    {
        var url = $"https://api.openweathermap.org/data/2.5/weather?q={Uri.EscapeDataString(query)}&appid={_apiKey}&units={_units}&lang={_lang}";
        using var resp = await _http.GetAsync(url, ct);
        var json = await resp.Content.ReadAsStringAsync(ct);
        if (!resp.IsSuccessStatusCode) throw new Exception($"OpenWeather error: {(int)resp.StatusCode} - {json}");
        var root = JsonDocument.Parse(json).RootElement;

        var coord = root.GetProperty("coord");
        var lat = coord.TryGetProperty("lat", out var la) ? la.GetDouble() : 0;
        var lon = coord.TryGetProperty("lon", out var lo) ? lo.GetDouble() : 0;

        // tái sử dụng logic đã có bằng cách build từ root
        var main = root.GetProperty("main");
        var wind = root.GetProperty("wind");
        var weather = root.GetProperty("weather")[0];

        int cloudiness = 0;
        if (root.TryGetProperty("clouds", out var cloudsProp)
            && cloudsProp.ValueKind == JsonValueKind.Object
            && cloudsProp.TryGetProperty("all", out var allProp))
            cloudiness = allProp.GetInt32();

        long dtUnix = root.TryGetProperty("dt", out var dtProp)
            ? dtProp.GetInt64() : DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        return new CurrentWeatherDto
        {
            Latitude = lat,
            Longitude = lon,
            LocationName = root.TryGetProperty("name", out var n) ? n.GetString() ?? "Unknown" : "Unknown",
            Temperature = main.TryGetProperty("temp", out var t) ? t.GetDouble() : 0,
            FeelsLike = main.TryGetProperty("feels_like", out var fl) ? fl.GetDouble() : 0,
            Humidity = main.TryGetProperty("humidity", out var h) ? h.GetInt32() : 0,
            WindSpeed = wind.TryGetProperty("speed", out var ws) ? ws.GetDouble() : 0,
            Cloudiness = cloudiness,
            WeatherMain = weather.TryGetProperty("main", out var wm) ? wm.GetString() ?? "" : "",
            WeatherDescription = weather.TryGetProperty("description", out var wd) ? wd.GetString() ?? "" : "",
            ObservedAt = DateTimeOffset.FromUnixTimeSeconds(dtUnix).UtcDateTime,
            Source = "OpenWeatherMap"
        };
    }

    public async Task<ForecastDto> FetchForecastByQueryAsync(string query, CancellationToken ct)
    {
        var url = $"https://api.openweathermap.org/data/2.5/forecast?q={Uri.EscapeDataString(query)}&appid={_apiKey}&units={_units}&lang={_lang}";
        using var resp = await _http.GetAsync(url, ct);
        var json = await resp.Content.ReadAsStringAsync(ct);
        if (!resp.IsSuccessStatusCode) throw new Exception($"OpenWeather forecast error: {(int)resp.StatusCode} - {json}");

        var root = JsonDocument.Parse(json).RootElement;
        var city = root.TryGetProperty("city", out var c) ? c : default;
        double lat = 0, lon = 0;
        if (city.ValueKind == JsonValueKind.Object && city.TryGetProperty("coord", out var cd))
        {
            if (cd.TryGetProperty("lat", out var la)) lat = la.GetDouble();
            if (cd.TryGetProperty("lon", out var lo)) lon = lo.GetDouble();
        }

        var items = new List<ForecastItemDto>();
        if (root.TryGetProperty("list", out var list) && list.ValueKind == JsonValueKind.Array)
        {
            foreach (var it in list.EnumerateArray())
            {
                var main = it.GetProperty("main");
                var wind = it.GetProperty("wind");
                var weather = it.GetProperty("weather")[0];

                double? rain = null;
                if (it.TryGetProperty("rain", out var rainProp) && rainProp.TryGetProperty("3h", out var r3))
                    rain = r3.GetDouble();

                DateTime at = it.TryGetProperty("dt", out var dt)
                    ? DateTimeOffset.FromUnixTimeSeconds(dt.GetInt64()).UtcDateTime
                    : DateTime.UtcNow;

                items.Add(new ForecastItemDto
                {
                    At = at,
                    Temp = main.TryGetProperty("temp", out var t) ? t.GetDouble() : 0,
                    TempMin = main.TryGetProperty("temp_min", out var tmin) ? tmin.GetDouble() : 0,
                    TempMax = main.TryGetProperty("temp_max", out var tmax) ? tmax.GetDouble() : 0,
                    Humidity = main.TryGetProperty("humidity", out var h) ? h.GetInt32() : 0,
                    WindSpeed = wind.TryGetProperty("speed", out var ws) ? ws.GetDouble() : 0,
                    Description = weather.TryGetProperty("description", out var wd) ? wd.GetString() ?? "" : "",
                    RainMm = rain
                });
            }
        }
        return new ForecastDto { Latitude = lat, Longitude = lon, Items = items };
    }

    public async Task<(double lat, double lon)?> GeocodeAsync(string query, CancellationToken ct)
    {
        var url = $"https://api.openweathermap.org/geo/1.0/direct?q={Uri.EscapeDataString(query)}&limit=1&appid={_apiKey}";
        using var resp = await _http.GetAsync(url, ct);
        var json = await resp.Content.ReadAsStringAsync(ct);
        if (!resp.IsSuccessStatusCode) return null;

        var arr = JsonDocument.Parse(json).RootElement;
        if (arr.ValueKind != JsonValueKind.Array || arr.GetArrayLength() == 0) return null;

        var first = arr[0];
        if (first.TryGetProperty("lat", out var la) && first.TryGetProperty("lon", out var lo))
            return (la.GetDouble(), lo.GetDouble());

        return null;
    }
}
