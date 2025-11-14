using System.ComponentModel.DataAnnotations;
using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Controllers;

[ApiController]
[Route("api/weather")]
[Produces("application/json")]
public class WeatherController : ControllerBase
{
    private readonly IWeatherService _weather;
    public WeatherController(IWeatherService weather) => _weather = weather;

    // ---------- Helpers ----------
    private static bool IsValidLatLon(double lat, double lon)
        => lat is >= -90 and <= 90 && lon is >= -180 and <= 180;

    // ---------- Current ----------
    [HttpGet("current")]
    [ProducesResponseType(typeof(CurrentWeatherDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CurrentWeatherDto>> GetCurrent(
        [FromQuery, Required] double lat,
        [FromQuery, Required] double lon,
        CancellationToken ct = default)
    {
        if (!IsValidLatLon(lat, lon))
            return ValidationProblem("lat/lon không hợp lệ. lat ∈ [-90,90], lon ∈ [-180,180].");

        var data = await _weather.GetCurrentAsync(lat, lon, ct);
        return Ok(data);
    }

    // ---------- Forecast ----------
    [HttpGet("forecast")]
    [ProducesResponseType(typeof(ForecastDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ForecastDto>> GetForecast(
        [FromQuery, Required] double lat,
        [FromQuery, Required] double lon,
        [FromQuery] int range = 72,   // 3 ngày (3h/step)
        CancellationToken ct = default)
    {
        if (!IsValidLatLon(lat, lon))
            return ValidationProblem("lat/lon không hợp lệ. lat ∈ [-90,90], lon ∈ [-180,180].");

        var data = await _weather.GetForecastAsync(lat, lon, range, ct);
        return Ok(data);
    }

    // ---------- Alerts (official -> fallback local) ----------
    [HttpGet("alerts")]
    [ProducesResponseType(typeof(IReadOnlyList<WeatherAlertDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyList<WeatherAlertDto>>> GetAlerts(
        [FromQuery, Required] double lat,
        [FromQuery, Required] double lon,
        CancellationToken ct = default)
    {
        if (!IsValidLatLon(lat, lon))
            return ValidationProblem("lat/lon không hợp lệ. lat ∈ [-90,90], lon ∈ [-180,180].");

        var alerts = await _weather.GetAlertsAsync(lat, lon, ct);
        return Ok(alerts);
    }

    // ---------- Set tree location ----------
    [HttpPut("trees/{treeId:int}/location")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetTreeLocation(
        [FromRoute] int treeId,
        [FromBody, Required] SetTreeLocationRequest req,
        CancellationToken ct = default)
    {
        await _weather.SetTreeLocationAsync(treeId, req, ct);
        return NoContent();
    }

    // ---------- Save current weather -> history ----------
    [HttpPost("history/save")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SaveHistory(
        [FromQuery, Required] int treeId,
        [FromBody, Required] CurrentWeatherDto dto,
        CancellationToken ct = default)
    {
        var id = await _weather.SaveWeatherHistoryAsync(treeId, dto, ct);
        return Ok(new { WeatherHistoryId = id });
    }

    [HttpGet("current/by-location")]
    [ProducesResponseType(typeof(CurrentWeatherDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<CurrentWeatherDto>> GetCurrentByLocation(
    [FromQuery, Required] string location,
    CancellationToken ct = default)
    {
        var data = await _weather.GetCurrentByLocationAsync(location, ct);
        return Ok(data);
    }

    [HttpGet("forecast/by-location")]
    [ProducesResponseType(typeof(ForecastDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ForecastDto>> GetForecastByLocation(
        [FromQuery, Required] string location,
        [FromQuery] int range = 72,
        CancellationToken ct = default)
    {
        var data = await _weather.GetForecastByLocationAsync(location, range, ct);
        return Ok(data);
    }

    [HttpGet("alerts/by-location")]
    [ProducesResponseType(typeof(IReadOnlyList<WeatherAlertDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<WeatherAlertDto>>> GetAlertsByLocation(
        [FromQuery, Required] string location,
        CancellationToken ct = default)
    {
        var data = await _weather.GetAlertsByLocationAsync(location, ct);
        return Ok(data);
    }

    // ➕ tiện: theo vườn (lấy Garden.Location rồi gọi by-location)
    [HttpGet("current/by-garden/{gardenId:int}")]
    public async Task<ActionResult<CurrentWeatherDto>> GetCurrentByGarden(int gardenId, CancellationToken ct = default)
    {
        var garden = await HttpContext.RequestServices
            .GetRequiredService<MamMoi.Infrastructure.Models.MamMoiDbContext>()
            .Gardens.AsNoTracking()
            .FirstOrDefaultAsync(g => g.GardenId == gardenId, ct);

        if (garden is null || string.IsNullOrWhiteSpace(garden.Location))
            return ValidationProblem("Garden không tồn tại hoặc chưa có Location.");

        var data = await _weather.GetCurrentByLocationAsync(garden.Location, ct);
        return Ok(data);
    }
}
