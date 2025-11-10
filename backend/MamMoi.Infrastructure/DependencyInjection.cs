using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MamMoi.Application.Interfaces;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Repositories;
using MamMoi.Infrastructure.Security;
using MamMoi.Infrastructure.Services.SystemAdminServices;
using MamMoi.Infrastructure.Services.BusinessAdminServices;

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
        services.AddDbContext<CapstoneDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection")));

        // Register repositories - đơn giản, chỉ register những gì cần
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ISystemSettingRepository, SystemSettingRepository>();
        services.AddScoped<IActivityLogRepository, ActivityLogRepository>();
        // Thêm repositories khác khi cần:
        // services.AddScoped<ITreeRepository, TreeRepository>();

        // Register application services
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ISystemSettingService, SystemSettingService>();
        services.AddScoped<IActivityLogService, ActivityLogService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<ISubscriptionService, SubscriptionService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<ISubscriptionPlanService, SubscriptionPlanService>();
        // Register infrastructure services
        services.AddScoped<TokenService>();

        return services;
    }
}
