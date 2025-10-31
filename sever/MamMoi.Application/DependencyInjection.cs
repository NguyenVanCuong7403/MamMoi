using Microsoft.Extensions.DependencyInjection;

namespace MamMoi.Application;

/// <summary>
/// Extension methods for registering Application layer services.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Register application services here
        // Example: services.AddScoped<IUserService, UserService>();
        
        // Add AutoMapper if using
        // services.AddAutoMapper(Assembly.GetExecutingAssembly());
        
        // Add MediatR if using
        // services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        
        // Add FluentValidation if using
        // services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        
        return services;
    }
}
