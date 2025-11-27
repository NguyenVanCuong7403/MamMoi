using System;
using MamMoi.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace MamMoi.Infrastructure.Services;

public class TreeLifecycleAutomationBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TreeLifecycleAutomationBackgroundService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromHours(12);

    public TreeLifecycleAutomationBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<TreeLifecycleAutomationBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Tree lifecycle automation background service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var automationService = scope.ServiceProvider.GetRequiredService<ITreeLifecycleAutomationService>();
                var updated = await automationService.SyncLifecycleStagesAsync(stoppingToken);

                _logger.LogInformation("Lifecycle auto-sync finished. Updated {UpdatedCount} trees.", updated);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Tree lifecycle automation background service stopping due to cancellation.");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while running lifecycle automation sync.");
            }

            await Task.Delay(_interval, stoppingToken);
        }

        _logger.LogInformation("Tree lifecycle automation background service stopped.");
    }
}

