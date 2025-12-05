using MamMoi.Application.DTOs.CareSchedule;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services.CareSchedules;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Text;
using Xunit;

namespace MamMoi.Test
{
    /// <summary>
    /// Test class for GetTodayTasksAsync method in CareScheduleService
    /// Tests various scenarios for retrieving today's care tasks
    /// </summary>
    public class FarmerGetTodayTasksTest
    {
        private readonly DbContextOptions<MamMoiDbContext> _dbContextOptions;
        private readonly Mock<IUserRepository> _mockUserRepo;

        public FarmerGetTodayTasksTest()
        {
            _dbContextOptions = new DbContextOptionsBuilder<MamMoiDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _mockUserRepo = new Mock<IUserRepository>();
        }

        /// <summary>
        /// Test ID: UTCID01
        /// Description: Get all today's tasks without treeId filter - returns all tasks scheduled for today
        /// Precondition: Database contains tasks scheduled for today, yesterday, and tomorrow
        /// Expected Result: Returns list of all today's tasks ordered by ScheduledTimeOfDay
        /// </summary>
        [Fact]
        public async Task GetTodayTasksAsync_NoTreeIdFilter_ReturnsAllTodayTasks()
        {
            // Arrange
            using var context = new MamMoiDbContext(_dbContextOptions);
            var service = new CareScheduleService(_mockUserRepo.Object, context);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var yesterday = today.AddDays(-1);
            var tomorrow = today.AddDays(1);

            var user = new User
            {
                UserId = 1,
                FullName = "Test User",
                Email = "test@example.com",
                PasswordHash = Encoding.UTF8.GetBytes("hashed_password_123"),
                RoleId = 4,
                IsActive = true
            };
            context.Users.Add(user);

            var garden = new Garden
            {
                GardenId = 1,
                UserId = 1,
                Name = "Test Garden",
                Status = "Active"
            };
            context.Gardens.Add(garden);

            var trees = new List<Tree>
            {
                new Tree { TreeId = 1, TreeName = "Tree 1", TreeTypeId = 1, StageId = 1, GardenId = 1, UserId = 1, IsActive = true, CreatedAt = DateTime.UtcNow },
                new Tree { TreeId = 2, TreeName = "Tree 2", TreeTypeId = 1, StageId = 1, GardenId = 1, UserId = 1, IsActive = true, CreatedAt = DateTime.UtcNow }
            };
            context.Trees.AddRange(trees);

            var schedules = new List<CareSchedule>
            {
                new CareSchedule { ScheduleId = 1, TreeId = 1, TaskType = "Watering", TaskName = "Morning Water", ScheduledDate = today, ScheduledTimeOfDay = "08:00", Status = "Pending", Priority = "High", CreatedAt = DateTime.UtcNow },
                new CareSchedule { ScheduleId = 2, TreeId = 2, TaskType = "Fertilizing", TaskName = "Afternoon Fertilize", ScheduledDate = today, ScheduledTimeOfDay = "14:00", Status = "Pending", Priority = "Medium", CreatedAt = DateTime.UtcNow },
                new CareSchedule { ScheduleId = 3, TreeId = 1, TaskType = "Watering", TaskName = "Yesterday Task", ScheduledDate = yesterday, ScheduledTimeOfDay = "09:00", Status = "Completed", Priority = "Low", CreatedAt = DateTime.UtcNow },
                new CareSchedule { ScheduleId = 4, TreeId = 2, TaskType = "Pruning", TaskName = "Tomorrow Task", ScheduledDate = tomorrow, ScheduledTimeOfDay = "10:00", Status = "Pending", Priority = "High", CreatedAt = DateTime.UtcNow }
            };
            context.CareSchedules.AddRange(schedules);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetTodayTasksAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Equal(1, result[0].ScheduleId); // Morning task first (08:00)
            Assert.Equal(2, result[1].ScheduleId); // Afternoon task second (14:00)
            Assert.All(result, task => Assert.Equal(today, task.ScheduledDate));
        }

        /// <summary>
        /// Test ID: UTCID02
        /// Description: Get today's tasks with valid treeId filter - returns only tasks for specified tree
        /// Precondition: Database contains tasks for multiple trees scheduled for today
        /// Expected Result: Returns list of tasks only for the specified treeId
        /// </summary>
        [Fact]
        public async Task GetTodayTasksAsync_ValidTreeId_ReturnsFilteredTasks()
        {
            // Arrange
            using var context = new MamMoiDbContext(_dbContextOptions);
            var service = new CareScheduleService(_mockUserRepo.Object, context);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var user = new User
            {
                UserId = 1,
                FullName = "Test User",
                Email = "test@example.com",
                PasswordHash = Encoding.UTF8.GetBytes("hashed_password_123"),
                RoleId = 4,
                IsActive = true
            };
            context.Users.Add(user);

            var garden = new Garden
            {
                GardenId = 1,
                UserId = 1,
                Name = "Test Garden",
                Status = "Active"
            };
            context.Gardens.Add(garden);

            var trees = new List<Tree>
            {
                new Tree { TreeId = 1, TreeName = "Tree 1", TreeTypeId = 1, StageId = 1, GardenId = 1, UserId = 1, IsActive = true, CreatedAt = DateTime.UtcNow },
                new Tree { TreeId = 2, TreeName = "Tree 2", TreeTypeId = 1, StageId = 1, GardenId = 1, UserId = 1, IsActive = true, CreatedAt = DateTime.UtcNow }
            };
            context.Trees.AddRange(trees);

            var schedules = new List<CareSchedule>
            {
                new CareSchedule { ScheduleId = 1, TreeId = 1, TaskType = "Watering", TaskName = "Task for Tree 1", ScheduledDate = today, ScheduledTimeOfDay = "08:00", Status = "Pending", Priority = "High", CreatedAt = DateTime.UtcNow },
                new CareSchedule { ScheduleId = 2, TreeId = 2, TaskType = "Fertilizing", TaskName = "Task for Tree 2", ScheduledDate = today, ScheduledTimeOfDay = "14:00", Status = "Pending", Priority = "Medium", CreatedAt = DateTime.UtcNow },
                new CareSchedule { ScheduleId = 3, TreeId = 1, TaskType = "Pruning", TaskName = "Another Task for Tree 1", ScheduledDate = today, ScheduledTimeOfDay = "16:00", Status = "Pending", Priority = "Low", CreatedAt = DateTime.UtcNow }
            };
            context.CareSchedules.AddRange(schedules);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetTodayTasksAsync(treeId: 1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.All(result, task => Assert.Equal(1, task.TreeId));
            Assert.Equal(1, result[0].ScheduleId); // 08:00 first
            Assert.Equal(3, result[1].ScheduleId); // 16:00 second
        }

        /// <summary>
        /// Test ID: UTCID03
        /// Description: Get today's tasks with zero treeId - should return all tasks (filter ignored)
        /// Precondition: Database contains tasks for multiple trees scheduled for today
        /// Expected Result: Returns all today's tasks as treeId=0 doesn't trigger filter
        /// </summary>
        [Fact]
        public async Task GetTodayTasksAsync_TreeIdZero_ReturnsAllTasks()
        {
            // Arrange
            using var context = new MamMoiDbContext(_dbContextOptions);
            var service = new CareScheduleService(_mockUserRepo.Object, context);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var user = new User
            {
                UserId = 1,
                FullName = "Test User",
                Email = "test@example.com",
                PasswordHash = Encoding.UTF8.GetBytes("hashed_password_123"),
                RoleId = 4,
                IsActive = true
            };
            context.Users.Add(user);

            var garden = new Garden
            {
                GardenId = 1,
                UserId = 1,
                Name = "Test Garden",
                Status = "Active"
            };
            context.Gardens.Add(garden);

            var trees = new List<Tree>
            {
                new Tree { TreeId = 1, TreeName = "Tree 1", TreeTypeId = 1, StageId = 1, GardenId = 1, UserId = 1, IsActive = true, CreatedAt = DateTime.UtcNow },
                new Tree { TreeId = 2, TreeName = "Tree 2", TreeTypeId = 1, StageId = 1, GardenId = 1, UserId = 1, IsActive = true, CreatedAt = DateTime.UtcNow }
            };
            context.Trees.AddRange(trees);

            var schedules = new List<CareSchedule>
            {
                new CareSchedule { ScheduleId = 1, TreeId = 1, TaskType = "Watering", TaskName = "Task 1", ScheduledDate = today, ScheduledTimeOfDay = "08:00", Status = "Pending", Priority = "High", CreatedAt = DateTime.UtcNow },
                new CareSchedule { ScheduleId = 2, TreeId = 2, TaskType = "Fertilizing", TaskName = "Task 2", ScheduledDate = today, ScheduledTimeOfDay = "14:00", Status = "Pending", Priority = "Medium", CreatedAt = DateTime.UtcNow }
            };
            context.CareSchedules.AddRange(schedules);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetTodayTasksAsync(treeId: 0);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Contains(result, t => t.TreeId == 1);
            Assert.Contains(result, t => t.TreeId == 2);
        }

        /// <summary>
        /// Test ID: UTCID04
        /// Description: Get today's tasks with negative treeId - should return all tasks (filter ignored)
        /// Precondition: Database contains tasks for multiple trees scheduled for today
        /// Expected Result: Returns all today's tasks as negative treeId doesn't trigger filter
        /// </summary>
        [Fact]
        public async Task GetTodayTasksAsync_NegativeTreeId_ReturnsAllTasks()
        {
            // Arrange
            using var context = new MamMoiDbContext(_dbContextOptions);
            var service = new CareScheduleService(_mockUserRepo.Object, context);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var user = new User
            {
                UserId = 1,
                FullName = "Test User",
                Email = "test@example.com",
                PasswordHash = Encoding.UTF8.GetBytes("hashed_password_123"),
                RoleId = 4,
                IsActive = true
            };
            context.Users.Add(user);

            var garden = new Garden
            {
                GardenId = 1,
                UserId = 1,
                Name = "Test Garden",
                Status = "Active"
            };
            context.Gardens.Add(garden);

            var trees = new List<Tree>
            {
                new Tree { TreeId = 1, TreeName = "Tree 1", TreeTypeId = 1, StageId = 1, GardenId = 1, UserId = 1, IsActive = true, CreatedAt = DateTime.UtcNow },
                new Tree { TreeId = 2, TreeName = "Tree 2", TreeTypeId = 1, StageId = 1, GardenId = 1, UserId = 1, IsActive = true, CreatedAt = DateTime.UtcNow }
            };
            context.Trees.AddRange(trees);

            var schedules = new List<CareSchedule>
            {
                new CareSchedule { ScheduleId = 1, TreeId = 1, TaskType = "Watering", TaskName = "Task 1", ScheduledDate = today, ScheduledTimeOfDay = "08:00", Status = "Pending", Priority = "High", CreatedAt = DateTime.UtcNow },
                new CareSchedule { ScheduleId = 2, TreeId = 2, TaskType = "Fertilizing", TaskName = "Task 2", ScheduledDate = today, ScheduledTimeOfDay = "14:00", Status = "Pending", Priority = "Medium", CreatedAt = DateTime.UtcNow }
            };
            context.CareSchedules.AddRange(schedules);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetTodayTasksAsync(treeId: -1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Contains(result, t => t.TreeId == 1);
            Assert.Contains(result, t => t.TreeId == 2);
        }

        /// <summary>
        /// Test ID: UTCID05
        /// Description: Get today's tasks when no tasks exist for today - returns empty list
        /// Precondition: Database contains tasks but none scheduled for today
        /// Expected Result: Returns empty list
        /// </summary>
        [Fact]
        public async Task GetTodayTasksAsync_NoTasksToday_ReturnsEmptyList()
        {
            // Arrange
            using var context = new MamMoiDbContext(_dbContextOptions);
            var service = new CareScheduleService(_mockUserRepo.Object, context);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var yesterday = today.AddDays(-1);
            var tomorrow = today.AddDays(1);

            var user = new User
            {
                UserId = 1,
                FullName = "Test User",
                Email = "test@example.com",
                PasswordHash = Encoding.UTF8.GetBytes("hashed_password_123"),
                RoleId = 4,
                IsActive = true
            };
            context.Users.Add(user);

            var garden = new Garden
            {
                GardenId = 1,
                UserId = 1,
                Name = "Test Garden",
                Status = "Active"
            };
            context.Gardens.Add(garden);

            var tree = new Tree
            {
                TreeId = 1,
                TreeName = "Tree 1",
                TreeTypeId = 1,
                StageId = 1,
                GardenId = 1,
                UserId = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Trees.Add(tree);

            var schedules = new List<CareSchedule>
            {
                new CareSchedule { ScheduleId = 1, TreeId = 1, TaskType = "Watering", TaskName = "Yesterday Task", ScheduledDate = yesterday, ScheduledTimeOfDay = "09:00", Status = "Completed", Priority = "Low", CreatedAt = DateTime.UtcNow },
                new CareSchedule { ScheduleId = 2, TreeId = 1, TaskType = "Pruning", TaskName = "Tomorrow Task", ScheduledDate = tomorrow, ScheduledTimeOfDay = "10:00", Status = "Pending", Priority = "High", CreatedAt = DateTime.UtcNow }
            };
            context.CareSchedules.AddRange(schedules);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetTodayTasksAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        /// <summary>
        /// Test ID: UTCID06
        /// Description: Get today's tasks with valid treeId but no tasks exist for that tree today - returns empty list
        /// Precondition: Database contains today's tasks for other trees but not for the specified tree
        /// Expected Result: Returns empty list
        /// </summary>
        [Fact]
        public async Task GetTodayTasksAsync_ValidTreeIdNoTasks_ReturnsEmptyList()
        {
            // Arrange
            using var context = new MamMoiDbContext(_dbContextOptions);
            var service = new CareScheduleService(_mockUserRepo.Object, context);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var user = new User
            {
                UserId = 1,
                FullName = "Test User",
                Email = "test@example.com",
                PasswordHash = Encoding.UTF8.GetBytes("hashed_password_123"),
                RoleId = 4,
                IsActive = true
            };
            context.Users.Add(user);

            var garden = new Garden
            {
                GardenId = 1,
                UserId = 1,
                Name = "Test Garden",
                Status = "Active"
            };
            context.Gardens.Add(garden);

            var trees = new List<Tree>
            {
                new Tree { TreeId = 1, TreeName = "Tree 1", TreeTypeId = 1, StageId = 1, GardenId = 1, UserId = 1, IsActive = true, CreatedAt = DateTime.UtcNow },
                new Tree { TreeId = 2, TreeName = "Tree 2", TreeTypeId = 1, StageId = 1, GardenId = 1, UserId = 1, IsActive = true, CreatedAt = DateTime.UtcNow }
            };
            context.Trees.AddRange(trees);

            var schedules = new List<CareSchedule>
            {
                new CareSchedule { ScheduleId = 1, TreeId = 1, TaskType = "Watering", TaskName = "Task for Tree 1", ScheduledDate = today, ScheduledTimeOfDay = "08:00", Status = "Pending", Priority = "High", CreatedAt = DateTime.UtcNow }
            };
            context.CareSchedules.AddRange(schedules);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetTodayTasksAsync(treeId: 2);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        /// <summary>
        /// Test ID: UTCID06
        /// Description: Get today's tasks and verify ordering by ScheduledTimeOfDay (Morning → Afternoon → Evening → Night)
        /// Precondition: Database contains multiple tasks today with different times: TaskA(Evening), TaskB(Morning), TaskC(Afternoon)
        /// Expected Result: Returns tasks ordered correctly: TaskB(Morning), TaskC(Afternoon), TaskA(Evening)
        /// </summary>
        [Fact]
        public async Task GetTodayTasksAsync_MultipleTasks_OrderedByScheduledTimeOfDay()
        {
            // Arrange
            using var context = new MamMoiDbContext(_dbContextOptions);
            var service = new CareScheduleService(_mockUserRepo.Object, context);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var user = new User
            {
                UserId = 1,
                FullName = "Test User",
                Email = "test@example.com",
                PasswordHash = Encoding.UTF8.GetBytes("hashed_password_123"),
                RoleId = 4,
                IsActive = true
            };
            context.Users.Add(user);

            var garden = new Garden
            {
                GardenId = 1,
                UserId = 1,
                Name = "Test Garden",
                Status = "Active"
            };
            context.Gardens.Add(garden);

            var tree = new Tree
            {
                TreeId = 1,
                TreeName = "Tree 1",
                TreeTypeId = 1,
                StageId = 1,
                GardenId = 1,
                UserId = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Trees.Add(tree);

            var schedules = new List<CareSchedule>
            {
                new CareSchedule { ScheduleId = 1, TreeId = 1, TaskType = "Watering", TaskName = "TaskA", ScheduledDate = today, ScheduledTimeOfDay = "Evening", Status = "Pending", Priority = "High", CreatedAt = DateTime.UtcNow },
                new CareSchedule { ScheduleId = 2, TreeId = 1, TaskType = "Fertilizing", TaskName = "TaskB", ScheduledDate = today, ScheduledTimeOfDay = "Morning", Status = "Pending", Priority = "Medium", CreatedAt = DateTime.UtcNow },
                new CareSchedule { ScheduleId = 3, TreeId = 1, TaskType = "Pruning", TaskName = "TaskC", ScheduledDate = today, ScheduledTimeOfDay = "Afternoon", Status = "Pending", Priority = "Low", CreatedAt = DateTime.UtcNow }
            };
            context.CareSchedules.AddRange(schedules);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetTodayTasksAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Count);
            // Verify ordering: Afternoon < Evening < Morning (alphabetical order)
            Assert.Equal("TaskC", result[0].TaskName); // Afternoon
            Assert.Equal("TaskA", result[1].TaskName); // Evening
            Assert.Equal("TaskB", result[2].TaskName); // Morning
        }

        /// <summary>
        /// Test ID: UTCID08
        /// Description: Get today's tasks and verify eager loading of CompletedByUser (Include relationship)
        /// Precondition: Database contains a completed task today with CompletedByUser = "User A"
        /// Expected Result: Returns task with CompletedByUserName = "User A"
        /// </summary>
        [Fact]
        public async Task GetTodayTasksAsync_CompletedTask_IncludesCompletedByUserName()
        {
            // Arrange
            using var context = new MamMoiDbContext(_dbContextOptions);
            var service = new CareScheduleService(_mockUserRepo.Object, context);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var completedByUser = new User
            {
                UserId = 1,
                FullName = "User A",
                Email = "usera@example.com",
                PasswordHash = Encoding.UTF8.GetBytes("hashed_password_123"),
                RoleId = 4,
                IsActive = true
            };
            context.Users.Add(completedByUser);

            var garden = new Garden
            {
                GardenId = 1,
                UserId = 1,
                Name = "Test Garden",
                Status = "Active"
            };
            context.Gardens.Add(garden);

            var tree = new Tree
            {
                TreeId = 1,
                TreeName = "Tree 1",
                TreeTypeId = 1,
                StageId = 1,
                GardenId = 1,
                UserId = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Trees.Add(tree);

            var schedule = new CareSchedule
            {
                ScheduleId = 1,
                TreeId = 1,
                TaskType = "Watering",
                TaskName = "Task1",
                ScheduledDate = today,
                ScheduledTimeOfDay = "Morning",
                Status = "Completed",
                Priority = "High",
                CompletedAt = DateTime.UtcNow,
                CompletedByUserId = 1,
                CreatedAt = DateTime.UtcNow
            };
            context.CareSchedules.Add(schedule);
            await context.SaveChangesAsync();

            // Act
            var result = await service.GetTodayTasksAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal("Task1", result[0].TaskName);
            Assert.Equal("User A", result[0].CompletedByUserName);
            Assert.Equal("Completed", result[0].Status);
        }
    }
}
