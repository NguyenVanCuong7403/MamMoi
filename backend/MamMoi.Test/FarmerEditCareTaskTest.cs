using MamMoi.Application.DTOs.CareSchedule;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services.CareSchedules;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace MamMoi.Test;

public class FarmerEditCareTaskTest
{
    [Fact]
    public async Task UTCID01_EditCareTask_InvalidScheduleId_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new EditCareTaskDto
        {
            TaskName = null
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.EditCareTaskAsync(0, dto)
        );
        Assert.Contains("Invalid ScheduleId", exception.Message);
    }

    [Fact]
    public async Task UTCID02_EditCareTask_ScheduleIdNotExists_ThrowsInvalidOperationException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new EditCareTaskDto
        {
            TaskName = null
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.EditCareTaskAsync(9999, dto)
        );
        Assert.Contains("Care task not found", exception.Message);
    }

    [Fact]
    public async Task UTCID03_EditCareTask_TaskNameTooLong_ThrowsArgumentException()
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
            TaskName = "Original Task",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new EditCareTaskDto
        {
            TaskName = new string('A', 201) // 201 characters
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.EditCareTaskAsync(1, dto)
        );
        Assert.Contains("TaskName cannot exceed 200", exception.Message);
    }

    [Fact]
    public async Task UTCID04_EditCareTask_DescriptionTooLong_ThrowsArgumentException()
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
            TaskName = "Original Task",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new EditCareTaskDto
        {
            Description = new string('A', 1001) // 1001 characters
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.EditCareTaskAsync(1, dto)
        );
        Assert.Contains("Description cannot exceed 1000", exception.Message);
    }

    [Fact]
    public async Task UTCID05_EditCareTask_InvalidDateFormat_ThrowsArgumentException()
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
            TaskName = "Original Task",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new EditCareTaskDto
        {
            ScheduledDate = "15/12/2025" // Invalid format (DD/MM/YYYY)
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.EditCareTaskAsync(1, dto)
        );
        Assert.Contains("Invalid date format. Use YYYY-MM-DD", exception.Message);
    }

    [Fact]
    public async Task UTCID06_EditCareTask_ValidDateFormat_ReturnsTrue()
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
            TaskName = "Original Task",
            Status = "Pending",
            Priority = "Medium",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new EditCareTaskDto
        {
            ScheduledDate = "2025-12-15" // Valid format
        };

        // Act
        var result = await service.EditCareTaskAsync(1, dto);

        // Assert
        Assert.True(result);

        var updatedTask = await dbContext.CareSchedules.FindAsync(1);
        Assert.NotNull(updatedTask);
        Assert.Equal(new DateOnly(2025, 12, 15), updatedTask.ScheduledDate);
    }

    [Fact]
    public async Task UTCID07_EditCareTask_InvalidTimeOfDay_ThrowsArgumentException()
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
            TaskName = "Original Task",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new EditCareTaskDto
        {
            ScheduledTimeOfDay = "Midnight" // Invalid
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.EditCareTaskAsync(1, dto)
        );
        Assert.Contains("Invalid ScheduledTimeOfDay", exception.Message);
    }

    [Fact]
    public async Task UTCID08_EditCareTask_EstimatedDurationOutOfRange_ThrowsArgumentException()
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
            TaskName = "Original Task",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new EditCareTaskDto
        {
            EstimatedDurationMinutes = 1500 // > 1440
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.EditCareTaskAsync(1, dto)
        );
        Assert.Contains("EstimatedDurationMinutes must be between 1 and 1440", exception.Message);
    }

    [Fact]
    public async Task UTCID09_EditCareTask_InvalidPriority_ThrowsArgumentException()
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
            TaskName = "Original Task",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new EditCareTaskDto
        {
            Priority = "Urgent" // Invalid
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.EditCareTaskAsync(1, dto)
        );
        Assert.Contains("Invalid Priority", exception.Message);
    }

    [Fact]
    public async Task UTCID10_EditCareTask_WaterAmountOutOfRange_ThrowsArgumentException()
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
            TaskName = "Original Task",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new EditCareTaskDto
        {
            WaterAmountLiters = 10000 // > 9999.99
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.EditCareTaskAsync(1, dto)
        );
        Assert.Contains("WaterAmountLiters must be between 0 and 9999.99", exception.Message);
    }

    [Fact]
    public async Task UTCID11_EditCareTask_UpdateSingleField_ReturnsTrue()
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
            TaskName = "Tưới nước sáng",
            Status = "Pending",
            Priority = "Medium",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new EditCareTaskDto
        {
            TaskName = "Tưới nước chiều" // Update only TaskName
        };

        // Act
        var result = await service.EditCareTaskAsync(1, dto);

        // Assert
        Assert.True(result);

        var updatedTask = await dbContext.CareSchedules.FindAsync(1);
        Assert.NotNull(updatedTask);
        Assert.Equal("Tưới nước chiều", updatedTask.TaskName);
        Assert.Equal("Pending", updatedTask.Status); // Unchanged
        Assert.NotNull(updatedTask.UpdatedAt);
    }

    [Fact]
    public async Task UTCID12_EditCareTask_UpdateMultipleFields_ReturnsTrue()
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
            TaskName = "Tưới nước sáng",
            Status = "Pending",
            Priority = "Medium",
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new EditCareTaskDto
        {
            TaskName = "Tưới nước chiều",
            Priority = "High",
            WaterAmountLiters = 15,
            EstimatedDurationMinutes = 20
        };

        // Act
        var result = await service.EditCareTaskAsync(1, dto);

        // Assert
        Assert.True(result);

        var updatedTask = await dbContext.CareSchedules.FindAsync(1);
        Assert.NotNull(updatedTask);
        Assert.Equal("Tưới nước chiều", updatedTask.TaskName);
        Assert.Equal("High", updatedTask.Priority);
        Assert.Equal(15, updatedTask.WaterAmountLiters);
        Assert.Equal(20, updatedTask.EstimatedDurationMinutes);
        Assert.NotNull(updatedTask.UpdatedAt);
    }

    [Fact]
    public async Task UTCID13_EditCareTask_NullFieldsDoNotUpdate_ReturnsTrue()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data
        dbContext.CareSchedules.Add(new CareSchedule
        {
            ScheduleId = 2,
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Original Name",
            Status = "Pending",
            Priority = "Medium",
            WaterAmountLiters = 10,
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        var dto = new EditCareTaskDto
        {
            TaskName = "New name", // Update this
            Priority = null, // Do not update
            WaterAmountLiters = null // Do not update
        };

        // Act
        var result = await service.EditCareTaskAsync(2, dto);

        // Assert
        Assert.True(result);

        var updatedTask = await dbContext.CareSchedules.FindAsync(2);
        Assert.NotNull(updatedTask);
        Assert.Equal("New name", updatedTask.TaskName); // Updated
        Assert.Equal("Medium", updatedTask.Priority); // Unchanged
        Assert.Equal(10, updatedTask.WaterAmountLiters); // Unchanged
        Assert.NotNull(updatedTask.UpdatedAt);
    }
}
