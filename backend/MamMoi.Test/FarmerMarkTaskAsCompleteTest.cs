using MamMoi.Application.DTOs.CareSchedule;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services.CareSchedules;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace MamMoi.Test;

public class FarmerMarkTaskAsCompleteTest
{
    [Fact]
    public async Task UTCID01_MarkTaskAsComplete_InvalidScheduleId_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new MarkTaskCompleteDto
        {
            CompletionNotes = null
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.MarkTaskAsCompleteAsync(0, 3, dto)
        );
        Assert.Contains("Invalid ScheduleId", exception.Message);
    }

    [Fact]
    public async Task UTCID02_MarkTaskAsComplete_ScheduleIdNotExists_ThrowsInvalidOperationException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new MarkTaskCompleteDto
        {
            CompletionNotes = null
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.MarkTaskAsCompleteAsync(9999, 3, dto)
        );
        Assert.Contains("Care task not found", exception.Message);
    }

    [Fact]
    public async Task UTCID03_MarkTaskAsComplete_InvalidUserId_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.CareSchedules.Add(new CareSchedule
        {
            ScheduleId = 1,
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Test Task",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new MarkTaskCompleteDto
        {
            CompletionNotes = null
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.MarkTaskAsCompleteAsync(1, 0, dto)
        );
        Assert.Contains("Invalid UserId", exception.Message);
    }

    [Fact]
    public async Task UTCID04_MarkTaskAsComplete_UserNotFound_ThrowsInvalidOperationException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.CareSchedules.Add(new CareSchedule
        {
            ScheduleId = 1,
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Test Task",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        mockUserRepository.Setup(x => x.GetByIdAsync(9999)).ReturnsAsync((User?)null);

        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new MarkTaskCompleteDto
        {
            CompletionNotes = null
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.MarkTaskAsCompleteAsync(1, 9999, dto)
        );
        Assert.Contains("User not found", exception.Message);
    }

    [Fact]
    public async Task UTCID05_MarkTaskAsComplete_TaskAlreadyCompleted_ThrowsInvalidOperationException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data - already completed task
        dbContext.CareSchedules.Add(new CareSchedule
        {
            ScheduleId = 2,
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Test Task",
            Status = "Completed",
            CompletedAt = DateTime.UtcNow.AddDays(-1), // Already completed
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        mockUserRepository.Setup(x => x.GetByIdAsync(3)).ReturnsAsync(new User { UserId = 3, FullName = "Test User" });

        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new MarkTaskCompleteDto
        {
            CompletionNotes = null
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.MarkTaskAsCompleteAsync(2, 3, dto)
        );
        Assert.Contains("Task already completed", exception.Message);
    }

    [Fact]
    public async Task UTCID06_MarkTaskAsComplete_CompletionNotesTooLong_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.CareSchedules.Add(new CareSchedule
        {
            ScheduleId = 1,
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Test Task",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        mockUserRepository.Setup(x => x.GetByIdAsync(3)).ReturnsAsync(new User { UserId = 3, FullName = "Test User" });

        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new MarkTaskCompleteDto
        {
            CompletionNotes = new string('A', 1001) // 1001 characters
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.MarkTaskAsCompleteAsync(1, 3, dto)
        );
        Assert.Contains("CompletionNotes cannot exceed 1000", exception.Message);
    }

    [Fact]
    public async Task UTCID07_MarkTaskAsComplete_ActualWaterNegative_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.CareSchedules.Add(new CareSchedule
        {
            ScheduleId = 1,
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Test Task",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        mockUserRepository.Setup(x => x.GetByIdAsync(3)).ReturnsAsync(new User { UserId = 3, FullName = "Test User" });

        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new MarkTaskCompleteDto
        {
            ActualWaterAmountLiters = -5
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.MarkTaskAsCompleteAsync(1, 3, dto)
        );
        Assert.Contains("ActualWaterAmountLiters must be between 0 and 9999.99", exception.Message);
    }

    [Fact]
    public async Task UTCID08_MarkTaskAsComplete_ActualWaterTooHigh_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.CareSchedules.Add(new CareSchedule
        {
            ScheduleId = 1,
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Test Task",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        mockUserRepository.Setup(x => x.GetByIdAsync(3)).ReturnsAsync(new User { UserId = 3, FullName = "Test User" });

        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new MarkTaskCompleteDto
        {
            ActualWaterAmountLiters = 10000 // > 9999.99
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.MarkTaskAsCompleteAsync(1, 3, dto)
        );
        Assert.Contains("ActualWaterAmountLiters must be between 0 and 9999.99", exception.Message);
    }

    [Fact]
    public async Task UTCID09_MarkTaskAsComplete_ActualFertilizerTooHigh_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.CareSchedules.Add(new CareSchedule
        {
            ScheduleId = 1,
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Test Task",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        mockUserRepository.Setup(x => x.GetByIdAsync(3)).ReturnsAsync(new User { UserId = 3, FullName = "Test User" });

        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new MarkTaskCompleteDto
        {
            ActualFertilizerAmountGrams = 1000000 // > 999999
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.MarkTaskAsCompleteAsync(1, 3, dto)
        );
        Assert.Contains("ActualFertilizerAmountGrams must be between 0 and 999999", exception.Message);
    }

    [Fact]
    public async Task UTCID10_MarkTaskAsComplete_ResultRatingZero_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.CareSchedules.Add(new CareSchedule
        {
            ScheduleId = 1,
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Test Task",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        mockUserRepository.Setup(x => x.GetByIdAsync(3)).ReturnsAsync(new User { UserId = 3, FullName = "Test User" });

        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new MarkTaskCompleteDto
        {
            ResultRating = 0 // < 1
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.MarkTaskAsCompleteAsync(1, 3, dto)
        );
        Assert.Contains("ResultRating must be between 1 and 5", exception.Message);
    }

    [Fact]
    public async Task UTCID11_MarkTaskAsComplete_ResultRatingTooHigh_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.CareSchedules.Add(new CareSchedule
        {
            ScheduleId = 1,
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Test Task",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        mockUserRepository.Setup(x => x.GetByIdAsync(3)).ReturnsAsync(new User { UserId = 3, FullName = "Test User" });

        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new MarkTaskCompleteDto
        {
            ResultRating = 6 // > 5
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.MarkTaskAsCompleteAsync(1, 3, dto)
        );
        Assert.Contains("ResultRating must be between 1 and 5", exception.Message);
    }

    [Fact]
    public async Task UTCID12_MarkTaskAsComplete_ValidMinimalData_ReturnsTrue()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.CareSchedules.Add(new CareSchedule
        {
            ScheduleId = 1,
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Test Task",
            Status = "Pending",
            Priority = "Medium",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        mockUserRepository.Setup(x => x.GetByIdAsync(3)).ReturnsAsync(new User { UserId = 3, FullName = "Test User" });

        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new MarkTaskCompleteDto
        {
            CompletionNotes = "Đã tưới xong",
            ResultRating = 5
        };

        // Act
        var result = await service.MarkTaskAsCompleteAsync(1, 3, dto);

        // Assert
        Assert.True(result);

        // Verify updates
        var updatedTask = await dbContext.CareSchedules.FindAsync(1);
        Assert.NotNull(updatedTask);
        Assert.Equal("Completed", updatedTask.Status);
        Assert.NotNull(updatedTask.CompletedAt);
        Assert.Equal(3, updatedTask.CompletedByUserId);
        Assert.Equal("Đã tưới xong", updatedTask.CompletionNotes);
        Assert.Equal(5, updatedTask.ResultRating);
        Assert.NotNull(updatedTask.UpdatedAt);
    }

    [Fact]
    public async Task UTCID13_MarkTaskAsComplete_ValidCompleteData_ReturnsTrue()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.CareSchedules.Add(new CareSchedule
        {
            ScheduleId = 1,
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Test Task",
            Status = "Pending",
            Priority = "Medium",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        mockUserRepository.Setup(x => x.GetByIdAsync(3)).ReturnsAsync(new User { UserId = 3, FullName = "Test User" });

        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new MarkTaskCompleteDto
        {
            CompletionNotes = "Tưới 12L nước, cây phản ứng tốt",
            ActualWaterAmountLiters = 12,
            ResultRating = 5
        };

        // Act
        var result = await service.MarkTaskAsCompleteAsync(1, 3, dto);

        // Assert
        Assert.True(result);

        // Verify all updates
        var updatedTask = await dbContext.CareSchedules.FindAsync(1);
        Assert.NotNull(updatedTask);
        Assert.Equal("Completed", updatedTask.Status);
        Assert.NotNull(updatedTask.CompletedAt);
        Assert.Equal(3, updatedTask.CompletedByUserId);
        Assert.Equal("Tưới 12L nước, cây phản ứng tốt", updatedTask.CompletionNotes);
        Assert.Equal(12, updatedTask.ActualWaterAmountLiters);
        Assert.Equal(5, updatedTask.ResultRating);
        Assert.NotNull(updatedTask.UpdatedAt);

        // Verify CompletedAt is recent (within last minute)
        Assert.True((DateTime.UtcNow - updatedTask.CompletedAt.Value).TotalMinutes < 1);
    }
}
