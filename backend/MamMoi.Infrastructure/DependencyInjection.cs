using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MamMoi.Application.Interfaces;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Repositories;
using MamMoi.Infrastructure.Security;
using MamMoi.Infrastructure.Services;
using MamMoi.Infrastructure.External.Weather;

namespace MamMoi.Infrastructure;

/// <summary>
/// Extension methods for registering Infrastructure layer services.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Add DbContext
        services.AddDbContext<MamMoiDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection")));

        // Register repositories - đơn giản, chỉ register những gì cần
        services.AddScoped<IUserRepository, UserRepository>();
        // Thêm repositories khác khi cần:
        // services.AddScoped<ITreeRepository, TreeRepository>();

        // Register application services
        services.AddScoped<IUserService, MamMoi.Infrastructure.Services.UserService>();
        
        // Register infrastructure services
        services.AddScoped<TokenService>();
        services.AddScoped<ITreeTypeService, TreeTypeService>();
        services.AddScoped<ITreeQueryService, TreeQueryService>();
        services.AddScoped<ITreeCommandService, TreeCommandService>();
        services.AddScoped<ITreeImageService, TreeImageService>();

        services.AddHttpClient<IWeatherProvider, OpenWeatherMapProvider>();
        services.AddScoped<IWeatherService, WeatherService>();
        services.Configure<AlertThresholds>(configuration.GetSection("WeatherAlerts"));
        services.AddHttpClient<IWeatherProvider, OpenWeatherMapProvider>();
        services.AddScoped<IWeatherService, WeatherService>();
        services.Configure<AlertThresholds>(configuration.GetSection("AlertThresholds"));

        return services;
    }
}
