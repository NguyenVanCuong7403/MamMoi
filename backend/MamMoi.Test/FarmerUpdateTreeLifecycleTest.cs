using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace MamMoi.Test;

public class FarmerUpdateTreeLifecycleTest
{
    [Fact]
    public async Task UTCID01_UpdateLifecycle_TreeIdNotExists_ReturnsNull()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeLifecycleRequest(
            PhaseId: "flowering",
            CycleCount: null,
            Phase1Completed: null,
            AutoSyncEnabled: null,
            OverrideReason: null
        );

        // Act
        var result = await service.UpdateLifecycleAsync(3, 9999, request, CancellationToken.None);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task UTCID02_UpdateLifecycle_UserNotOwner_ThrowsUnauthorizedException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Gardens.Add(new Garden
        {
            GardenId = 1,
            UserId = 3,
            Name = "Test Garden",
            CreatedAt = DateTime.UtcNow
        });

        dbContext.TreeTypes.Add(new TreeType
        {
            TreeTypeId = 1,
            TreeTypeName = "Cam",
            ScientificName = "Citrus sinensis",
            SoilMasterId = 1
        });

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Flowering",
            StageOrder = 2
        });

        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            StageId = 1,
            VarietyId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeLifecycleRequest(
            PhaseId: "flowering",
            CycleCount: null,
            Phase1Completed: null,
            AutoSyncEnabled: null,
            OverrideReason: null
        );

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => service.UpdateLifecycleAsync(5, 1, request, CancellationToken.None)
        );
    }

    [Fact]
    public async Task UTCID03_UpdateLifecycle_PhaseIdNull_ThrowsNullReferenceException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Gardens.Add(new Garden
        {
            GardenId = 1,
            UserId = 3,
            Name = "Test Garden",
            CreatedAt = DateTime.UtcNow
        });

        dbContext.TreeTypes.Add(new TreeType
        {
            TreeTypeId = 1,
            TreeTypeName = "Cam",
            ScientificName = "Citrus sinensis",
            SoilMasterId = 1
        });

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Flowering",
            StageOrder = 2
        });

        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            StageId = 1,
            VarietyId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeLifecycleRequest(
            PhaseId: null!,
            CycleCount: null,
            Phase1Completed: null,
            AutoSyncEnabled: null,
            OverrideReason: null
        );

        // Act & Assert
        await Assert.ThrowsAsync<NullReferenceException>(
            () => service.UpdateLifecycleAsync(3, 1, request, CancellationToken.None)
        );
    }

    [Fact]
    public async Task UTCID04_UpdateLifecycle_ValidFloweringPhase_ReturnsTreeLifecycleDto()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Gardens.Add(new Garden
        {
            GardenId = 1,
            UserId = 3,
            Name = "Test Garden",
            CreatedAt = DateTime.UtcNow
        });

        dbContext.TreeTypes.Add(new TreeType
        {
            TreeTypeId = 1,
            TreeTypeName = "Cam",
            ScientificName = "Citrus sinensis",
            SoilMasterId = 1
        });

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Growth",
            StageOrder = 1
        });

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 2,
            TreeTypeId = 1,
            StageName = "Flowering",
            StageOrder = 2
        });

        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            StageId = 1,
            VarietyId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeLifecycleRequest(
            PhaseId: "flowering",
            CycleCount: null,
            Phase1Completed: null,
            AutoSyncEnabled: null,
            OverrideReason: null
        );

        // Act
        var result = await service.UpdateLifecycleAsync(3, 1, request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.TreeId);
        Assert.Equal(2, result.StageOrder);
        Assert.Equal("Flowering", result.StageName);
        Assert.Equal("flowering", result.PhaseId);
        Assert.True(result.Phase1Completed);
    }

    [Fact]
    public async Task UTCID05_UpdateLifecycle_InvalidPhaseIdHarvesting_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Gardens.Add(new Garden
        {
            GardenId = 1,
            UserId = 3,
            Name = "Test Garden",
            CreatedAt = DateTime.UtcNow
        });

        dbContext.TreeTypes.Add(new TreeType
        {
            TreeTypeId = 1,
            TreeTypeName = "Cam",
            ScientificName = "Citrus sinensis",
            SoilMasterId = 1
        });

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Growth",
            StageOrder = 1
        });

        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            StageId = 1,
            VarietyId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeLifecycleRequest(
            PhaseId: "harvesting", // Invalid phase
            CycleCount: null,
            Phase1Completed: null,
            AutoSyncEnabled: null,
            OverrideReason: null
        );

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.UpdateLifecycleAsync(3, 1, request, CancellationToken.None)
        );

        Assert.Contains("Invalid phaseId: harvesting", exception.Message);
    }

    [Fact]
    public async Task UTCID06_UpdateLifecycle_UppercaseFlowering_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Gardens.Add(new Garden
        {
            GardenId = 1,
            UserId = 3,
            Name = "Test Garden",
            CreatedAt = DateTime.UtcNow
        });

        dbContext.TreeTypes.Add(new TreeType
        {
            TreeTypeId = 1,
            TreeTypeName = "Cam",
            ScientificName = "Citrus sinensis",
            SoilMasterId = 1
        });

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Growth",
            StageOrder = 1
        });

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 2,
            TreeTypeId = 1,
            StageName = "Flowering",
            StageOrder = 2
        });

        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            StageId = 1,
            VarietyId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeLifecycleRequest(
            PhaseId: "FLOWERING", // Case-insensitive should work (ToLower() in code)
            CycleCount: null,
            Phase1Completed: null,
            AutoSyncEnabled: null,
            OverrideReason: null
        );

        // Act
        var result = await service.UpdateLifecycleAsync(3, 1, request, CancellationToken.None);

        // Assert - Should work because code uses ToLower()
        Assert.NotNull(result);
        Assert.Equal("FLOWERING", result.PhaseId); // Original case preserved in DTO
    }

    [Fact]
    public async Task UTCID07_UpdateLifecycle_PreHarvestPhase_ReturnsCorrectStageOrder()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Gardens.Add(new Garden
        {
            GardenId = 1,
            UserId = 3,
            Name = "Test Garden",
            CreatedAt = DateTime.UtcNow
        });

        dbContext.TreeTypes.Add(new TreeType
        {
            TreeTypeId = 1,
            TreeTypeName = "Cam",
            ScientificName = "Citrus sinensis",
            SoilMasterId = 1
        });

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Growth",
            StageOrder = 1
        });

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 4,
            TreeTypeId = 1,
            StageName = "Pre-Harvest",
            StageOrder = 4
        });

        dbContext.Trees.Add(new Tree
        {
            TreeId = 10,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            StageId = 1,
            VarietyId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeLifecycleRequest(
            PhaseId: "pre_harvest",
            CycleCount: null,
            Phase1Completed: null,
            AutoSyncEnabled: null,
            OverrideReason: null
        );

        // Act
        var result = await service.UpdateLifecycleAsync(3, 10, request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(4, result.StageOrder);
        Assert.Equal("Pre-Harvest", result.StageName);
    }

    [Fact]
    public async Task UTCID08_UpdateLifecycle_StageNotExistsForTreeType_ThrowsInvalidOperationException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Gardens.Add(new Garden
        {
            GardenId = 1,
            UserId = 3,
            Name = "Test Garden",
            CreatedAt = DateTime.UtcNow
        });

        dbContext.TreeTypes.Add(new TreeType
        {
            TreeTypeId = 1,
            TreeTypeName = "Cam",
            ScientificName = "Citrus sinensis",
            SoilMasterId = 1
        });

        // No stage with StageOrder = 4 for this TreeType
        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Growth",
            StageOrder = 1
        });

        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            StageId = 1,
            VarietyId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeLifecycleRequest(
            PhaseId: "pre_harvest", // StageOrder 4
            CycleCount: null,
            Phase1Completed: null,
            AutoSyncEnabled: null,
            OverrideReason: null
        );

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.UpdateLifecycleAsync(3, 1, request, CancellationToken.None)
        );

        Assert.Contains("does not have a stage with StageOrder 4", exception.Message);
    }

    [Fact]
    public async Task UTCID09_UpdateLifecycle_GrowthDevelopmentPhase_Phase1CompletedFalse()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Gardens.Add(new Garden
        {
            GardenId = 1,
            UserId = 3,
            Name = "Test Garden",
            CreatedAt = DateTime.UtcNow
        });

        dbContext.TreeTypes.Add(new TreeType
        {
            TreeTypeId = 1,
            TreeTypeName = "Cam",
            ScientificName = "Citrus sinensis",
            SoilMasterId = 1
        });

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Growth Development",
            StageOrder = 1
        });

        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            StageId = 1,
            VarietyId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeLifecycleRequest(
            PhaseId: "growth_development",
            CycleCount: null,
            Phase1Completed: null,
            AutoSyncEnabled: null,
            OverrideReason: null
        );

        // Act
        var result = await service.UpdateLifecycleAsync(3, 1, request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.StageOrder);
        Assert.False(result.Phase1Completed); // StageOrder = 1 means phase1 not completed
    }

    [Fact]
    public async Task UTCID10_UpdateLifecycle_FloweringPhase_Phase1CompletedTrue()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Gardens.Add(new Garden
        {
            GardenId = 1,
            UserId = 3,
            Name = "Test Garden",
            CreatedAt = DateTime.UtcNow
        });

        dbContext.TreeTypes.Add(new TreeType
        {
            TreeTypeId = 1,
            TreeTypeName = "Cam",
            ScientificName = "Citrus sinensis",
            SoilMasterId = 1
        });

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Growth",
            StageOrder = 1
        });

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 2,
            TreeTypeId = 1,
            StageName = "Flowering",
            StageOrder = 2
        });

        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            StageId = 1,
            VarietyId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeLifecycleRequest(
            PhaseId: "flowering",
            CycleCount: null,
            Phase1Completed: null,
            AutoSyncEnabled: null,
            OverrideReason: null
        );

        // Act
        var result = await service.UpdateLifecycleAsync(3, 1, request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.StageOrder);
        Assert.True(result.Phase1Completed); // StageOrder > 1 means phase1 completed
    }

    [Fact]
    public async Task UTCID11_UpdateLifecycle_WithCycleCount_ReturnsCycleCountInDto()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Gardens.Add(new Garden
        {
            GardenId = 1,
            UserId = 3,
            Name = "Test Garden",
            CreatedAt = DateTime.UtcNow
        });

        dbContext.TreeTypes.Add(new TreeType
        {
            TreeTypeId = 1,
            TreeTypeName = "Cam",
            ScientificName = "Citrus sinensis",
            SoilMasterId = 1
        });

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Growth",
            StageOrder = 1
        });

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 2,
            TreeTypeId = 1,
            StageName = "Flowering",
            StageOrder = 2
        });

        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            StageId = 1,
            VarietyId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeLifecycleRequest(
            PhaseId: "flowering",
            CycleCount: 2,
            Phase1Completed: null,
            AutoSyncEnabled: null,
            OverrideReason: null
        );

        // Act
        var result = await service.UpdateLifecycleAsync(3, 1, request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.CycleCount); // CycleCount from request
    }
}
