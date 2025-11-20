using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MamMoi.Application.Interfaces;
using MamMoi.Application.Interfaces.Auth;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Repositories;
using MamMoi.Infrastructure.Security;
using MamMoi.Infrastructure.Services;
using MamMoi.Infrastructure.External.Weather;
using MamMoi.Infrastructure.Services.GardenSoils;

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
        services.AddScoped<IGardenSoilService, GardenSoilService>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IGardenRepository, GardenRepository>();
        services.AddScoped<IGardenMemberRepository, GardenMemberRepository>();
        services.AddScoped<ISystemSettingRepository, SystemSettingRepository>();
        services.AddScoped<IActivityLogRepository, ActivityLogRepository>();

        // Thêm repositories khác khi cần:
        // services.AddScoped<ITreeRepository, TreeRepository>();

        // Register application services
        services.AddScoped<IUserService, MamMoi.Infrastructure.Services.Users.UserService>();
        services.AddScoped<IGardenService, MamMoi.Infrastructure.Services.Gardens.GardenService>();
        services.AddScoped<IInvitationService, MamMoi.Infrastructure.Services.Staff.StaffService>();
        services.AddScoped<IGardenMemberService, MamMoi.Infrastructure.Services.GardenMember.GardenMemberService>();
        services.AddScoped<ICareScheduleService, MamMoi.Infrastructure.Services.CareSchedules.CareScheduleService>();

        // Register authentication services
        services.AddScoped<IAuthService, MamMoi.Infrastructure.Services.Auth.AuthService>();
        services.AddScoped<IEmailService, MamMoi.Infrastructure.Services.Auth.EmailService>();

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
        //admin
        services.AddScoped<IGardenManagerService, MamMoi.Infrastructure.Services.BusinessAdmin.GardenManagerService>();
        services.AddScoped<IStaffService, MamMoi.Infrastructure.Services.BusinessAdmin.StaffService>();
        services.AddScoped<IAnalyticsService, MamMoi.Infrastructure.Services.BusinessAdmin.AnalyticsService>();
        services.AddScoped<ICustomerService, MamMoi.Infrastructure.Services.BusinessAdmin.CustomerService>();
        services.AddScoped<IGrowthStageService, MamMoi.Infrastructure.Services.BusinessAdmin.GrowthStageService>();
        services.AddScoped<IStaffService, MamMoi.Infrastructure.Services.BusinessAdmin.StaffService>();
        services.AddScoped<IPaymentService, MamMoi.Infrastructure.Services.BusinessAdmin.PaymentService>();
        services.AddScoped<ISupportTicketService, MamMoi.Infrastructure.Services.BusinessAdmin.SupportTicketService>();
        services.AddScoped<ISoilMasterService, MamMoi.Infrastructure.Services.BusinessAdmin.SoilMasterService>();
        services.AddScoped<IActivityLogService, MamMoi.Infrastructure.Services.SystemAdmin.ActivityLogService>();
        services.AddScoped<IDashboardService, MamMoi.Infrastructure.Services.SystemAdmin.DashboardService>();
        services.AddScoped<ISubscriptionPlanService, MamMoi.Infrastructure.Services.SystemAdmin.SubscriptionPlanService>();
        services.AddScoped<ISubscriptionService, MamMoi.Infrastructure.Services.SystemAdmin.SubscriptionService>();
        services.AddScoped<ISysAdminUserService, MamMoi.Infrastructure.Services.SystemAdmin.SysAdminUserService>();
        services.AddScoped<ISystemSettingService, MamMoi.Infrastructure.Services.SystemAdmin.SystemSettingService>();

        return services;
    }
}
