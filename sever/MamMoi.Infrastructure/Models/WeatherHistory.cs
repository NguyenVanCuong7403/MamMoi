using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class WeatherHistory
{
    public int WeatherId { get; set; }

    public int TreeId { get; set; }

    public bool? IsForecast { get; set; }

    public DateOnly? ForecastDate { get; set; }

    public int? ForecastHorizonDays { get; set; }

    public string? DataSource { get; set; }

    public DateTime? ApirespondedAt { get; set; }

    public string? DataQuality { get; set; }

    public string? RawApiresponse { get; set; }

    public virtual ICollection<CareSchedule> CareSchedules { get; set; } = new List<CareSchedule>();

    public virtual Tree Tree { get; set; } = null!;
}
