using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs
{
    public sealed class CurrentWeatherDto
    {
        public double Latitude { get; init; }
        public double Longitude { get; init; }
        public string LocationName { get; init; } = "";
        public double Temperature { get; init; }
        public double FeelsLike { get; init; }
        public int Humidity { get; init; }
        public double WindSpeed { get; init; }
        public int Cloudiness { get; init; }
        public double? Rain1h { get; init; }
        public string WeatherMain { get; init; } = "";
        public string WeatherDescription { get; init; } = "";
        public DateTime ObservedAt { get; init; }
        public string Source { get; init; } = "OpenWeatherMap";
    }

    public sealed class ForecastItemDto
    {
        public DateTime At { get; init; }
        public double Temp { get; init; }
        public double TempMin { get; init; }
        public double TempMax { get; init; }
        public int Humidity { get; init; }
        public double WindSpeed { get; init; }
        public string Description { get; init; } = "";
        public double? RainMm { get; init; }
    }

    public sealed class ForecastDto
    {
        public double Latitude { get; init; }
        public double Longitude { get; init; }
        public IReadOnlyList<ForecastItemDto> Items { get; init; } = Array.Empty<ForecastItemDto>();
    }

    public sealed class WeatherAlertDto
    {
        public string Event { get; init; } = "";
        public string Sender { get; init; } = "";
        public string Description { get; init; } = "";
        public DateTime Start { get; init; }
        public DateTime End { get; init; }
    }

    public sealed class SetTreeLocationRequest
    {
        public double Latitude { get; init; }
        public double Longitude { get; init; }
        public string? TimeZone { get; init; }
        public string? LocationNote { get; init; }
    }
}
