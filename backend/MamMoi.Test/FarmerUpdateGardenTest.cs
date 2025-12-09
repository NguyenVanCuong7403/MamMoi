using MamMoi.Application.DTOs.Garden;
using MamMoi.Application.Interfaces;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services.Gardens;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace MamMoi.Test;

/// <summary>
/// RQ-Garden-004: GardenService.UpdateGardenAsync
/// Requirement Name: Cập nhật thông tin vườn
/// Class Name: GardenService
/// Function Name: UpdateGardenAsync
/// Function Code: public async Task<GardenResponseDto> UpdateGardenAsync(int gardenId, int userId, UpdateGardenDto dto)
/// Sheet Name: FarmerUpdateGardenTest
/// Description: Kiểm thử white-box function UpdateGardenAsync, bao gồm:
///   - Kiểm tra IsOwnerAsync (chỉ owner mới update được)
///   - Kiểm tra gardenId không tồn tại → throw KeyNotFoundException
///   - Kiểm tra update Name (trim whitespace)
///   - Kiểm tra update Location (allow null/empty)
///   - Kiểm tra update Status
/// Pre-Condition: 
///   - GardenId hợp lệ và tồn tại
///   - UserId phải là Owner của garden
///   - UpdateGardenDto có ít nhất 1 field cần update
///   - IsOwnerAsync và GetByIdAsync hoạt động
/// Test Type: White-box testing
/// Total Test Cases: 7
/// </summary>
public class FarmerUpdateGardenTest
{
    [Fact]
    public async Task UTCID01_UpdateGarden_GardenNotFound_ThrowsKeyNotFoundException()
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

        int gardenId = 9999; // Garden không tồn tại
        int userId = 3;
        var dto = new UpdateGardenDto { Name = "New Name" };

        // Mock: User là Owner (pass step 1)
        mockGardenRepo.Setup(x => x.IsOwnerAsync(gardenId, userId))
            .ReturnsAsync(true);

        // Mock: Garden không tồn tại
        mockGardenRepo.Setup(x => x.GetByIdAsync(gardenId))
            .ReturnsAsync((Garden?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(
            () => gardenService.UpdateGardenAsync(gardenId, userId, dto));

        Assert.Contains($"Không tìm thấy vườn với ID {gardenId}", exception.Message);
        
        mockGardenRepo.Verify(x => x.IsOwnerAsync(gardenId, userId), Times.Once);
        mockGardenRepo.Verify(x => x.GetByIdAsync(gardenId), Times.Once);
        mockGardenRepo.Verify(x => x.UpdateAsync(It.IsAny<Garden>()), Times.Never);
    }

    [Fact]
    public async Task UTCID02_UpdateGarden_UserNotOwner_ThrowsUnauthorizedException()
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
        int userId = 999; // User không phải Owner
        var dto = new UpdateGardenDto { Name = "New Name" };

        // Mock: User KHÔNG phải Owner
        mockGardenRepo.Setup(x => x.IsOwnerAsync(gardenId, userId))
            .ReturnsAsync(false);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => gardenService.UpdateGardenAsync(gardenId, userId, dto));

        Assert.Equal("Chỉ chủ vườn mới có quyền cập nhật thông tin.", exception.Message);
        
        mockGardenRepo.Verify(x => x.IsOwnerAsync(gardenId, userId), Times.Once);
        mockGardenRepo.Verify(x => x.GetByIdAsync(It.IsAny<int>()), Times.Never);
        mockGardenRepo.Verify(x => x.UpdateAsync(It.IsAny<Garden>()), Times.Never);
    }

    [Fact]
    public async Task UTCID03_UpdateGarden_UpdateName_TrimsWhitespace()
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
        var dto = new UpdateGardenDto { Name = "  Vườn mới  " }; // With spaces

        // Mock: User là Owner
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
            Name = "Old Name",
            Location = "Hanoi",
            Status = "Đang hoạt động",
            CreatedAt = DateTime.Now,
            User = user,
            Trees = new List<Tree>(),
            GardenMembers = new List<GardenMember>()
        };

        mockGardenRepo.Setup(x => x.GetByIdAsync(gardenId))
            .ReturnsAsync(garden);

        mockGardenRepo.Setup(x => x.UpdateAsync(It.IsAny<Garden>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await gardenService.UpdateGardenAsync(gardenId, userId, dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Vườn mới", result.Name); // Should be trimmed
        
        // Verify: UpdateAsync was called with trimmed name
        mockGardenRepo.Verify(x => x.UpdateAsync(It.Is<Garden>(g => g.Name == "Vườn mới")), Times.Once);
    }

    [Fact]
    public async Task UTCID04_UpdateGarden_UpdateLocationNull_ClearsLocation()
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
        var dto = new UpdateGardenDto { Location = "" }; // Empty string to clear

        // Mock: User là Owner
        mockGardenRepo.Setup(x => x.IsOwnerAsync(gardenId, userId))
            .ReturnsAsync(true);

        // Mock: Garden tồn tại với Location
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
            Location = "Old Location",
            Status = "Đang hoạt động",
            CreatedAt = DateTime.Now,
            User = user,
            Trees = new List<Tree>(),
            GardenMembers = new List<GardenMember>()
        };

        mockGardenRepo.Setup(x => x.GetByIdAsync(gardenId))
            .ReturnsAsync(garden);

        mockGardenRepo.Setup(x => x.UpdateAsync(It.IsAny<Garden>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await gardenService.UpdateGardenAsync(gardenId, userId, dto);

        // Assert
        Assert.NotNull(result);
        Assert.Null(result.Location); // Should be cleared to null
        
        mockGardenRepo.Verify(x => x.UpdateAsync(It.Is<Garden>(g => g.Location == null)), Times.Once);
    }

    [Fact]
    public async Task UTCID05_UpdateGarden_UpdateLocationValid_SetsNewLocation()
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
        var dto = new UpdateGardenDto { Location = "Hà Nội" };

        // Mock: User là Owner
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
            Location = "Old Location",
            Status = "Đang hoạt động",
            CreatedAt = DateTime.Now,
            User = user,
            Trees = new List<Tree>(),
            GardenMembers = new List<GardenMember>()
        };

        mockGardenRepo.Setup(x => x.GetByIdAsync(gardenId))
            .ReturnsAsync(garden);

        mockGardenRepo.Setup(x => x.UpdateAsync(It.IsAny<Garden>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await gardenService.UpdateGardenAsync(gardenId, userId, dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Hà Nội", result.Location);
        
        mockGardenRepo.Verify(x => x.UpdateAsync(It.Is<Garden>(g => g.Location == "Hà Nội")), Times.Once);
    }

    [Fact]
    public async Task UTCID06_UpdateGarden_UpdateStatus_SetsNewStatus()
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
        var dto = new UpdateGardenDto { Status = "Ngưng hoạt động" };

        // Mock: User là Owner
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
            Status = "Đang hoạt động",
            CreatedAt = DateTime.Now,
            User = user,
            Trees = new List<Tree>(),
            GardenMembers = new List<GardenMember>()
        };

        mockGardenRepo.Setup(x => x.GetByIdAsync(gardenId))
            .ReturnsAsync(garden);

        mockGardenRepo.Setup(x => x.UpdateAsync(It.IsAny<Garden>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await gardenService.UpdateGardenAsync(gardenId, userId, dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Ngưng hoạt động", result.Status);
        
        mockGardenRepo.Verify(x => x.UpdateAsync(It.Is<Garden>(g => g.Status == "Ngưng hoạt động")), Times.Once);
    }

    [Fact]
    public async Task UTCID07_UpdateGarden_UpdateMultipleFields_AllFieldsUpdated()
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
        var dto = new UpdateGardenDto 
        { 
            Name = "  New Name  ",
            Location = "  TP HCM  ",
            Status = "  Đang hoạt động  "
        };

        // Mock: User là Owner
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
            Name = "Old Name",
            Location = "Old Location",
            Status = "Old Status",
            CreatedAt = DateTime.Now,
            User = user,
            Trees = new List<Tree>(),
            GardenMembers = new List<GardenMember>()
        };

        mockGardenRepo.Setup(x => x.GetByIdAsync(gardenId))
            .ReturnsAsync(garden);

        mockGardenRepo.Setup(x => x.UpdateAsync(It.IsAny<Garden>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await gardenService.UpdateGardenAsync(gardenId, userId, dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("New Name", result.Name); // Trimmed
        Assert.Equal("TP HCM", result.Location); // Trimmed
        Assert.Equal("Đang hoạt động", result.Status); // Trimmed
        
        mockGardenRepo.Verify(x => x.UpdateAsync(It.Is<Garden>(g => 
            g.Name == "New Name" && 
            g.Location == "TP HCM" && 
            g.Status == "Đang hoạt động"
        )), Times.Once);
    }
}
