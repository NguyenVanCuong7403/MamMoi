using MamMoi.Application.DTOs.CareSchedule;
using MamMoi.Application.Interfaces;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services.CareSchedules;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace MamMoi.Test
{
    public class FarmerGetTaskDetailTest
    {
        private readonly ICareScheduleService _service;
        private readonly MamMoiDbContext _context;

        public FarmerGetTaskDetailTest()
        {
            var options = new DbContextOptionsBuilder<MamMoiDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new MamMoiDbContext(options);
            var mockUserRepository = new Mock<IUserRepository>();
            _service = new CareScheduleService(mockUserRepository.Object, _context);

            // Seed data
            SeedTestData();
        }

        private void SeedTestData()
        {
            var user = new User
            {
                UserId = 1,
                FullName = "Farmer Test",
                Email = "farmer@test.com",
                PasswordHash = Encoding.UTF8.GetBytes("hashed_password_123"),
                RoleId = 4,
                IsActive = true
            };

            var garden = new Garden
            {
                GardenId = 1,
                UserId = 1,
                Name = "Test Garden",
                Status = "Active"
            };

            var tree = new Tree
            {
                TreeId = 1,
                GardenId = 1,
                UserId = 1,
                TreeName = "Apple Tree",
                TreeTypeId = 1,
                StageId = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var careTask = new CareSchedule
            {
                ScheduleId = 100,
                TreeId = 1,
                TaskType = "Watering",
                TaskName = "Morning Watering",
                Description = "Water the apple tree",
                ScheduledDate = DateOnly.FromDateTime(DateTime.UtcNow),
                ScheduledTimeOfDay = "Morning",
                EstimatedDurationMinutes = 30,
                Status = "Pending",
                Priority = "Medium",
                WaterAmountLiters = 10.5m,
                IsRecurring = false,
                CreatedAt = DateTime.UtcNow
            };

            var completedTask = new CareSchedule
            {
                ScheduleId = 200,
                TreeId = 1,
                TaskType = "Fertilizing",
                TaskName = "Monthly Fertilizing",
                Description = "Apply organic fertilizer",
                ScheduledDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)),
                ScheduledTimeOfDay = "Afternoon",
                EstimatedDurationMinutes = 45,
                Status = "Completed",
                Priority = "High",
                CompletedAt = DateTime.UtcNow.AddHours(-2),
                CompletedByUserId = 1,
                FertilizerAmountGrams = 500,
                ActualFertilizerAmountGrams = 480,
                ResultRating = 5,
                CompletionNotes = "Task completed successfully",
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            };

            _context.Users.Add(user);
            _context.Gardens.Add(garden);
            _context.Trees.Add(tree);
            _context.CareSchedules.AddRange(careTask, completedTask);
            _context.SaveChanges();
        }

        /// <summary>
        /// Test ID: FarmerGetTaskDetail_001
        /// Description: Successfully retrieve care task detail by valid ScheduleId
        /// Precondition: 
        /// - ScheduleId = 100 exists in database
        /// - Task is Pending status
        /// Expected Result: Return CareTaskDetailDto with correct data
        /// </summary>
        [Fact]
        public async Task GetTaskDetailAsync_ValidScheduleId_ReturnsCareTaskDetailDto()
        {
            // Arrange
            int scheduleId = 100;

            // Act
            var result = await _service.GetTaskDetailAsync(scheduleId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(100, result.ScheduleId);
            Assert.Equal(1, result.TreeId);
            Assert.Equal("Watering", result.TaskType);
            Assert.Equal("Morning Watering", result.TaskName);
            Assert.Equal("Water the apple tree", result.Description);
            Assert.Equal("Morning", result.ScheduledTimeOfDay);
            Assert.Equal(30, result.EstimatedDurationMinutes);
            Assert.Equal("Pending", result.Status);
            Assert.Equal("Medium", result.Priority);
            Assert.Equal(10.5m, result.WaterAmountLiters);
            Assert.False(result.IsRecurring);
            Assert.Null(result.CompletedAt);
        }

        /// <summary>
        /// Test ID: FarmerGetTaskDetail_002
        /// Description: Retrieve completed care task with completion details
        /// Precondition: 
        /// - ScheduleId = 200 exists in database
        /// - Task is Completed status
        /// - CompletedAt, CompletedByUserId, ResultRating populated
        /// Expected Result: Return CareTaskDetailDto with completion data
        /// </summary>
        [Fact]
        public async Task GetTaskDetailAsync_CompletedTask_ReturnsWithCompletionDetails()
        {
            // Arrange
            int scheduleId = 200;

            // Act
            var result = await _service.GetTaskDetailAsync(scheduleId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.ScheduleId);
            Assert.Equal("Completed", result.Status);
            Assert.NotNull(result.CompletedAt);
            Assert.Equal("Farmer Test", result.CompletedByUserName);
            Assert.Equal(500, result.FertilizerAmountGrams);
            Assert.Equal(480, result.ActualFertilizerAmountGrams);
            Assert.Equal(5, result.ResultRating);
            Assert.Equal("Task completed successfully", result.CompletionNotes);
        }

        /// <summary>
        /// Test ID: FarmerGetTaskDetail_003
        /// Description: Return null when ScheduleId does not exist
        /// Precondition: 
        /// - ScheduleId = 999 does not exist in database
        /// Expected Result: Return null
        /// </summary>
        [Fact]
        public async Task GetTaskDetailAsync_NonExistentScheduleId_ReturnsNull()
        {
            // Arrange
            int scheduleId = 999;

            // Act
            var result = await _service.GetTaskDetailAsync(scheduleId);

            // Assert
            Assert.Null(result);
        }

        /// <summary>
        /// Test ID: FarmerGetTaskDetail_004
        /// Description: Throw ArgumentException when ScheduleId is zero
        /// Precondition: 
        /// - ScheduleId = 0
        /// Expected Result: Throw ArgumentException with message "Invalid ScheduleId"
        /// </summary>
        [Fact]
        public async Task GetTaskDetailAsync_ScheduleIdIsZero_ThrowsArgumentException()
        {
            // Arrange
            int scheduleId = 0;

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(
                () => _service.GetTaskDetailAsync(scheduleId)
            );
            Assert.Equal("Invalid ScheduleId", exception.Message);
        }

        /// <summary>
        /// Test ID: FarmerGetTaskDetail_005
        /// Description: Throw ArgumentException when ScheduleId is negative
        /// Precondition: 
        /// - ScheduleId = -5
        /// Expected Result: Throw ArgumentException with message "Invalid ScheduleId"
        /// </summary>
        [Fact]
        public async Task GetTaskDetailAsync_ScheduleIdIsNegative_ThrowsArgumentException()
        {
            // Arrange
            int scheduleId = -5;

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(
                () => _service.GetTaskDetailAsync(scheduleId)
            );
            Assert.Equal("Invalid ScheduleId", exception.Message);
        }

        /// <summary>
        /// Test ID: FarmerGetTaskDetail_006
        /// Description: Retrieve task with all optional fields populated
        /// Precondition: 
        /// - Create task with all optional fields filled
        /// - RecurrencePattern, Notes, PhotoUrls, etc.
        /// Expected Result: Return DTO with all fields correctly mapped
        /// </summary>
        [Fact]
        public async Task GetTaskDetailAsync_AllOptionalFieldsPopulated_ReturnsCompleteDto()
        {
            // Arrange
            var fullTask = new CareSchedule
            {
                ScheduleId = 300,
                TreeId = 1,
                TaskType = "Pest Control",
                TaskName = "Weekly Pest Inspection",
                Description = "Check for pests and diseases",
                ScheduledDate = DateOnly.FromDateTime(DateTime.UtcNow),
                ScheduledTimeOfDay = "Evening",
                EstimatedDurationMinutes = 60,
                Status = "Pending",
                Priority = "Critical",
                WaterAmountLiters = 5.0m,
                WaterSource = "Rainwater",
                FertilizerType = "Organic",
                FertilizerAmountGrams = 200,
                ApplicationMethod = "Spray",
                PruningType = "Light",
                PruningNotes = "Remove dead branches",
                IsRecurring = true,
                RecurrencePattern = "Weekly",
                Notes = "Check leaves carefully",
                PhotoUrls = "https://example.com/photo1.jpg,https://example.com/photo2.jpg",
                CreatedAt = DateTime.UtcNow
            };

            _context.CareSchedules.Add(fullTask);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetTaskDetailAsync(300);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(300, result.ScheduleId);
            Assert.Equal("Pest Control", result.TaskType);
            Assert.Equal("Weekly Pest Inspection", result.TaskName);
            Assert.Equal("Evening", result.ScheduledTimeOfDay);
            Assert.Equal("Critical", result.Priority);
            Assert.Equal("Rainwater", result.WaterSource);
            Assert.Equal("Organic", result.FertilizerType);
            Assert.Equal("Spray", result.ApplicationMethod);
            Assert.Equal("Light", result.PruningType);
            Assert.Equal("Remove dead branches", result.PruningNotes);
            Assert.True(result.IsRecurring);
            Assert.Equal("Weekly", result.RecurrencePattern);
            Assert.Equal("Check leaves carefully", result.Notes);
            Assert.Contains("photo1.jpg", result.PhotoUrls);
        }
    }
}
