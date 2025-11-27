using System;
using System.Collections.Generic;
using System.Linq;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MamMoi.Infrastructure.Services;

public class TreeLifecycleAutomationService : ITreeLifecycleAutomationService
{
    private readonly MamMoiDbContext _db;
    private readonly ILogger<TreeLifecycleAutomationService> _logger;
    private const int BatchSize = 200;

    public TreeLifecycleAutomationService(
        MamMoiDbContext db,
        ILogger<TreeLifecycleAutomationService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<int> SyncLifecycleStagesAsync(CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var stageLookup = await LoadStageLookupAsync(ct);

        var updated = 0;
        var lastTreeId = 0;

        while (true)
        {
            ct.ThrowIfCancellationRequested();

            var trees = await _db.Trees
                .Where(t => t.LifecycleAutoEnabled && t.PlantDate != null && t.TreeId > lastTreeId)
                .OrderBy(t => t.TreeId)
                .Take(BatchSize)
                .ToListAsync(ct);

            if (trees.Count == 0)
            {
                break;
            }

            foreach (var tree in trees)
            {
                if (!stageLookup.TryGetValue(tree.TreeTypeId, out var stages) || stages.Count == 0)
                {
                    continue;
                }

                var plantDate = tree.PlantDate;
                if (plantDate is null)
                {
                    continue;
                }

                var ageMonths = CalculateAgeInMonths(plantDate.Value, today);
                var extraMonths = Math.Max(0, tree.preMonths ?? 0);
                var totalAge = ageMonths + extraMonths;

                var expectedStage = ResolveStageForAge(stages, totalAge);
                if (expectedStage is null || expectedStage.StageId == tree.StageId)
                {
                    continue;
                }

                tree.StageId = expectedStage.StageId;
                tree.UpdatedAt = DateTime.UtcNow;
                updated++;
            }

            await _db.SaveChangesAsync(ct);
            lastTreeId = trees[^1].TreeId;
        }

        if (updated > 0)
        {
            _logger.LogInformation("Lifecycle auto-sync updated {UpdatedCount} trees.", updated);
        }

        return updated;
    }

    private async Task<Dictionary<int, List<TreeGrowthStage>>> LoadStageLookupAsync(CancellationToken ct)
    {
        var stages = await _db.TreeGrowthStages
            .AsNoTracking()
            .OrderBy(s => s.TreeTypeId)
            .ThenBy(s => s.StageOrder)
            .ToListAsync(ct);

        return stages
            .GroupBy(s => s.TreeTypeId)
            .ToDictionary(g => g.Key, g => g.ToList());
    }

    private static TreeGrowthStage? ResolveStageForAge(IReadOnlyList<TreeGrowthStage> stages, int totalAgeMonths)
    {
        TreeGrowthStage? fallback = null;
        foreach (var stage in stages)
        {
            fallback = stage;
            var min = stage.MinAgeInMonths ?? int.MinValue;
            var max = stage.MaxAgeInMonths ?? int.MaxValue;
            if (totalAgeMonths >= min && totalAgeMonths < max)
            {
                return stage;
            }
        }

        return fallback;
    }

    private static int CalculateAgeInMonths(DateOnly plantedAt, DateOnly today)
    {
        var months = (today.Year - plantedAt.Year) * 12 + (today.Month - plantedAt.Month);
        if (today.Day < plantedAt.Day)
        {
            months--;
        }

        return Math.Max(0, months);
    }
}

