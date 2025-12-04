using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace MamMoi.Test;

public class FarmerUpdateTreeTest
{
    [Fact]
    public async Task UTCID01_UpdateTree_TreeIdNotExists_ReturnsNull()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeRequest(
            TreeName: "New Name",
            TreeCode: null,
            PlantDate: null,
            StageId: null,
            GardenSoilId: null,
            Location: null,
            IsFruiting: null,
            IsActive: null,
            ExpectedHarvestDate: null,
            Notes: null,
            preMonths: null,
            LeafStatus: null,
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null
        );

        // Act
        var result = await service.UpdateAsync(3, 9999, request, CancellationToken.None);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task UTCID02_UpdateTree_UserNotOwner_ThrowsUnauthorizedException()
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
            TreeName = "Old Tree",
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeRequest(
            TreeName: "New Name",
            TreeCode: null,
            PlantDate: null,
            StageId: null,
            GardenSoilId: null,
            Location: null,
            IsFruiting: null,
            IsActive: null,
            ExpectedHarvestDate: null,
            Notes: null,
            preMonths: null,
            LeafStatus: null,
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null
        );

        // Act & Assert - userId 999 không phải owner
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => service.UpdateAsync(999, 1, request, CancellationToken.None)
        );
    }

    [Fact]
    public async Task UTCID03_UpdateTree_UpdateSuccessBeforeLock_ReturnsTreeSummaryDto()
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
            TreeName = "Old Tree",
            CreatedAt = DateTime.UtcNow.AddDays(-5) // <14 days
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeRequest(
            TreeName: "New",
            TreeCode: null,
            PlantDate: null,
            StageId: null,
            GardenSoilId: null,
            Location: null,
            IsFruiting: null,
            IsActive: null,
            ExpectedHarvestDate: null,
            Notes: null,
            preMonths: null,
            LeafStatus: null,
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null
        );

        // Act
        var result = await service.UpdateAsync(3, 1, request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.TreeId);
        Assert.Equal("New", result.TreeName);

        var updatedTree = await dbContext.Trees.FindAsync(1);
        Assert.Equal("New", updatedTree!.TreeName);
    }

    [Fact]
    public async Task UTCID04_UpdateTree_UpdateTreeNameSuccess_ReturnsUpdatedName()
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
            TreeName = "Old Tree",
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeRequest(
            TreeName: "Cây mới",
            TreeCode: null,
            PlantDate: null,
            StageId: null,
            GardenSoilId: null,
            Location: null,
            IsFruiting: null,
            IsActive: null,
            ExpectedHarvestDate: null,
            Notes: null,
            preMonths: null,
            LeafStatus: null,
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null
        );

        // Act
        var result = await service.UpdateAsync(3, 1, request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Cây mới", result.TreeName);

        var updatedTree = await dbContext.Trees.FindAsync(1);
        Assert.Equal("Cây mới", updatedTree!.TreeName);
    }

    [Fact]
    public async Task UTCID05_UpdateTree_LockTreeNameAfter15Days_ThrowsInvalidOperationException()
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
            TreeName = "Old Tree",
            CreatedAt = DateTime.UtcNow.AddDays(-15) // >= 14 days (locked)
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeRequest(
            TreeName: "Cây mới",
            TreeCode: null,
            PlantDate: null,
            StageId: null,
            GardenSoilId: null,
            Location: null,
            IsFruiting: null,
            IsActive: null,
            ExpectedHarvestDate: null,
            Notes: null,
            preMonths: null,
            LeafStatus: null,
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null
        );

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.UpdateAsync(3, 1, request, CancellationToken.None)
        );

        Assert.Contains("Không thể chỉnh sửa tên cây sau 14 ngày", exception.Message);
    }

    [Fact]
    public async Task UTCID06_UpdateTree_LockTreeCodeAfter15Days_ThrowsInvalidOperationException()
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
            TreeName = "Old Tree",
            TreeCode = "C001",
            CreatedAt = DateTime.UtcNow.AddDays(-15)
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeRequest(
            TreeName: null,
            TreeCode: "C002",
            PlantDate: null,
            StageId: null,
            GardenSoilId: null,
            Location: null,
            IsFruiting: null,
            IsActive: null,
            ExpectedHarvestDate: null,
            Notes: null,
            preMonths: null,
            LeafStatus: null,
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null
        );

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.UpdateAsync(3, 1, request, CancellationToken.None)
        );

        Assert.Contains("Không thể chỉnh sửa mã cây sau 14 ngày", exception.Message);
    }

    [Fact]
    public async Task UTCID07_UpdateTree_LockPlantDateAfter20Days_ThrowsInvalidOperationException()
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
            TreeName = "Old Tree",
            PlantDate = DateOnly.Parse("2024-11-01"),
            CreatedAt = DateTime.UtcNow.AddDays(-20)
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeRequest(
            TreeName: null,
            TreeCode: null,
            PlantDate: DateOnly.Parse("2025-02-01"),
            StageId: null,
            GardenSoilId: null,
            Location: null,
            IsFruiting: null,
            IsActive: null,
            ExpectedHarvestDate: null,
            Notes: null,
            preMonths: null,
            LeafStatus: null,
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null
        );

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.UpdateAsync(3, 1, request, CancellationToken.None)
        );

        Assert.Contains("Không thể chỉnh sửa ngày trồng sau 14 ngày", exception.Message);
    }

    [Fact]
    public async Task UTCID08_UpdateTree_LockPreMonthsAfter15Days_ThrowsInvalidOperationException()
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
            TreeName = "Old Tree",
            preMonths = 0,
            CreatedAt = DateTime.UtcNow.AddDays(-15)
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeRequest(
            TreeName: null,
            TreeCode: null,
            PlantDate: null,
            StageId: null,
            GardenSoilId: null,
            Location: null,
            IsFruiting: null,
            IsActive: null,
            ExpectedHarvestDate: null,
            Notes: null,
            preMonths: 5,
            LeafStatus: null,
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null
        );

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.UpdateAsync(3, 1, request, CancellationToken.None)
        );

        Assert.Contains("Không thể chỉnh sửa tuổi trước khi trồng sau 14 ngày", exception.Message);
    }

    [Fact]
    public async Task UTCID09_UpdateTree_UpdateIsFruiting_ReturnsUpdatedValue()
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
            TreeName = "Old Tree",
            IsFruiting = false,
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeRequest(
            TreeName: null,
            TreeCode: null,
            PlantDate: null,
            StageId: null,
            GardenSoilId: null,
            Location: null,
            IsFruiting: true,
            IsActive: null,
            ExpectedHarvestDate: null,
            Notes: null,
            preMonths: null,
            LeafStatus: null,
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null
        );

        // Act
        var result = await service.UpdateAsync(3, 1, request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);

        var updatedTree = await dbContext.Trees.FindAsync(1);
        Assert.True(updatedTree!.IsFruiting);
    }

    [Fact]
    public async Task UTCID10_UpdateTree_UpdateIsActive_ReturnsUpdatedValue()
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
            TreeName = "Old Tree",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeRequest(
            TreeName: null,
            TreeCode: null,
            PlantDate: null,
            StageId: null,
            GardenSoilId: null,
            Location: null,
            IsFruiting: null,
            IsActive: false,
            ExpectedHarvestDate: null,
            Notes: null,
            preMonths: null,
            LeafStatus: null,
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null
        );

        // Act
        var result = await service.UpdateAsync(3, 1, request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);

        var updatedTree = await dbContext.Trees.FindAsync(1);
        Assert.False(updatedTree!.IsActive);
    }

    [Fact]
    public async Task UTCID11_UpdateTree_UpdateExpectedHarvestDate_ReturnsUpdatedValue()
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
            TreeName = "Old Tree",
            ExpectedHarvestDate = null,
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var newHarvestDate = DateOnly.Parse("2025-06-01");
        var request = new UpdateTreeRequest(
            TreeName: null,
            TreeCode: null,
            PlantDate: null,
            StageId: null,
            GardenSoilId: null,
            Location: null,
            IsFruiting: null,
            IsActive: null,
            ExpectedHarvestDate: newHarvestDate,
            Notes: null,
            preMonths: null,
            LeafStatus: null,
            BranchStatus: null,
            FlowerStatus: null,
            FruitStatus: null
        );

        // Act
        var result = await service.UpdateAsync(3, 1, request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);

        var updatedTree = await dbContext.Trees.FindAsync(1);
        Assert.Equal(newHarvestDate, updatedTree!.ExpectedHarvestDate);
    }

    [Fact]
    public async Task UTCID12_UpdateTree_UpdateNotesAndAllStatus_ReturnsUpdatedValues()
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
            TreeName = "Old Tree",
            Notes = null,
            LeafStatus = "Bình thường",
            BranchStatus = "Bình thường",
            FlowerStatus = "Bình thường",
            FruitStatus = "Bình thường",
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        });

        await dbContext.SaveChangesAsync();

        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        var service = new TreeCommandService(dbContext, mockSubscriptionService.Object);

        var request = new UpdateTreeRequest(
            TreeName: null,
            TreeCode: null,
            PlantDate: null,
            StageId: null,
            GardenSoilId: null,
            Location: null,
            IsFruiting: null,
            IsActive: null,
            ExpectedHarvestDate: null,
            Notes: "Cần tưới nhiều",
            preMonths: null,
            LeafStatus: "Tốt",
            BranchStatus: "Khỏe",
            FlowerStatus: "Nở",
            FruitStatus: "Chín"
        );

        // Act
        var result = await service.UpdateAsync(3, 1, request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);

        var updatedTree = await dbContext.Trees.FindAsync(1);
        Assert.Equal("Cần tưới nhiều", updatedTree!.Notes);
        Assert.Equal("Tốt", updatedTree.LeafStatus);
        Assert.Equal("Khỏe", updatedTree.BranchStatus);
        Assert.Equal("Nở", updatedTree.FlowerStatus);
        Assert.Equal("Chín", updatedTree.FruitStatus);

        // Verify ActivityLog created
        var activityLog = await dbContext.ActivityLogs
            .FirstOrDefaultAsync(a => a.TreeId == 1 && a.ActivityType == "UpdateTree");
        Assert.NotNull(activityLog);
    }
}
