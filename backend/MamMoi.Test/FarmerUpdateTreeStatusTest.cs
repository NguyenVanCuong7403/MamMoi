using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace MamMoi.Test;

public class FarmerUpdateTreeStatusTest
{
    [Fact]
    public async Task UTCID01_UpdateStatus_TreeIdNotExists_ReturnsFalse()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeStatusRequest(
            LeafStatus: null,
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null,
            IsActive: null,
            IsFruiting: null
        );

        // Act
        var result = await service.UpdateStatusAsync(3, 9999, request, CancellationToken.None);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task UTCID02_UpdateStatus_UserNotOwner_ThrowsUnauthorizedException()
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
            StageName = "Stage 1",
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
            LeafStatus = "Bình thường",
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeStatusRequest(
            LeafStatus: "Tốt",
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null,
            IsActive: null,
            IsFruiting: null
        );

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => service.UpdateStatusAsync(9999, 1, request, CancellationToken.None)
        );
    }

    [Fact]
    public async Task UTCID03_UpdateStatus_UpdateLeafStatusOnly_ReturnsTrue()
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
            StageName = "Stage 1",
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
            LeafStatus = "Bình thường",
            BranchStatus = "Bình thường",
            FlowerStatus = "Bình thường",
            FruitStatus = "Bình thường",
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeStatusRequest(
            LeafStatus: "Tốt",
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null,
            IsActive: null,
            IsFruiting: null
        );

        // Act
        var result = await service.UpdateStatusAsync(3, 1, request, CancellationToken.None);

        // Assert
        Assert.True(result);

        var updatedTree = await dbContext.Trees.FindAsync(1);
        Assert.Equal("Tốt", updatedTree!.LeafStatus);
        Assert.Equal("Bình thường", updatedTree.BranchStatus); // unchanged
        Assert.Equal("Bình thường", updatedTree.FlowerStatus); // unchanged
        Assert.Equal("Bình thường", updatedTree.FruitStatus); // unchanged
    }

    [Fact]
    public async Task UTCID04_UpdateStatus_UpdateAll4StatusFields_ReturnsTrue()
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
            StageName = "Stage 1",
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
            LeafStatus = "Bình thường",
            BranchStatus = "Bình thường",
            FlowerStatus = "Bình thường",
            FruitStatus = "Bình thường",
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeStatusRequest(
            LeafStatus: "Tốt",
            BranchStatus: "Khỏe",
            FlowerStatus: "Nở",
            FruitStatus: "Chín",
            IsActive: null,
            IsFruiting: null
        );

        // Act
        var result = await service.UpdateStatusAsync(3, 1, request, CancellationToken.None);

        // Assert
        Assert.True(result);

        var updatedTree = await dbContext.Trees.FindAsync(1);
        Assert.Equal("Tốt", updatedTree!.LeafStatus);
        Assert.Equal("Khỏe", updatedTree.BranchStatus);
        Assert.Equal("Nở", updatedTree.FlowerStatus);
        Assert.Equal("Chín", updatedTree.FruitStatus);
    }

    [Fact]
    public async Task UTCID05_UpdateStatus_UpdateIsActiveAndIsFruiting_ReturnsTrue()
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
            StageName = "Stage 1",
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
            IsActive = true,
            IsFruiting = false,
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeStatusRequest(
            LeafStatus: null,
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null,
            IsActive: false,
            IsFruiting: true
        );

        // Act
        var result = await service.UpdateStatusAsync(3, 1, request, CancellationToken.None);

        // Assert
        Assert.True(result);

        var updatedTree = await dbContext.Trees.FindAsync(1);
        Assert.False(updatedTree!.IsActive);
        Assert.True(updatedTree.IsFruiting);
    }

    [Fact]
    public async Task UTCID06_UpdateStatus_Update2StatusAnd1Flag_ReturnsTrue()
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
            StageName = "Stage 1",
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
            LeafStatus = "Bình thường",
            BranchStatus = "Bình thường",
            FlowerStatus = "Bình thường",
            IsFruiting = false,
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeStatusRequest(
            LeafStatus: "Tốt",
            BranchStatus: "Khỏe",
            FlowerStatus: null,
            FruitStatus: null,
            IsActive: null,
            IsFruiting: true
        );

        // Act
        var result = await service.UpdateStatusAsync(3, 1, request, CancellationToken.None);

        // Assert
        Assert.True(result);

        var updatedTree = await dbContext.Trees.FindAsync(1);
        Assert.Equal("Tốt", updatedTree!.LeafStatus);
        Assert.Equal("Khỏe", updatedTree.BranchStatus);
        Assert.Equal("Bình thường", updatedTree.FlowerStatus); // unchanged
        Assert.True(updatedTree.IsFruiting);
    }

    [Fact]
    public async Task UTCID07_UpdateStatus_OnlyLeafStatusUpdated_ActivityLogCreated()
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
            StageName = "Stage 1",
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
            LeafStatus = "Bình thường",
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeStatusRequest(
            LeafStatus: "Xuất sắc",
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null,
            IsActive: null,
            IsFruiting: null
        );

        // Act
        var result = await service.UpdateStatusAsync(3, 1, request, CancellationToken.None);

        // Assert
        Assert.True(result);

        var updatedTree = await dbContext.Trees.FindAsync(1);
        Assert.Equal("Xuất sắc", updatedTree!.LeafStatus);

        // Verify ActivityLog created
        var activityLog = await dbContext.ActivityLogs
            .FirstOrDefaultAsync(a => a.TreeId == 1 && a.ActivityType == "UpdateStatus");
        Assert.NotNull(activityLog);
        Assert.Equal(3, activityLog.UserId);
        Assert.Equal("Status changed", activityLog.ActivityDescription);
    }
}
