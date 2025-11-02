using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MamMoi.Application.Interfaces;
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
        services.AddDbContext<CapstoneDbContext>(options =>
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

        return services;
    }
}
