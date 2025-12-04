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
/// RQ-Garden-002: GardenService.GetGardensAsync
/// Requirement Name: Lấy danh sách vườn của user với phân trang và tìm kiếm
/// Class Name: GardenService
/// Function Name: GetGardensAsync
/// Function Code: public async Task<GardenListResponseDto> GetGardensAsync(int userId, int pageNumber = 1, int pageSize = 10, string? searchTerm = null)
/// Sheet Name: FarmerGetGardensTest
/// Description: Kiểm thử white-box function GetGardensAsync, bao gồm:
///   - Kiểm tra pagination parameters validation (pageNumber, pageSize)
///   - Kiểm tra auto-correct: pageNumber < 1 → 1, pageSize < 1 → 10, pageSize > 100 → 100
///   - Kiểm tra searchTerm == null / != null
///   - Kiểm tra Farmer xem vườn mình sở hữu (IsOwner = true)
///   - Kiểm tra mapping DTO: GardenId, Name, Location, TotalTrees, IsOwner
///   - Kiểm tra pagination info: TotalCount, PageNumber, PageSize
/// Pre-Condition: 
///   - Database InMemory được sử dụng
///   - Mock IGardenRepository.GetGardensByUserIdAsync
///   - UserId hợp lệ (RoleId = 3 cho Farmer)
/// Test Type: White-box testing với code coverage cho tất cả nhánh logic
/// Total Test Cases: 12 (5 Boundary + 7 Normal)
/// </summary>
public class FarmerGetGardensTest
{
    [Fact]
    public async Task UTCID01_GetGardens_PageNumberNegative_AutoCorrectTo1()
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

        int userId = 3;
        int pageNumber = -1; // Invalid
        int pageSize = 10;

        // Mock: Repository returns empty list
        mockGardenRepo.Setup(x => x.GetGardensByUserIdAsync(userId, 1, pageSize, null))
            .ReturnsAsync((new List<dynamic>(), 0));

        // Act
        var result = await gardenService.GetGardensAsync(userId, pageNumber, pageSize, null);

        // Assert: pageNumber auto-corrected to 1
        Assert.Equal(1, result.PageNumber);
        Assert.Equal(pageSize, result.PageSize);
        mockGardenRepo.Verify(x => x.GetGardensByUserIdAsync(userId, 1, pageSize, null), Times.Once);
    }

    [Fact]
    public async Task UTCID02_GetGardens_PageNumberZero_AutoCorrectTo1()
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

        int userId = 3;
        int pageNumber = 0; // Invalid
        int pageSize = 10;

        // Mock: Repository returns empty list
        mockGardenRepo.Setup(x => x.GetGardensByUserIdAsync(userId, 1, pageSize, null))
            .ReturnsAsync((new List<dynamic>(), 0));

        // Act
        var result = await gardenService.GetGardensAsync(userId, pageNumber, pageSize, null);

        // Assert: pageNumber auto-corrected to 1
        Assert.Equal(1, result.PageNumber);
        Assert.Equal(pageSize, result.PageSize);
        mockGardenRepo.Verify(x => x.GetGardensByUserIdAsync(userId, 1, pageSize, null), Times.Once);
    }

    [Fact]
    public async Task UTCID03_GetGardens_PageSizeNegative_AutoCorrectTo10()
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

        int userId = 3;
        int pageNumber = 1;
        int pageSize = -5; // Invalid

        // Mock: Repository returns empty list
        mockGardenRepo.Setup(x => x.GetGardensByUserIdAsync(userId, pageNumber, 10, null))
            .ReturnsAsync((new List<dynamic>(), 0));

        // Act
        var result = await gardenService.GetGardensAsync(userId, pageNumber, pageSize, null);

        // Assert: pageSize auto-corrected to 10
        Assert.Equal(pageNumber, result.PageNumber);
        Assert.Equal(10, result.PageSize);
        mockGardenRepo.Verify(x => x.GetGardensByUserIdAsync(userId, pageNumber, 10, null), Times.Once);
    }

    [Fact]
    public async Task UTCID04_GetGardens_PageSizeZero_AutoCorrectTo10()
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

        int userId = 3;
        int pageNumber = 1;
        int pageSize = 0; // Invalid

        // Mock: Repository returns empty list
        mockGardenRepo.Setup(x => x.GetGardensByUserIdAsync(userId, pageNumber, 10, null))
            .ReturnsAsync((new List<dynamic>(), 0));

        // Act
        var result = await gardenService.GetGardensAsync(userId, pageNumber, pageSize, null);

        // Assert: pageSize auto-corrected to 10
        Assert.Equal(pageNumber, result.PageNumber);
        Assert.Equal(10, result.PageSize);
        mockGardenRepo.Verify(x => x.GetGardensByUserIdAsync(userId, pageNumber, 10, null), Times.Once);
    }

    [Fact]
    public async Task UTCID05_GetGardens_PageSizeExceedsMax_AutoCorrectTo100()
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

        int userId = 3;
        int pageNumber = 1;
        int pageSize = 150; // Exceeds max 100

        // Mock: Repository returns empty list
        mockGardenRepo.Setup(x => x.GetGardensByUserIdAsync(userId, pageNumber, 100, null))
            .ReturnsAsync((new List<dynamic>(), 0));

        // Act
        var result = await gardenService.GetGardensAsync(userId, pageNumber, pageSize, null);

        // Assert: pageSize auto-corrected to 100
        Assert.Equal(pageNumber, result.PageNumber);
        Assert.Equal(100, result.PageSize);
        mockGardenRepo.Verify(x => x.GetGardensByUserIdAsync(userId, pageNumber, 100, null), Times.Once);
    }

    [Fact]
    public async Task UTCID06_GetGardens_ValidUserIdWithNullSearchTerm_ReturnsAllGardens()
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

        int userId = 3;
        var gardens = new List<Garden>
        {
            new Garden { GardenId = 1, UserId = userId, Name = "Vườn A", Trees = new List<Tree>() },
            new Garden { GardenId = 2, UserId = userId, Name = "Vườn B", Trees = new List<Tree>() }
        };

        // Mock: Repository returns 2 gardens
        mockGardenRepo.Setup(x => x.GetGardensByUserIdAsync(userId, 1, 10, null))
            .ReturnsAsync((gardens.Cast<dynamic>().ToList(), 2));

        // Act
        var result = await gardenService.GetGardensAsync(userId, 1, 10, null);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.TotalCount);
        Assert.Equal(2, result.Gardens.Count);
        Assert.Equal("Vườn A", result.Gardens[0].Name);
        Assert.Equal("Vườn B", result.Gardens[1].Name);
    }

    [Fact]
    public async Task UTCID07_GetGardens_ValidUserIdWithSearchTerm_ReturnsFilteredGardens()
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

        int userId = 3;
        string searchTerm = "Vườn";
        var gardens = new List<Garden>
        {
            new Garden { GardenId = 1, UserId = userId, Name = "Vườn rau sạch", Trees = new List<Tree>() }
        };

        // Mock: Repository returns 1 garden matching search
        mockGardenRepo.Setup(x => x.GetGardensByUserIdAsync(userId, 1, 10, searchTerm))
            .ReturnsAsync((gardens.Cast<dynamic>().ToList(), 1));

        // Act
        var result = await gardenService.GetGardensAsync(userId, 1, 10, searchTerm);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.TotalCount);
        Assert.Single(result.Gardens);
        Assert.Contains("Vườn", result.Gardens[0].Name);
    }

    [Fact]
    public async Task UTCID08_GetGardens_SearchTermNoMatch_ReturnsEmptyResult()
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

        int userId = 3;
        string searchTerm = "XYZ123"; // No match

        // Mock: Repository returns empty list
        mockGardenRepo.Setup(x => x.GetGardensByUserIdAsync(userId, 1, 10, searchTerm))
            .ReturnsAsync((new List<dynamic>(), 0));

        // Act
        var result = await gardenService.GetGardensAsync(userId, 1, 10, searchTerm);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.TotalCount);
        Assert.Empty(result.Gardens);
    }

    [Fact]
    public async Task UTCID09_GetGardens_UserHasNoGardens_ReturnsEmptyResult()
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

        int userId = 999; // User with no gardens

        // Mock: Repository returns empty list
        mockGardenRepo.Setup(x => x.GetGardensByUserIdAsync(userId, 1, 10, null))
            .ReturnsAsync((new List<dynamic>(), 0));

        // Act
        var result = await gardenService.GetGardensAsync(userId, 1, 10, null);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.TotalCount);
        Assert.Empty(result.Gardens);
    }

    [Fact]
    public async Task UTCID10_GetGardens_FarmerViewsOwnGardens_IsOwnerTrue()
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

        int userId = 3;
        var gardens = new List<Garden>
        {
            new Garden { GardenId = 1, UserId = userId, Name = "My Garden", Trees = new List<Tree>() }
        };

        // Mock: Repository returns farmer's own garden
        mockGardenRepo.Setup(x => x.GetGardensByUserIdAsync(userId, 1, 10, null))
            .ReturnsAsync((gardens.Cast<dynamic>().ToList(), 1));

        // Act
        var result = await gardenService.GetGardensAsync(userId, 1, 10, null);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result.Gardens);
        Assert.True(result.Gardens[0].IsOwner); // Farmer is owner
        Assert.Equal(userId, gardens[0].UserId);
    }

    [Fact]
    public async Task UTCID11_GetGardens_PaginationPage2Size5_ReturnsCorrectPage()
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

        int userId = 3;
        int pageNumber = 2;
        int pageSize = 5;
        
        // Mock: Page 2 with 3 items, total 8 items
        var gardens = new List<Garden>
        {
            new Garden { GardenId = 6, UserId = userId, Name = "Garden 6", Trees = new List<Tree>() },
            new Garden { GardenId = 7, UserId = userId, Name = "Garden 7", Trees = new List<Tree>() },
            new Garden { GardenId = 8, UserId = userId, Name = "Garden 8", Trees = new List<Tree>() }
        };

        mockGardenRepo.Setup(x => x.GetGardensByUserIdAsync(userId, pageNumber, pageSize, null))
            .ReturnsAsync((gardens.Cast<dynamic>().ToList(), 8)); // Total 8 gardens

        // Act
        var result = await gardenService.GetGardensAsync(userId, pageNumber, pageSize, null);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(8, result.TotalCount);
        Assert.Equal(2, result.PageNumber);
        Assert.Equal(5, result.PageSize);
        Assert.Equal(3, result.Gardens.Count); // Page 2 has 3 items
    }

    [Fact]
    public async Task UTCID12_GetGardens_TotalTreesCount_IsAccurate()
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

        int userId = 3;
        var gardens = new List<Garden>
        {
            new Garden 
            { 
                GardenId = 1, 
                UserId = userId, 
                Name = "Garden with 5 trees",
                Trees = new List<Tree>
                {
                    new Tree { TreeId = 1 },
                    new Tree { TreeId = 2 },
                    new Tree { TreeId = 3 },
                    new Tree { TreeId = 4 },
                    new Tree { TreeId = 5 }
                }
            },
            new Garden 
            { 
                GardenId = 2, 
                UserId = userId, 
                Name = "Garden with 0 trees",
                Trees = new List<Tree>()
            }
        };

        mockGardenRepo.Setup(x => x.GetGardensByUserIdAsync(userId, 1, 10, null))
            .ReturnsAsync((gardens.Cast<dynamic>().ToList(), 2));

        // Act
        var result = await gardenService.GetGardensAsync(userId, 1, 10, null);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Gardens.Count);
        Assert.Equal(5, result.Gardens[0].TotalTrees); // First garden has 5 trees
        Assert.Equal(0, result.Gardens[1].TotalTrees); // Second garden has 0 trees
    }
}
