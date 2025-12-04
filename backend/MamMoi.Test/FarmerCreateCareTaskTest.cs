using MamMoi.Application.DTOs.CareSchedule;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services.CareSchedules;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace MamMoi.Test;

public class FarmerCreateCareTaskTest
{
    [Fact]
    public async Task UTCID01_CreateCareTask_TreeIdNotExists_ThrowsInvalidOperationException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new CreateCareTaskDto
        {
            TreeId = 9999,
            TaskType = "Watering",
            TaskName = "Tưới nước",
            ScheduledDate = "2025-12-10"
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateCareTaskAsync(dto)
        );
    }

    [Fact]
    public async Task UTCID02_CreateCareTask_TaskTypeNull_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new CreateCareTaskDto
        {
            TreeId = 1,
            TaskType = null!,
            TaskName = "Tưới nước",
            ScheduledDate = "2025-12-10"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateCareTaskAsync(dto)
        );
        Assert.Contains("TaskType is required", exception.Message);
    }

    [Fact]
    public async Task UTCID03_CreateCareTask_InvalidTaskType_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new CreateCareTaskDto
        {
            TreeId = 1,
            TaskType = "Cooking",
            TaskName = "Tưới nước",
            ScheduledDate = "2025-12-10"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateCareTaskAsync(dto)
        );
        Assert.Contains("Invalid TaskType", exception.Message);
    }

    [Fact]
    public async Task UTCID04_CreateCareTask_TaskNameNull_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new CreateCareTaskDto
        {
            TreeId = 1,
            TaskType = "Watering",
            TaskName = null!,
            ScheduledDate = "2025-12-10"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateCareTaskAsync(dto)
        );
        Assert.Contains("TaskName is required", exception.Message);
    }

    [Fact]
    public async Task UTCID05_CreateCareTask_TaskNameTooLong_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new CreateCareTaskDto
        {
            TreeId = 1,
            TaskType = "Watering",
            TaskName = new string('A', 201), // 201 characters
            ScheduledDate = "2025-12-10"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateCareTaskAsync(dto)
        );
        Assert.Contains("TaskName cannot exceed 200", exception.Message);
    }

    [Fact]
    public async Task UTCID06_CreateCareTask_ScheduledDateInPast_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new CreateCareTaskDto
        {
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Tưới nước",
            ScheduledDate = "2020-01-01" // Past date
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateCareTaskAsync(dto)
        );
        Assert.Contains("Scheduled date cannot be in the past", exception.Message);
    }

    [Fact]
    public async Task UTCID07_CreateCareTask_InvalidTimeOfDay_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new CreateCareTaskDto
        {
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Tưới nước",
            ScheduledDate = "2025-12-10",
            ScheduledTimeOfDay = "Midnight" // Invalid
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateCareTaskAsync(dto)
        );
        Assert.Contains("Invalid ScheduledTimeOfDay", exception.Message);
    }

    [Fact]
    public async Task UTCID08_CreateCareTask_InvalidPriority_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new CreateCareTaskDto
        {
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Tưới nước",
            ScheduledDate = "2025-12-10",
            Priority = "Urgent" // Invalid
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateCareTaskAsync(dto)
        );
        Assert.Contains("Invalid Priority", exception.Message);
    }

    [Fact]
    public async Task UTCID09_CreateCareTask_EstimatedDurationOutOfRange_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new CreateCareTaskDto
        {
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Tưới nước",
            ScheduledDate = "2025-12-10",
            EstimatedDurationMinutes = 1500 // > 1440
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateCareTaskAsync(dto)
        );
        Assert.Contains("EstimatedDurationMinutes must be between 1 and 1440", exception.Message);
    }

    [Fact]
    public async Task UTCID10_CreateCareTask_WaterAmountOutOfRange_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new CreateCareTaskDto
        {
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Tưới nước",
            ScheduledDate = "2025-12-10",
            WaterAmountLiters = 10000 // > 9999.99
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateCareTaskAsync(dto)
        );
        Assert.Contains("WaterAmountLiters must be between 0 and 9999.99", exception.Message);
    }

    [Fact]
    public async Task UTCID11_CreateCareTask_RecurrencePatternRequiredWhenIsRecurring_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new CreateCareTaskDto
        {
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Tưới nước",
            ScheduledDate = "2025-12-10",
            IsRecurring = true,
            RecurrencePattern = null // Missing
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateCareTaskAsync(dto)
        );
        Assert.Contains("RecurrencePattern is required when IsRecurring is true", exception.Message);
    }

    [Fact]
    public async Task UTCID12_CreateCareTask_ValidMinimalData_ReturnsDto()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new CreateCareTaskDto
        {
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Tưới nước sáng",
            ScheduledDate = "2025-12-10",
            Priority = "High",
            EstimatedDurationMinutes = 30,
            ScheduledTimeOfDay = "Morning"
        };

        // Act
        var result = await service.CreateCareTaskAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.TreeId);
        Assert.Equal("Watering", result.TaskType);
        Assert.Equal("Tưới nước sáng", result.TaskName);
        Assert.Equal("Pending", result.Status); // Default
        Assert.Equal("High", result.Priority);
        Assert.Equal(30, result.EstimatedDurationMinutes);
        Assert.Equal("Morning", result.ScheduledTimeOfDay);
    }

    [Fact]
    public async Task UTCID13_CreateCareTask_ValidFertilizingTask_ReturnsDto()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new CreateCareTaskDto
        {
            TreeId = 1,
            TaskType = "Fertilizing",
            TaskName = "Bón phân NPK",
            ScheduledDate = "2025-12-10",
            WaterAmountLiters = 10
        };

        // Act
        var result = await service.CreateCareTaskAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Fertilizing", result.TaskType);
        Assert.Equal("Bón phân NPK", result.TaskName);
        Assert.Equal("Pending", result.Status);
        Assert.Equal("Medium", result.Priority); // Default
        Assert.Equal(10, result.WaterAmountLiters);
    }

    [Fact]
    public async Task UTCID14_CreateCareTask_ValidRecurringTask_ReturnsDto()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new CreateCareTaskDto
        {
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Tưới định kỳ",
            ScheduledDate = "2025-12-10",
            ScheduledTimeOfDay = "Morning",
            IsRecurring = true,
            RecurrencePattern = "Daily"
        };

        // Act
        var result = await service.CreateCareTaskAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Watering", result.TaskType);
        Assert.True(result.IsRecurring);
        Assert.Equal("Daily", result.RecurrencePattern);
        Assert.Equal("Morning", result.ScheduledTimeOfDay);
    }

    [Fact]
    public async Task UTCID15_CreateCareTask_TaskNameEmpty_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.Trees.Add(new Tree
        {
            TreeId = 1,
            GardenId = 1,
            UserId = 3,
            TreeTypeId = 1,
            TreeName = "Test Tree",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new CreateCareTaskDto
        {
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "   ", // Empty/whitespace
            ScheduledDate = "2025-12-10",
            ScheduledTimeOfDay = "Morning"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.CreateCareTaskAsync(dto)
        );
        Assert.Contains("TaskName is required", exception.Message);
    }
}
