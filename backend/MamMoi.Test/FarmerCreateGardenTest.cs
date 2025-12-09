using MamMoi.Application.DTOs.Garden;
using MamMoi.Application.DTOs.SubscriptionPlan;
using MamMoi.Application.Interfaces;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services.Gardens;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace MamMoi.Test;

/// <summary>
/// Unit Test cho GardenService - Farmer Core: Tạo vườn
/// Test từng bước nhỏ, verify từng case một
/// </summary>
public class FarmerCreateGardenTest
{
    [Fact]
    public async Task CreateGarden_UserNotFound_ThrowsUnauthorizedException()
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

        int userId = 999;
        var dto = new CreateGardenDto
        {
            Name = "Test Garden",
            Location = "Hanoi"
        };

        // Mock: User không tồn tại
        mockUserRepo.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync((User?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => gardenService.CreateGardenAsync(userId, dto));

        Assert.Equal("User không tồn tại.", exception.Message);
        
        // Verify: GetByIdAsync được gọi đúng 1 lần
        mockUserRepo.Verify(x => x.GetByIdAsync(userId), Times.Once);
        
        // Verify: CreateAsync không được gọi
        mockGardenRepo.Verify(x => x.CreateAsync(It.IsAny<Garden>()), Times.Never);
    }

    [Theory]
    [InlineData(1)] // Admin
    [InlineData(2)] // Staff
    [InlineData(4)] // Guest
    [InlineData(5)] // Other roles
    public async Task CreateGarden_UserNotFarmer_ThrowsUnauthorizedException(int roleId)
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

        int userId = 1;
        var dto = new CreateGardenDto
        {
            Name = "Test Garden",
            Location = "Hanoi"
        };

        // Mock: User tồn tại nhưng không phải Farmer (RoleId != 3)
        var user = new User
        {
            UserId = userId,
            RoleId = roleId, // Không phải 3 (Farmer)
            FullName = "Test User",
            Email = "test@example.com"
        };
        mockUserRepo.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => gardenService.CreateGardenAsync(userId, dto));

        Assert.Equal("Chỉ Farmer mới được tạo vườn.", exception.Message);
        
        // Verify: GetByIdAsync được gọi
        mockUserRepo.Verify(x => x.GetByIdAsync(userId), Times.Once);
        
        // Verify: CreateAsync không được gọi
        mockGardenRepo.Verify(x => x.CreateAsync(It.IsAny<Garden>()), Times.Never);
    }

    [Fact]
    public async Task CreateGarden_ExceedsMaxGardens_ThrowsInvalidOperationException()
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

        int userId = 1;
        var dto = new CreateGardenDto
        {
            Name = "Test Garden",
            Location = "Hanoi"
        };

        // Mock: User là Farmer (RoleId = 3)
        var user = new User
        {
            UserId = userId,
            RoleId = 3, // Farmer
            FullName = "Test Farmer",
            Email = "farmer@example.com"
        };
        mockUserRepo.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);

        // Mock: Subscription plan với MaxGardens = 2
        var subscriptionPlan = new SubscriptionPlanDto
        {
            PlanId = 1,
            PlanName = "Basic Plan",
            MaxGardens = 2,
            MaxTreesPerGarden = 10
        };
        mockSubscriptionService.Setup(x => x.GetCurrentUserSubscriptionAsync(userId))
            .ReturnsAsync(subscriptionPlan);

        // Mock: User đã có 2 vườn (đạt giới hạn)
        var existingGardens = new List<Garden>
        {
            new Garden { GardenId = 1, UserId = userId, Name = "Garden 1" },
            new Garden { GardenId = 2, UserId = userId, Name = "Garden 2" }
        };
        await dbContext.Gardens.AddRangeAsync(existingGardens);
        await dbContext.SaveChangesAsync();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => gardenService.CreateGardenAsync(userId, dto));

        Assert.Contains("đã đạt giới hạn số vườn", exception.Message);
        Assert.Contains("2 vườn", exception.Message);
        
        // Verify: CreateAsync không được gọi
        mockGardenRepo.Verify(x => x.CreateAsync(It.IsAny<Garden>()), Times.Never);
    }

    [Fact]
    public async Task UTCID04_CreateGarden_NameIsNull_ThrowsException()
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

        int userId = 1;
        var dto = new CreateGardenDto
        {
            Name = null!, // Name = null
            Location = "Hanoi"
        };

        // Mock: User là Farmer
        var user = new User
        {
            UserId = userId,
            RoleId = 3,
            FullName = "Test Farmer",
            Email = "farmer@example.com"
        };
        mockUserRepo.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);

        // Act & Assert - Expect exception hoặc validation error
        await Assert.ThrowsAnyAsync<Exception>(
            () => gardenService.CreateGardenAsync(userId, dto));
    }

    [Fact]
    public async Task UTCID05_CreateGarden_ValidInput_ReturnsGardenResponseDto()
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

        int userId = 1;
        var dto = new CreateGardenDto
        {
            Name = "Vườn rau sạch",
            Location = "Hanoi",
            TimeZone = "Asia/Ho_Chi_Minh",
            ClimateZone = "Tropical",
            Status = "Đang hoạt động" // Active
        };

        // Mock: User là Farmer
        var user = new User
        {
            UserId = userId,
            RoleId = 3,
            FullName = "Test Farmer",
            Email = "farmer@example.com"
        };
        mockUserRepo.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);

        // Mock: Subscription plan
        var subscriptionPlan = new SubscriptionPlanDto
        {
            PlanId = 1,
            PlanName = "Basic Plan",
            MaxGardens = 5,
            MaxTreesPerGarden = 10
        };
        mockSubscriptionService.Setup(x => x.GetCurrentUserSubscriptionAsync(userId))
            .ReturnsAsync(subscriptionPlan);

        // Mock: GardenRepository.CreateAsync trả về Garden
        var createdGarden = new Garden
        {
            GardenId = 1,
            UserId = userId,
            Name = dto.Name,
            Location = dto.Location,
            TimeZone = dto.TimeZone,
            ClimateZone = dto.ClimateZone,
            Status = dto.Status,
            CreatedAt = DateTime.Now
        };
        mockGardenRepo.Setup(x => x.CreateAsync(It.IsAny<Garden>()))
            .ReturnsAsync(createdGarden);

        // Mock: GardenRepository.GetByIdAsync trả về garden với User populated
        var reloadedGarden = new Garden
        {
            GardenId = 1,
            UserId = userId,
            Name = dto.Name,
            Location = dto.Location,
            TimeZone = dto.TimeZone,
            ClimateZone = dto.ClimateZone,
            Status = dto.Status,
            CreatedAt = DateTime.Now,
            User = user, // Important: populate User navigation property
            Trees = new List<Tree>(), // Empty list to avoid null
            GardenMembers = new List<GardenMember>() // Empty list
        };
        mockGardenRepo.Setup(x => x.GetByIdAsync(1))
            .ReturnsAsync(reloadedGarden);

        // Mock: GardenMemberRepository.AddAsync
        mockGardenMemberRepo.Setup(x => x.AddAsync(It.IsAny<GardenMember>()))
            .ReturnsAsync(new GardenMember());

        // Act
        var result = await gardenService.CreateGardenAsync(userId, dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Vườn rau sạch", result.Name);
        Assert.Equal("Hanoi", result.Location);
        Assert.NotNull(result.Status);
        
        // Verify: CreateAsync được gọi
        mockGardenRepo.Verify(x => x.CreateAsync(It.IsAny<Garden>()), Times.Once);
        
        // Verify: GardenMember được tạo với RoleId = 3
        mockGardenMemberRepo.Verify(x => x.AddAsync(It.Is<GardenMember>(
            gm => gm.UserId == userId && gm.RoleId == 3 && gm.GardenId == createdGarden.GardenId
        )), Times.Once);
    }

    [Fact]
    public async Task UTCID06_CreateGarden_Success_CreatesGardenMemberAutomatically()
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

        int userId = 1;
        var dto = new CreateGardenDto
        {
            Name = "Test Garden",
            Location = "Hanoi"
        };

        // Mock: User là Farmer
        var user = new User
        {
            UserId = userId,
            RoleId = 3,
            FullName = "Test Farmer",
            Email = "farmer@example.com"
        };
        mockUserRepo.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);

        // Mock: Subscription plan
        var subscriptionPlan = new SubscriptionPlanDto
        {
            PlanId = 1,
            PlanName = "Basic Plan",
            MaxGardens = 5,
            MaxTreesPerGarden = 10
        };
        mockSubscriptionService.Setup(x => x.GetCurrentUserSubscriptionAsync(userId))
            .ReturnsAsync(subscriptionPlan);

        // Mock: Garden created
        var createdGarden = new Garden
        {
            GardenId = 99,
            UserId = userId,
            Name = dto.Name,
            Location = dto.Location,
            CreatedAt = DateTime.Now
        };
        mockGardenRepo.Setup(x => x.CreateAsync(It.IsAny<Garden>()))
            .ReturnsAsync(createdGarden);

        // Mock: GardenRepository.GetByIdAsync trả về garden với User populated
        var reloadedGarden = new Garden
        {
            GardenId = 99,
            UserId = userId,
            Name = dto.Name,
            Location = dto.Location,
            CreatedAt = DateTime.Now,
            User = user,
            Trees = new List<Tree>(),
            GardenMembers = new List<GardenMember>()
        };
        mockGardenRepo.Setup(x => x.GetByIdAsync(99))
            .ReturnsAsync(reloadedGarden);

        mockGardenMemberRepo.Setup(x => x.AddAsync(It.IsAny<GardenMember>()))
            .ReturnsAsync(new GardenMember());

        // Act
        var result = await gardenService.CreateGardenAsync(userId, dto);

        // Assert: Verify GardenMember được tạo với GardenId, UserId, RoleId = 3
        mockGardenMemberRepo.Verify(x => x.AddAsync(It.Is<GardenMember>(
            gm => gm.GardenId == 99 && gm.UserId == userId && gm.RoleId == 3
        )), Times.Once);
    }

    [Fact]
    public async Task UTCID07_CreateGarden_StatusInactive_CreatesGardenWithStatus0()
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

        int userId = 1;
        var dto = new CreateGardenDto
        {
            Name = "Inactive Garden",
            Location = "Hanoi",
            Status = "Ngưng hoạt động" // Inactive
        };

        // Mock: User là Farmer
        var user = new User
        {
            UserId = userId,
            RoleId = 3,
            FullName = "Test Farmer",
            Email = "farmer@example.com"
        };
        mockUserRepo.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);

        // Mock: Subscription plan
        mockSubscriptionService.Setup(x => x.GetCurrentUserSubscriptionAsync(userId))
            .ReturnsAsync(new SubscriptionPlanDto { MaxGardens = 5 });

        // Mock: Garden created với Status = Inactive
        var createdGarden = new Garden
        {
            GardenId = 1,
            UserId = userId,
            Name = dto.Name,
            Status = "Ngưng hoạt động", // Inactive
            CreatedAt = DateTime.Now
        };
        mockGardenRepo.Setup(x => x.CreateAsync(It.IsAny<Garden>()))
            .ReturnsAsync(createdGarden);

        // Mock: GardenRepository.GetByIdAsync trả về garden với User populated
        var reloadedGarden = new Garden
        {
            GardenId = 1,
            UserId = userId,
            Name = dto.Name,
            Status = "Ngưng hoạt động",
            CreatedAt = DateTime.Now,
            User = user,
            Trees = new List<Tree>(),
            GardenMembers = new List<GardenMember>()
        };
        mockGardenRepo.Setup(x => x.GetByIdAsync(1))
            .ReturnsAsync(reloadedGarden);

        mockGardenMemberRepo.Setup(x => x.AddAsync(It.IsAny<GardenMember>()))
            .ReturnsAsync(new GardenMember());

        // Act
        var result = await gardenService.CreateGardenAsync(userId, dto);

        // Assert: Garden được tạo với Status = Inactive
        Assert.NotNull(result);
        Assert.NotNull(result.Status);
        mockGardenRepo.Verify(x => x.CreateAsync(It.Is<Garden>(g => g.Status == "Ngưng hoạt động")), Times.Once);
    }

    [Fact]
    public async Task UTCID08_CreateGarden_StatusActive_CreatesGardenWithStatus1()
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

        int userId = 1;
        var dto = new CreateGardenDto
        {
            Name = "Active Garden",
            Location = "Hanoi",
            Status = "Đang hoạt động" // Active
        };

        // Mock: User là Farmer
        var user = new User
        {
            UserId = userId,
            RoleId = 3,
            FullName = "Test Farmer",
            Email = "farmer@example.com"
        };
        mockUserRepo.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);

        // Mock: Subscription plan
        mockSubscriptionService.Setup(x => x.GetCurrentUserSubscriptionAsync(userId))
            .ReturnsAsync(new SubscriptionPlanDto { MaxGardens = 5 });

        // Mock: Garden created với Status = Active
        var createdGarden = new Garden
        {
            GardenId = 1,
            UserId = userId,
            Name = dto.Name,
            Status = "Đang hoạt động", // Active
            CreatedAt = DateTime.Now
        };
        mockGardenRepo.Setup(x => x.CreateAsync(It.IsAny<Garden>()))
            .ReturnsAsync(createdGarden);

        // Mock: GardenRepository.GetByIdAsync trả về garden với User populated
        var reloadedGarden = new Garden
        {
            GardenId = 1,
            UserId = userId,
            Name = dto.Name,
            Status = "Đang hoạt động",
            CreatedAt = DateTime.Now,
            User = user,
            Trees = new List<Tree>(),
            GardenMembers = new List<GardenMember>()
        };
        mockGardenRepo.Setup(x => x.GetByIdAsync(1))
            .ReturnsAsync(reloadedGarden);

        mockGardenMemberRepo.Setup(x => x.AddAsync(It.IsAny<GardenMember>()))
            .ReturnsAsync(new GardenMember());

        // Act
        var result = await gardenService.CreateGardenAsync(userId, dto);

        // Assert: Garden được tạo với Status = Active
        Assert.NotNull(result);
        Assert.NotNull(result.Status);
        mockGardenRepo.Verify(x => x.CreateAsync(It.Is<Garden>(g => g.Status == "Đang hoạt động")), Times.Once);
    }
}
