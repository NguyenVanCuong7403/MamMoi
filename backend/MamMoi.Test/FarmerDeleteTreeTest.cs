using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace MamMoi.Test;

public class FarmerDeleteTreeTest
{
    [Fact]
    public async Task UTCID01_DeleteTree_TreeIdNotExists_ReturnsFalse()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        // Act
        var result = await service.DeleteAsync(3, 9999, CancellationToken.None);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task UTCID02_DeleteTree_UserNotOwner_ThrowsUnauthorizedException()
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

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => service.DeleteAsync(5, 1, CancellationToken.None)
        );
    }

    [Fact]
    public async Task UTCID03_DeleteTree_ValidRequest_ReturnsTrue()
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

        // Act
        var result = await service.DeleteAsync(3, 1, CancellationToken.None);

        // Assert
        Assert.True(result);

        // Verify tree was removed from database
        var deletedTree = await dbContext.Trees.FindAsync(1);
        Assert.Null(deletedTree);
    }

    [Fact]
    public async Task UTCID04_DeleteTree_TreeWithRelatedData_ReturnsTrue()
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
            TreeId = 2,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            StageId = 1,
            VarietyId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });

        // Add related ActivityLog (FK constraint)
        dbContext.ActivityLogs.Add(new ActivityLog
        {
            LogId = 1,
            UserId = 3,
            TreeId = 2,
            ActivityType = "Test",
            ActivityDescription = "Test log",
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        // Act
        var result = await service.DeleteAsync(3, 2, CancellationToken.None);

        // Assert - InMemory allows delete despite related data
        Assert.True(result);

        // Verify tree was removed
        var deletedTree = await dbContext.Trees.FindAsync(2);
        Assert.Null(deletedTree);
        
        // Note: InMemory doesn't consistently enforce CASCADE behavior
        // In real DB with CASCADE DELETE, ActivityLog would be removed
    }

    [Fact]
    public async Task UTCID05_DeleteTree_MultipleRelatedRecords_ReturnsTrue()
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
            TreeId = 3,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            StageId = 1,
            VarietyId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });

        // Add multiple related records
        dbContext.ActivityLogs.Add(new ActivityLog
        {
            LogId = 1,
            UserId = 3,
            TreeId = 3,
            ActivityType = "CreateTree",
            ActivityDescription = "Created",
            CreatedAt = DateTime.UtcNow
        });

        dbContext.ActivityLogs.Add(new ActivityLog
        {
            LogId = 2,
            UserId = 3,
            TreeId = 3,
            ActivityType = "UpdateTree",
            ActivityDescription = "Updated",
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        // Act
        var result = await service.DeleteAsync(3, 3, CancellationToken.None);

        // Assert
        Assert.True(result);

        // Verify hard delete - tree removed from DB
        var deletedTree = await dbContext.Trees.FindAsync(3);
        Assert.Null(deletedTree);
        
        // Note: In real DB, ActivityLogs would be CASCADE deleted based on FK config
    }

    [Fact]
    public async Task UTCID06_DeleteTree_SaveChangesAsyncCalled_TreeRemovedPermanently()
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
            TreeId = 5,
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

        // Act
        var result = await service.DeleteAsync(3, 5, CancellationToken.None);

        // Assert
        Assert.True(result);

        // Verify tree count decreased
        var treeCount = await dbContext.Trees.CountAsync();
        Assert.Equal(0, treeCount);

        // Verify tree permanently removed (cannot be found)
        var tree = await dbContext.Trees.FirstOrDefaultAsync(t => t.TreeId == 5);
        Assert.Null(tree);
    }
}
