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
/// RQ-Garden-003: GardenService.GetGardenByIdAsync
/// Requirement Name: Xem chi tiết 1 vườn
/// Class Name: GardenService
/// Function Name: GetGardenByIdAsync
/// Function Code: public async Task<GardenResponseDto> GetGardenByIdAsync(int gardenId, int userId)
/// Sheet Name: FarmerGetGardenByIdTest
/// Description: Kiểm thử white-box function GetGardenByIdAsync, bao gồm:
///   - Kiểm tra HasAccessAsync (user có quyền truy cập không)
///   - Kiểm tra gardenId không tồn tại → throw KeyNotFoundException
///   - Kiểm tra userId không có quyền → throw UnauthorizedAccessException
///   - Kiểm tra return GardenResponseDto với IsOwner đúng
/// Pre-Condition: 
///   - Database InMemory được sử dụng
///   - Mock IGardenRepository.HasAccessAsync và GetByIdAsync
///   - Garden phải có User navigation property
/// Test Type: White-box testing
/// Total Test Cases: 3
/// </summary>
public class FarmerGetGardenByIdTest
{
    [Fact]
    public async Task UTCID01_GetGardenById_GardenNotFound_ThrowsKeyNotFoundException()
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

        // Mock: User có quyền truy cập (pass step 1)
        mockGardenRepo.Setup(x => x.HasAccessAsync(gardenId, userId))
            .ReturnsAsync(true);

        // Mock: Garden không tồn tại
        mockGardenRepo.Setup(x => x.GetByIdAsync(gardenId))
            .ReturnsAsync((Garden?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(
            () => gardenService.GetGardenByIdAsync(gardenId, userId));

        Assert.Contains($"Không tìm thấy vườn với ID {gardenId}", exception.Message);
        
        // Verify: HasAccessAsync được gọi
        mockGardenRepo.Verify(x => x.HasAccessAsync(gardenId, userId), Times.Once);
        
        // Verify: GetByIdAsync được gọi
        mockGardenRepo.Verify(x => x.GetByIdAsync(gardenId), Times.Once);
    }

    [Fact]
    public async Task UTCID02_GetGardenById_UserNoAccess_ThrowsUnauthorizedException()
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
        int userId = 999; // User không có quyền truy cập

        // Mock: User KHÔNG có quyền truy cập
        mockGardenRepo.Setup(x => x.HasAccessAsync(gardenId, userId))
            .ReturnsAsync(false);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => gardenService.GetGardenByIdAsync(gardenId, userId));

        Assert.Equal("Bạn không có quyền truy cập vườn này.", exception.Message);
        
        // Verify: HasAccessAsync được gọi
        mockGardenRepo.Verify(x => x.HasAccessAsync(gardenId, userId), Times.Once);
        
        // Verify: GetByIdAsync KHÔNG được gọi (vì đã fail ở bước HasAccess)
        mockGardenRepo.Verify(x => x.GetByIdAsync(It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task UTCID03_GetGardenById_ValidAccess_ReturnsGardenResponseDto()
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
        int userId = 3; // Owner

        // Mock: User có quyền truy cập
        mockGardenRepo.Setup(x => x.HasAccessAsync(gardenId, userId))
            .ReturnsAsync(true);

        // Mock: Garden tồn tại với đầy đủ navigation properties
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
            Name = "My Garden",
            Location = "Hanoi",
            Status = "Đang hoạt động",
            CreatedAt = DateTime.Now,
            User = user, // Populate User navigation property
            Trees = new List<Tree> // Empty trees list
            {
                new Tree { TreeId = 1, TreeName = "Tree 1" },
                new Tree { TreeId = 2, TreeName = "Tree 2" }
            },
            GardenMembers = new List<GardenMember>()
        };

        mockGardenRepo.Setup(x => x.GetByIdAsync(gardenId))
            .ReturnsAsync(garden);

        // Act
        var result = await gardenService.GetGardenByIdAsync(gardenId, userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(gardenId, result.GardenId);
        Assert.Equal("My Garden", result.Name);
        Assert.Equal("Hanoi", result.Location);
        Assert.Equal(userId, result.UserId);
        Assert.True(result.IsOwner); // userId == garden.UserId → IsOwner = true
        Assert.Equal("Test Farmer", result.OwnerName);
        Assert.Equal(2, result.Statistics.TotalTrees);
        
        // Verify: Both methods were called
        mockGardenRepo.Verify(x => x.HasAccessAsync(gardenId, userId), Times.Once);
        mockGardenRepo.Verify(x => x.GetByIdAsync(gardenId), Times.Once);
    }
}
