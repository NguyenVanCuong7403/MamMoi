using Moq;
using Xunit;
using MamMoi.Application.Interfaces;
using MamMoi.Application.DTOs;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Test;

/// <summary>
/// Test class cho TreeCommandService.CreateAsync
/// Requirement: RQ-Tree-001
/// Function: CreateAsync - Tạo cây mới trong vườn
/// Test cases: 8 (UTCID01 - UTCID08)
/// </summary>
public class FarmerCreateTreeTest
{
    [Fact]
    public async Task UTCID01_CreateTree_UserNotOwner_ThrowsUnauthorizedException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data: Garden owned by userId=3
        dbContext.Gardens.Add(new Garden
        {
            GardenId = 1,
            UserId = 3,
            Name = "Test Garden",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new CreateTreeRequest(
            GardenId: 1,
            TreeTypeId: 1,
            StageId: 1,
            TreeVarietyId: 1,
            TreeCode: null,
            TreeName: "Cây cam",
            PlantDate: null,
            GardenSoilId: null
        );

        // Act & Assert - userId=999 không phải owner
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => service.CreateAsync(999, request, CancellationToken.None));

        Assert.Contains("User is not garden owner", exception.Message);
    }

    [Fact]
    public async Task UTCID02_CreateTree_StageNotBelongToTreeType_ThrowsInvalidOperationException()
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

        // TreeType 1 has StageId 1
        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Stage 1",
            StageOrder = 1
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new CreateTreeRequest(
            GardenId: 1,
            TreeTypeId: 1,
            StageId: 999, // Invalid StageId
            TreeVarietyId: 1,
            TreeCode: null,
            TreeName: "Cây cam",
            PlantDate: null,
            GardenSoilId: null
        );

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateAsync(3, request, CancellationToken.None));

        Assert.Contains("Stage does not belong to TreeType", exception.Message);
    }

    [Fact]
    public async Task UTCID03_CreateTree_GardenSoilNotMatchGarden_ThrowsInvalidOperationException()
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

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Stage 1",
            StageOrder = 1
        });

        dbContext.TreeTypes.Add(new TreeType
        {
            TreeTypeId = 1,
            TreeTypeName = "Cam",
            ScientificName = "Citrus sinensis",
            SoilMasterId = 1
        });

        // GardenSoil thuộc GardenId=2 (không phải GardenId=1)
        dbContext.GardenSoils.Add(new GardenSoil
        {
            GardenSoilId = 1,
            GardenId = 2,
            SoilMasterId = 1,
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new CreateTreeRequest(
            GardenId: 1,
            TreeTypeId: 1,
            StageId: 1,
            TreeVarietyId: 1,
            TreeCode: null,
            TreeName: "Cây cam",
            PlantDate: null,
            GardenSoilId: 1 // GardenSoilId belongs to GardenId=2
        );

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateAsync(3, request, CancellationToken.None));

        Assert.Contains("GardenSoil does not match Garden/TreeType", exception.Message);
    }

    [Fact]
    public async Task UTCID04_CreateTree_ValidInput_ReturnsTreeCreatedDto()
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

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Stage 1",
            StageOrder = 1
        });

        dbContext.TreeTypes.Add(new TreeType
        {
            TreeTypeId = 1,
            TreeTypeName = "Cam",
            ScientificName = "Citrus sinensis",
            SoilMasterId = 1
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new CreateTreeRequest(
            GardenId: 1,
            TreeTypeId: 1,
            StageId: 1,
            TreeVarietyId: 1,
            TreeCode: null,
            TreeName: "Cây cam",
            PlantDate: null,
            GardenSoilId: null
        );

        // Act
        var result = await service.CreateAsync(3, request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.TreeId > 0);

        // Verify tree was created in database
        var tree = await dbContext.Trees.FindAsync(result.TreeId);
        Assert.NotNull(tree);
        Assert.Equal("Cây cam", tree.TreeName);
        Assert.Equal(1, tree.GardenId);
    }

    [Fact]
    public async Task UTCID05_CreateTree_TreeCodeNull_ReturnsTreeWithNullCode()
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

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Stage 1",
            StageOrder = 1
        });

        dbContext.TreeTypes.Add(new TreeType
        {
            TreeTypeId = 1,
            TreeTypeName = "Bưởi",
            ScientificName = "Citrus maxima",
            SoilMasterId = 1
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new CreateTreeRequest(
            GardenId: 1,
            TreeTypeId: 1,
            StageId: 1,
            TreeVarietyId: 1,
            TreeCode: null,
            TreeName: "Cây bưởi",
            PlantDate: null,
            GardenSoilId: null
        );

        // Act
        var result = await service.CreateAsync(3, request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        var tree = await dbContext.Trees.FindAsync(result.TreeId);
        Assert.NotNull(tree);
        Assert.Null(tree.TreeCode);
        Assert.Equal("Cây bưởi", tree.TreeName);
    }

    [Fact]
    public async Task UTCID06_CreateTree_DefaultStatusValues_SetsCorrectDefaults()
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

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Stage 1",
            StageOrder = 1
        });

        dbContext.TreeTypes.Add(new TreeType
        {
            TreeTypeId = 1,
            TreeTypeName = "Chanh",
            ScientificName = "Citrus limon",
            SoilMasterId = 1
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new CreateTreeRequest(
            GardenId: 1,
            TreeTypeId: 1,
            StageId: 1,
            TreeVarietyId: 1,
            TreeCode: null,
            TreeName: "Cây chanh",
            PlantDate: null,
            GardenSoilId: null,
            Location: null,
            Notes: null,
            preMonths: 0,
            LeafStatus: null,
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null
        );

        // Act
        var result = await service.CreateAsync(3, request, CancellationToken.None);

        // Assert
        var tree = await dbContext.Trees.FindAsync(result.TreeId);
        Assert.NotNull(tree);
        Assert.Equal("Bình thường", tree.LeafStatus);
        Assert.Equal("Bình thường", tree.BranchStatus);
        Assert.Equal("Bình thường", tree.FlowerStatus);
        Assert.Equal("Bình thường", tree.FruitStatus);
    }

    [Fact]
    public async Task UTCID07_CreateTree_DefaultFlags_SetsIsActiveTrueAndIsFruitingFalse()
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

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Stage 1",
            StageOrder = 1
        });

        dbContext.TreeTypes.Add(new TreeType
        {
            TreeTypeId = 1,
            TreeTypeName = "Mít",
            ScientificName = "Artocarpus heterophyllus",
            SoilMasterId = 1
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new CreateTreeRequest(
            GardenId: 1,
            TreeTypeId: 1,
            StageId: 1,
            TreeVarietyId: 1,
            TreeCode: null,
            TreeName: "Cây mít",
            PlantDate: null,
            GardenSoilId: null,
            Location: null,
            Notes: null,
            preMonths: 0,
            LeafStatus: null,
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null,
            IsFruiting: null,
            IsActive: null
        );

        // Act
        var result = await service.CreateAsync(3, request, CancellationToken.None);

        // Assert
        var tree = await dbContext.Trees.FindAsync(result.TreeId);
        Assert.NotNull(tree);
        Assert.True(tree.IsActive);
        Assert.False(tree.IsFruiting);
    }

    [Fact]
    public async Task UTCID08_CreateTree_ActivityLogAutoCreated_VerifyActivityLogExists()
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

        dbContext.TreeGrowthStages.Add(new TreeGrowthStage
        {
            StageId = 1,
            TreeTypeId = 1,
            StageName = "Stage 1",
            StageOrder = 1
        });

        dbContext.TreeTypes.Add(new TreeType
        {
            TreeTypeId = 1,
            TreeTypeName = "Xoài",
            ScientificName = "Mangifera indica",
            SoilMasterId = 1
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new CreateTreeRequest(
            GardenId: 1,
            TreeTypeId: 1,
            StageId: 1,
            TreeVarietyId: 1,
            TreeCode: null,
            TreeName: "Cây xoài",
            PlantDate: null,
            GardenSoilId: null
        );

        // Act
        var result = await service.CreateAsync(3, request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        
        // BUG-001: Verify ActivityLog was created
        var activityLog = await dbContext.ActivityLogs
            .FirstOrDefaultAsync(a => a.TreeId == result.TreeId && a.ActivityType == "CreateTree");
        
        Assert.NotNull(activityLog);
        Assert.Equal(3, activityLog.UserId);
        Assert.Equal("CreateTree", activityLog.ActivityType);
        Assert.Contains("Cây xoài", activityLog.ActivityDescription);
    }
}
