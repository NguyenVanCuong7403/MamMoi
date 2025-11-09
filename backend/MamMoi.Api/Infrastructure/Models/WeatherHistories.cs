using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

[Index("TreeID", Name = "IX_Weather_TreeID")]
public partial class WeatherHistories
{
    [Key]
    public int WeatherID { get; set; }

    public int TreeID { get; set; }

    public bool? IsForecast { get; set; }

    public DateOnly? ForecastDate { get; set; }

    public int? ForecastHorizonDays { get; set; }

    [StringLength(50)]
    public string? DataSource { get; set; }

    [Precision(0)]
    public DateTime? APIRespondedAt { get; set; }

    [StringLength(20)]
    public string? DataQuality { get; set; }

    public string? RawAPIResponse { get; set; }

    [InverseProperty("Weather")]
    public virtual ICollection<CareSchedules> CareSchedules { get; set; } = new List<CareSchedules>();

    [ForeignKey("TreeID")]
    [InverseProperty("WeatherHistories")]
    public virtual Trees Tree { get; set; } = null!;
}
