using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MamMoi.Application.Interfaces;
using MamMoi.Application.Interfaces.Auth;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Repositories;
using MamMoi.Infrastructure.Security;

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
        services.AddDbContext<CapstoneDb01Context>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection")));

        // Register repositories - đơn giản, chỉ register những gì cần
        services.AddScoped<IUserRepository, UserRepository>();
        // Thêm repositories khác khi cần:
        // services.AddScoped<ITreeRepository, TreeRepository>();

        // Register application services
        services.AddScoped<IUserService, MamMoi.Infrastructure.Services.UserService>();
        
        // Register authentication services
        services.AddScoped<IAuthService, MamMoi.Infrastructure.Services.Auth.AuthService>();
        services.AddScoped<IEmailService, MamMoi.Infrastructure.Services.Auth.EmailService>();
        
        // Register infrastructure services
        services.AddScoped<TokenService>();
        
        // Add MemoryCache for OTP storage
        services.AddMemoryCache();

        return services;
    }
}
