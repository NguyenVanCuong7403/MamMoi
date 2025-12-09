using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services.CareSchedules;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace MamMoi.Test;

public class FarmerDeleteCareTaskTest
{
    [Fact]
    public async Task UTCID01_DeleteCareTask_ScheduleIdZero_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.DeleteCareTaskAsync(0)
        );
        Assert.Contains("Invalid ScheduleId", exception.Message);
    }

    [Fact]
    public async Task UTCID02_DeleteCareTask_ScheduleIdNegative_ThrowsArgumentException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.DeleteCareTaskAsync(-1)
        );
        Assert.Contains("Invalid ScheduleId", exception.Message);
    }

    [Fact]
    public async Task UTCID03_DeleteCareTask_ScheduleIdNotExists_ThrowsInvalidOperationException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.DeleteCareTaskAsync(9999)
        );
        Assert.Contains("Care task not found", exception.Message);
    }

    [Fact]
    public async Task UTCID04_DeleteCareTask_TaskAlreadyCompleted_ThrowsInvalidOperationException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data - completed task
        dbContext.CareSchedules.Add(new CareSchedule
        {
            ScheduleId = 2,
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Completed Task",
            Status = "Completed",
            CompletedAt = DateTime.UtcNow.AddDays(-1), // Already completed
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.DeleteCareTaskAsync(2)
        );
        Assert.Contains("Cannot delete completed tasks", exception.Message);
    }

    [Fact]
    public async Task UTCID05_DeleteCareTask_ValidPendingTask_ReturnsTrue()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data - pending task
        dbContext.CareSchedules.Add(new CareSchedule
        {
            ScheduleId = 1,
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "Pending Task",
            Status = "Pending",
            CompletedAt = null, // Not completed
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        // Act
        var result = await service.DeleteCareTaskAsync(1);

        // Assert
        Assert.True(result);

        // Verify task was removed from database
        var deletedTask = await dbContext.CareSchedules.FindAsync(1);
        Assert.Null(deletedTask);

        // Verify count is 0
        var count = await dbContext.CareSchedules.CountAsync();
        Assert.Equal(0, count);
    }

    [Fact]
    public async Task UTCID06_DeleteCareTask_ValidInProgressTask_ReturnsTrue()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<MamMoiDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new MamMoiDbContext(options);

        // Seed data - in-progress task
        dbContext.CareSchedules.Add(new CareSchedule
        {
            ScheduleId = 3,
            TreeId = 1,
            TaskType = "Watering",
            TaskName = "InProgress Task",
            Status = "InProgress",
            CompletedAt = null, // Not completed
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var mockUserRepository = new Mock<IUserRepository>();
        var service = new CareScheduleService(mockUserRepository.Object, dbContext);

        // Act
        var result = await service.DeleteCareTaskAsync(3);

        // Assert
        Assert.True(result);

        // Verify hard delete - task removed from DB
        var deletedTask = await dbContext.CareSchedules.FindAsync(3);
        Assert.Null(deletedTask);
    }
}
