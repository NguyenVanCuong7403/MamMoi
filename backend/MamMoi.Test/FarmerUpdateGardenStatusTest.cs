using Moq;
using Xunit;
using MamMoi.Application.Interfaces;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Services.Gardens;
using MamMoi.Application.DTOs.Garden;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Test;

/// <summary>
/// Test class cho GardenService.UpdateGardenStatusAsync
/// Requirement: RQ-Garden-005
/// Function: UpdateGardenStatusAsync - Cập nhật trạng thái vườn (chỉ owner)
/// Lines of code: 26
/// Test cases: 6 (UTCID01 - UTCID06)
/// </summary>
public class FarmerUpdateGardenStatusTest
{
    [Fact]
    public async Task UTCID01_UpdateGardenStatus_GardenNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var mockGardenRepo = new Mock<IGardenRepository>();
        var mockUserRepo = new Mock<IUserRepository>();
        var mockGardenMemberRepo = new Mock<IGardenMemberRepository>();
        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var gardenService = new GardenService(
            mockGardenRepo.Object,
            mockUserRepo.Object,
            mockGardenMemberRepo.Object,
            dbContext,
            mockSubscriptionService.Object
        );

        int gardenId = 9999;
        int userId = 3;
        string status = "Active";

        // Mock: IsOwnerAsync returns true
        mockGardenRepo.Setup(x => x.IsOwnerAsync(gardenId, userId))
            .ReturnsAsync(true);

        // Mock: Garden không tồn tại
        mockGardenRepo.Setup(x => x.GetByIdAsync(gardenId))
            .ReturnsAsync((Garden?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(
            () => gardenService.UpdateGardenStatusAsync(gardenId, userId, status));

        Assert.Contains($"Không tìm thấy vườn với ID {gardenId}", exception.Message);
    }

    [Fact]
    public async Task UTCID02_UpdateGardenStatus_UserNotOwner_ThrowsUnauthorizedException()
    {
        // Arrange
        var mockGardenRepo = new Mock<IGardenRepository>();
        var mockUserRepo = new Mock<IUserRepository>();
        var mockGardenMemberRepo = new Mock<IGardenMemberRepository>();
        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var gardenService = new GardenService(
            mockGardenRepo.Object,
            mockUserRepo.Object,
            mockGardenMemberRepo.Object,
            dbContext,
            mockSubscriptionService.Object
        );

        int gardenId = 1;
        int userId = 999;
        string status = "Active";

        // Mock: User không phải owner
        mockGardenRepo.Setup(x => x.IsOwnerAsync(gardenId, userId))
            .ReturnsAsync(false);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => gardenService.UpdateGardenStatusAsync(gardenId, userId, status));

        Assert.Contains("Chỉ chủ vườn mới có quyền cập nhật trạng thái", exception.Message);
    }

    [Fact]
    public async Task UTCID03_UpdateGardenStatus_UpdateToActive_ReturnsUpdatedDto()
    {
        // Arrange
        var mockGardenRepo = new Mock<IGardenRepository>();
        var mockUserRepo = new Mock<IUserRepository>();
        var mockGardenMemberRepo = new Mock<IGardenMemberRepository>();
        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var gardenService = new GardenService(
            mockGardenRepo.Object,
            mockUserRepo.Object,
            mockGardenMemberRepo.Object,
            dbContext,
            mockSubscriptionService.Object
        );

        int gardenId = 1;
        int userId = 3;
        string newStatus = "Active";

        // Mock: User là owner
        mockGardenRepo.Setup(x => x.IsOwnerAsync(gardenId, userId))
            .ReturnsAsync(true);

        // Mock: Garden tồn tại với status cũ
        var user = new User
        {
            UserId = userId,
            RoleId = 3,
            FullName = "Test Farmer",
            Email = "farmer@example.com"
        };

        var garden = new Garden
        {
            GardenId = gardenId,
            UserId = userId,
            Name = "Test Garden",
            Location = "Hanoi",
            Status = "Inactive",
            CreatedAt = DateTime.Now,
            User = user,
            Trees = new List<Tree>(),
            GardenMembers = new List<GardenMember>()
        };

        // Mock GetByIdAsync - returns same garden instance
        mockGardenRepo.Setup(x => x.GetByIdAsync(gardenId))
            .ReturnsAsync(garden);

        // Mock UpdateAsync
        mockGardenRepo.Setup(x => x.UpdateAsync(It.IsAny<object>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await gardenService.UpdateGardenStatusAsync(gardenId, userId, newStatus);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Active", result.Status);
    }

    [Fact]
    public async Task UTCID04_UpdateGardenStatus_UpdateToInactive_ReturnsUpdatedDto()
    {
        // Arrange
        var mockGardenRepo = new Mock<IGardenRepository>();
        var mockUserRepo = new Mock<IUserRepository>();
        var mockGardenMemberRepo = new Mock<IGardenMemberRepository>();
        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var gardenService = new GardenService(
            mockGardenRepo.Object,
            mockUserRepo.Object,
            mockGardenMemberRepo.Object,
            dbContext,
            mockSubscriptionService.Object
        );

        int gardenId = 1;
        int userId = 3;
        string newStatus = "Inactive";

        // Mock: User là owner
        mockGardenRepo.Setup(x => x.IsOwnerAsync(gardenId, userId))
            .ReturnsAsync(true);

        // Mock: Garden tồn tại với status cũ
        var user = new User
        {
            UserId = userId,
            RoleId = 3,
            FullName = "Test Farmer",
            Email = "farmer@example.com"
        };

        var garden = new Garden
        {
            GardenId = gardenId,
            UserId = userId,
            Name = "Test Garden",
            Location = "Hanoi",
            Status = "Active",
            CreatedAt = DateTime.Now,
            User = user,
            Trees = new List<Tree>(),
            GardenMembers = new List<GardenMember>()
        };

        // Mock GetByIdAsync - returns same garden instance
        mockGardenRepo.Setup(x => x.GetByIdAsync(gardenId))
            .ReturnsAsync(garden);

        // Mock UpdateAsync
        mockGardenRepo.Setup(x => x.UpdateAsync(It.IsAny<object>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await gardenService.UpdateGardenStatusAsync(gardenId, userId, newStatus);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Inactive", result.Status);
    }

    [Fact]
    public async Task UTCID05_UpdateGardenStatus_StatusWithWhitespace_TrimWhitespace()
    {
        // Arrange
        var mockGardenRepo = new Mock<IGardenRepository>();
        var mockUserRepo = new Mock<IUserRepository>();
        var mockGardenMemberRepo = new Mock<IGardenMemberRepository>();
        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var gardenService = new GardenService(
            mockGardenRepo.Object,
            mockUserRepo.Object,
            mockGardenMemberRepo.Object,
            dbContext,
            mockSubscriptionService.Object
        );

        int gardenId = 1;
        int userId = 3;
        string statusWithWhitespace = "  Active  ";

        // Mock: User là owner
        mockGardenRepo.Setup(x => x.IsOwnerAsync(gardenId, userId))
            .ReturnsAsync(true);

        // Mock: Garden tồn tại
        var user = new User
        {
            UserId = userId,
            RoleId = 3,
            FullName = "Test Farmer",
            Email = "farmer@example.com"
        };

        var garden = new Garden
        {
            GardenId = gardenId,
            UserId = userId,
            Name = "Test Garden",
            Location = "Hanoi",
            Status = "Inactive",
            CreatedAt = DateTime.Now,
            User = user,
            Trees = new List<Tree>(),
            GardenMembers = new List<GardenMember>()
        };

        // Mock GetByIdAsync
        mockGardenRepo.Setup(x => x.GetByIdAsync(gardenId))
            .ReturnsAsync(garden);

        // Mock UpdateAsync
        mockGardenRepo.Setup(x => x.UpdateAsync(It.IsAny<object>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await gardenService.UpdateGardenStatusAsync(gardenId, userId, statusWithWhitespace);

        // Assert
        Assert.NotNull(result);
        // BUG: Code không trim whitespace, expect "Active" nhưng sẽ fail
        Assert.Equal("Active", result.Status);
    }

    [Fact]
    public async Task UTCID06_UpdateGardenStatus_StatusNull_ThrowsArgumentException()
    {
        // Arrange
        var mockGardenRepo = new Mock<IGardenRepository>();
        var mockUserRepo = new Mock<IUserRepository>();
        var mockGardenMemberRepo = new Mock<IGardenMemberRepository>();
        var mockSubscriptionService = new Mock<ISubscriptionPlanService>();
        
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var gardenService = new GardenService(
            mockGardenRepo.Object,
            mockUserRepo.Object,
            mockGardenMemberRepo.Object,
            dbContext,
            mockSubscriptionService.Object
        );

        int gardenId = 1;
        int userId = 3;
        string? nullStatus = null;

        // Mock: User là owner
        mockGardenRepo.Setup(x => x.IsOwnerAsync(gardenId, userId))
            .ReturnsAsync(true);

        // Mock: Garden tồn tại
        var user = new User
        {
            UserId = userId,
            RoleId = 3,
            FullName = "Test Farmer",
            Email = "farmer@example.com"
        };

        var garden = new Garden
        {
            GardenId = gardenId,
            UserId = userId,
            Name = "Test Garden",
            Location = "Hanoi",
            Status = "Active",
            CreatedAt = DateTime.Now,
            User = user,
            Trees = new List<Tree>(),
            GardenMembers = new List<GardenMember>()
        };

        mockGardenRepo.Setup(x => x.GetByIdAsync(gardenId))
            .ReturnsAsync(garden);

        // Act & Assert
        // BUG-001: Code không validate null, expect ArgumentException nhưng sẽ fail
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => gardenService.UpdateGardenStatusAsync(gardenId, userId, nullStatus!));
    }
}
