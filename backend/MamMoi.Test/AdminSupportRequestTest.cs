using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services.SupportRequests;
using MamMoi.Application.DTOs.SupportRequest;
using MamMoi.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace MamMoi.Test
{
    public class AdminSupportRequestTest
    {
        private MamMoiDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<MamMoiDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new MamMoiDbContext(options);
        }

        private AdminSupportRequestService GetService(
            MamMoiDbContext context,
            out Mock<INotificationService> notificationServiceMock)
        {
            var logger = new Mock<ILogger<AdminSupportRequestService>>();
            notificationServiceMock = new Mock<INotificationService>();

            // Mock notification methods
            notificationServiceMock
                .Setup(s => s.NotifyUserOnSupportRequestResolvedAsync(
                    It.IsAny<int>(),
                    It.IsAny<int>(),
                    It.IsAny<string?>()))
                .Returns(Task.CompletedTask);

            notificationServiceMock
                .Setup(s => s.NotifyUserOnSupportRequestClosedAsync(
                    It.IsAny<int>(),
                    It.IsAny<int>(),
                    It.IsAny<string?>()))
                .Returns(Task.CompletedTask);

            notificationServiceMock
                .Setup(s => s.NotifyUserOnSupportRequestResponseAsync(
                    It.IsAny<int>(),
                    It.IsAny<int>(),
                    It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            return new AdminSupportRequestService(
                context,
                logger.Object,
                notificationServiceMock.Object);
        }

        // ============================================================
        // TEST 1 — GetAllRequestsAsync: No filters
        // ============================================================
        [Fact]
        public async Task GetAllRequestsAsync_NoFilters_ReturnsAllRequests()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User 1",
                Email = "user1@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            db.SupportRequests.AddRange(
                new SupportRequest
                {
                    RequestId = 1,
                    UserId = 1,
                    Subject = "Request 1",
                    Description = "Description 1",
                    Priority = "High",
                    Status = "Open",
                    Category = "Technical",
                    RequestDate = DateTime.UtcNow,
                    ResponseCount = 0
                },
                new SupportRequest
                {
                    RequestId = 2,
                    UserId = 1,
                    Subject = "Request 2",
                    Description = "Description 2",
                    Priority = "Low",
                    Status = "Resolved",
                    Category = "Billing",
                    RequestDate = DateTime.UtcNow,
                    ResponseCount = 1
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var (requests, totalCount) = await service.GetAllRequestsAsync();

            Assert.Equal(2, totalCount);
            Assert.Equal(2, requests.Count);
        }

        // ============================================================
        // TEST 2 — GetAllRequestsAsync: Filter by status
        // ============================================================
        [Fact]
        public async Task GetAllRequestsAsync_FilterByStatus_ReturnsCorrectRequests()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User 1",
                Email = "user1@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            db.SupportRequests.AddRange(
                new SupportRequest
                {
                    RequestId = 1,
                    UserId = 1,
                    Subject = "Request 1",
                    Description = "Description 1",
                    Priority = "High",
                    Status = "Open",
                    Category = "Technical",
                    RequestDate = DateTime.UtcNow,
                    ResponseCount = 0
                },
                new SupportRequest
                {
                    RequestId = 2,
                    UserId = 1,
                    Subject = "Request 2",
                    Description = "Description 2",
                    Priority = "Low",
                    Status = "Resolved",
                    Category = "Billing",
                    RequestDate = DateTime.UtcNow,
                    ResponseCount = 1
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var (requests, totalCount) = await service.GetAllRequestsAsync(status: "Open");

            Assert.Equal(1, totalCount);
            Assert.Single(requests);
            Assert.Equal("Open", requests[0].Status);
        }

        // ============================================================
        // TEST 3 — GetAllRequestsAsync: Filter by priority
        // ============================================================
        [Fact]
        public async Task GetAllRequestsAsync_FilterByPriority_ReturnsCorrectRequests()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User 1",
                Email = "user1@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            db.SupportRequests.AddRange(
                new SupportRequest
                {
                    RequestId = 1,
                    UserId = 1,
                    Subject = "Request 1",
                    Description = "Description 1",
                    Priority = "High",
                    Status = "Open",
                    Category = "Technical",
                    RequestDate = DateTime.UtcNow,
                    ResponseCount = 0
                },
                new SupportRequest
                {
                    RequestId = 2,
                    UserId = 1,
                    Subject = "Request 2",
                    Description = "Description 2",
                    Priority = "Low",
                    Status = "Open",
                    Category = "Billing",
                    RequestDate = DateTime.UtcNow,
                    ResponseCount = 0
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var (requests, totalCount) = await service.GetAllRequestsAsync(priority: "High");

            Assert.Equal(1, totalCount);
            Assert.Single(requests);
            Assert.Equal("High", requests[0].Priority);
        }

        // ============================================================
        // TEST 4 — GetAllRequestsAsync: Filter by category
        // ============================================================
        [Fact]
        public async Task GetAllRequestsAsync_FilterByCategory_ReturnsCorrectRequests()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User 1",
                Email = "user1@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            db.SupportRequests.AddRange(
                new SupportRequest
                {
                    RequestId = 1,
                    UserId = 1,
                    Subject = "Request 1",
                    Description = "Description 1",
                    Priority = "High",
                    Status = "Open",
                    Category = "Technical",
                    RequestDate = DateTime.UtcNow,
                    ResponseCount = 0
                },
                new SupportRequest
                {
                    RequestId = 2,
                    UserId = 1,
                    Subject = "Request 2",
                    Description = "Description 2",
                    Priority = "Low",
                    Status = "Open",
                    Category = "Billing",
                    RequestDate = DateTime.UtcNow,
                    ResponseCount = 0
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var (requests, totalCount) = await service.GetAllRequestsAsync(category: "Technical");

            Assert.Equal(1, totalCount);
            Assert.Single(requests);
            Assert.Equal("Technical", requests[0].Category);
        }

        // ============================================================
        // TEST 5 — GetAllRequestsAsync: Filter by userId
        // ============================================================
        [Fact]
        public async Task GetAllRequestsAsync_FilterByUserId_ReturnsCorrectRequests()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.AddRange(
                new User
                {
                    UserId = 1,
                    RoleId = 1,
                    FullName = "User 1",
                    Email = "user1@test.com",
                    PasswordHash = new byte[] { 1, 2, 3 },
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    UserId = 2,
                    RoleId = 1,
                    FullName = "User 2",
                    Email = "user2@test.com",
                    PasswordHash = new byte[] { 1, 2, 3 },
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            );

            db.SupportRequests.AddRange(
                new SupportRequest
                {
                    RequestId = 1,
                    UserId = 1,
                    Subject = "Request 1",
                    Description = "Description 1",
                    Priority = "High",
                    Status = "Open",
                    Category = "Technical",
                    RequestDate = DateTime.UtcNow,
                    ResponseCount = 0
                },
                new SupportRequest
                {
                    RequestId = 2,
                    UserId = 2,
                    Subject = "Request 2",
                    Description = "Description 2",
                    Priority = "Low",
                    Status = "Open",
                    Category = "Billing",
                    RequestDate = DateTime.UtcNow,
                    ResponseCount = 0
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var (requests, totalCount) = await service.GetAllRequestsAsync(userId: 1);

            Assert.Equal(1, totalCount);
            Assert.Single(requests);
            Assert.Equal(1, requests[0].UserId);
        }

        // ============================================================
        // TEST 6 — GetAllRequestsAsync: Filter by date range
        // ============================================================
        [Fact]
        public async Task GetAllRequestsAsync_FilterByDateRange_ReturnsCorrectRequests()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User 1",
                Email = "user1@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            db.SupportRequests.AddRange(
                new SupportRequest
                {
                    RequestId = 1,
                    UserId = 1,
                    Subject = "Request 1",
                    Description = "Description 1",
                    Priority = "High",
                    Status = "Open",
                    Category = "Technical",
                    RequestDate = DateTime.UtcNow.AddDays(-5),
                    ResponseCount = 0
                },
                new SupportRequest
                {
                    RequestId = 2,
                    UserId = 1,
                    Subject = "Request 2",
                    Description = "Description 2",
                    Priority = "Low",
                    Status = "Open",
                    Category = "Billing",
                    RequestDate = DateTime.UtcNow.AddDays(-20),
                    ResponseCount = 0
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var startDate = DateTime.UtcNow.AddDays(-10);
            var endDate = DateTime.UtcNow;
            var (requests, totalCount) = await service.GetAllRequestsAsync(startDate: startDate, endDate: endDate);

            Assert.Equal(1, totalCount);
            Assert.Single(requests);
        }

        // ============================================================
        // TEST 7 — GetAllRequestsAsync: Pagination
        // ============================================================
        [Fact]
        public async Task GetAllRequestsAsync_WithPagination_ReturnsCorrectPage()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User 1",
                Email = "user1@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            for (int i = 1; i <= 30; i++)
            {
                db.SupportRequests.Add(new SupportRequest
                {
                    RequestId = i,
                    UserId = 1,
                    Subject = $"Request {i}",
                    Description = $"Description {i}",
                    Priority = "High",
                    Status = "Open",
                    Category = "Technical",
                    RequestDate = DateTime.UtcNow.AddDays(-i),
                    ResponseCount = 0
                });
            }

            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var (requests, totalCount) = await service.GetAllRequestsAsync(page: 2, pageSize: 10);

            Assert.Equal(30, totalCount);
            Assert.Equal(10, requests.Count);
        }

        // ============================================================
        // TEST 8 — GetRequestByIdAsync: Request not found
        // ============================================================
        [Fact]
        public async Task GetRequestByIdAsync_ReturnsNull_WhenRequestNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db, out var _);

            var result = await service.GetRequestByIdAsync(999);

            Assert.Null(result);
        }

        // ============================================================
        // TEST 9 — GetRequestByIdAsync: Request found
        // ============================================================
        [Fact]
        public async Task GetRequestByIdAsync_ReturnsCorrectData_WhenRequestFound()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User 1",
                Email = "user1@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            db.SupportRequests.Add(new SupportRequest
            {
                RequestId = 1,
                UserId = 1,
                Subject = "Test Request",
                Description = "Test Description",
                Priority = "High",
                Status = "Open",
                Category = "Technical",
                RequestDate = DateTime.UtcNow,
                ResponseCount = 0,
                TicketNumber = "TICKET-001"
            });

            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var result = await service.GetRequestByIdAsync(1);

            Assert.NotNull(result);
            Assert.Equal(1, result.RequestId);
            Assert.Equal("Test Request", result.Subject);
            Assert.Equal("User 1", result.UserFullName);
            Assert.Equal("user1@test.com", result.UserEmail);
            Assert.Equal("TICKET-001", result.TicketNumber);
        }

        // ============================================================
        // TEST 10 — UpdateRequestAsync: Request not found
        // ============================================================
        [Fact]
        public async Task UpdateRequestAsync_ReturnsNull_WhenRequestNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db, out var _);

            var dto = new UpdateSupportRequestDto { Status = "Resolved" };
            var result = await service.UpdateRequestAsync(999, dto);

            Assert.Null(result);
        }

        // ============================================================
        // TEST 11 — UpdateRequestAsync: Update status to Resolved
        // ============================================================
        [Fact]
        public async Task UpdateRequestAsync_UpdatesStatusToResolved()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User 1",
                Email = "user1@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            db.SupportRequests.Add(new SupportRequest
            {
                RequestId = 1,
                UserId = 1,
                Subject = "Test Request",
                Description = "Test Description",
                Priority = "High",
                Status = "Open",
                Category = "Technical",
                RequestDate = DateTime.UtcNow,
                ResponseCount = 0
            });

            await db.SaveChangesAsync();

            var service = GetService(db, out var notificationServiceMock);

            var dto = new UpdateSupportRequestDto
            {
                Status = "Resolved",
                Resolution = "Issue fixed"
            };

            var result = await service.UpdateRequestAsync(1, dto);

            Assert.NotNull(result);
            Assert.Equal("Resolved", result.Status);
            Assert.Equal("Issue fixed", result.Resolution);
            Assert.NotNull(result.ResolvedAt);

            // Verify notification was sent
            notificationServiceMock.Verify(
                s => s.NotifyUserOnSupportRequestResolvedAsync(1, 1, "Issue fixed"),
                Times.Once);
        }

        // ============================================================
        // TEST 12 — UpdateRequestAsync: Update status to Closed
        // ============================================================
        [Fact]
        public async Task UpdateRequestAsync_UpdatesStatusToClosed()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User 1",
                Email = "user1@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            db.SupportRequests.Add(new SupportRequest
            {
                RequestId = 1,
                UserId = 1,
                Subject = "Test Request",
                Description = "Test Description",
                Priority = "High",
                Status = "Open",
                Category = "Technical",
                RequestDate = DateTime.UtcNow,
                ResponseCount = 0
            });

            await db.SaveChangesAsync();

            var service = GetService(db, out var notificationServiceMock);

            var dto = new UpdateSupportRequestDto
            {
                Status = "Closed",
                Resolution = "Request closed"
            };

            var result = await service.UpdateRequestAsync(1, dto);

            Assert.NotNull(result);
            Assert.Equal("Closed", result.Status);
            Assert.NotNull(result.ClosedAt);

            // Verify notification was sent
            notificationServiceMock.Verify(
                s => s.NotifyUserOnSupportRequestClosedAsync(1, 1, "Request closed"),
                Times.Once);
        }

        // ============================================================
        // TEST 13 — UpdateRequestAsync: Update resolution only
        // ============================================================
        [Fact]
        public async Task UpdateRequestAsync_UpdatesResolutionOnly()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User 1",
                Email = "user1@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            db.SupportRequests.Add(new SupportRequest
            {
                RequestId = 1,
                UserId = 1,
                Subject = "Test Request",
                Description = "Test Description",
                Priority = "High",
                Status = "Open",
                Category = "Technical",
                RequestDate = DateTime.UtcNow,
                ResponseCount = 0
            });

            await db.SaveChangesAsync();

            var service = GetService(db, out var notificationServiceMock);

            var dto = new UpdateSupportRequestDto
            {
                Resolution = "Admin response"
            };

            var result = await service.UpdateRequestAsync(1, dto);

            Assert.NotNull(result);
            Assert.Equal("Admin response", result.Resolution);
            Assert.Equal(1, result.ResponseCount);

            // Verify notification was sent
            notificationServiceMock.Verify(
                s => s.NotifyUserOnSupportRequestResponseAsync(1, 1, "Admin response"),
                Times.Once);
        }

        // ============================================================
        // TEST 14 — UpdateRequestAsync: Update category and priority
        // ============================================================
        [Fact]
        public async Task UpdateRequestAsync_UpdatesCategoryAndPriority()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User 1",
                Email = "user1@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            db.SupportRequests.Add(new SupportRequest
            {
                RequestId = 1,
                UserId = 1,
                Subject = "Test Request",
                Description = "Test Description",
                Priority = "High",
                Status = "Open",
                Category = "Technical",
                RequestDate = DateTime.UtcNow,
                ResponseCount = 0
            });

            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var dto = new UpdateSupportRequestDto
            {
                Category = "Billing",
                Priority = "Urgent"
            };

            var result = await service.UpdateRequestAsync(1, dto);

            Assert.NotNull(result);
            Assert.Equal("Billing", result.Category);
            Assert.Equal("Urgent", result.Priority);
        }

        // ============================================================
        // TEST 15 — GetStatisticsAsync: No filters
        // ============================================================
        [Fact]
        public async Task GetStatisticsAsync_NoFilters_ReturnsAllStatistics()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User 1",
                Email = "user1@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            db.SupportRequests.AddRange(
                new SupportRequest
                {
                    RequestId = 1,
                    UserId = 1,
                    Subject = "Request 1",
                    Description = "Description 1",
                    Priority = "High",
                    Status = "Open",
                    Category = "Technical",
                    RequestDate = DateTime.UtcNow,
                    ResponseCount = 0
                },
                new SupportRequest
                {
                    RequestId = 2,
                    UserId = 1,
                    Subject = "Request 2",
                    Description = "Description 2",
                    Priority = "Urgent",
                    Status = "Resolved",
                    Category = "Technical",
                    RequestDate = DateTime.UtcNow.AddHours(-10),
                    ResolvedAt = DateTime.UtcNow,
                    ResponseCount = 1,
                    SatisfactionRating = 5
                },
                new SupportRequest
                {
                    RequestId = 3,
                    UserId = 1,
                    Subject = "Request 3",
                    Description = "Description 3",
                    Priority = "Low",
                    Status = "InProgress",
                    Category = "Billing",
                    RequestDate = DateTime.UtcNow,
                    ResponseCount = 0
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var statistics = await service.GetStatisticsAsync();

            Assert.Equal(3, statistics.TotalRequests);
            Assert.Equal(1, statistics.OpenRequests);
            Assert.Equal(1, statistics.InProgressRequests);
            Assert.Equal(1, statistics.ResolvedRequests);
            Assert.Equal(1, statistics.UrgentRequests);
            Assert.True(statistics.AverageResolutionTimeHours > 0);
            Assert.Equal(5, statistics.AverageSatisfactionRating);
            Assert.Equal(2, statistics.RequestsByCategory["Technical"]);
            Assert.Equal(1, statistics.RequestsByCategory["Billing"]);
        }

        // ============================================================
        // TEST 16 — GetStatisticsAsync: With date range
        // ============================================================
        [Fact]
        public async Task GetStatisticsAsync_WithDateRange_ReturnsFilteredStatistics()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User 1",
                Email = "user1@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            db.SupportRequests.AddRange(
                new SupportRequest
                {
                    RequestId = 1,
                    UserId = 1,
                    Subject = "Request 1",
                    Description = "Description 1",
                    Priority = "High",
                    Status = "Open",
                    Category = "Technical",
                    RequestDate = DateTime.UtcNow.AddDays(-5),
                    ResponseCount = 0
                },
                new SupportRequest
                {
                    RequestId = 2,
                    UserId = 1,
                    Subject = "Request 2",
                    Description = "Description 2",
                    Priority = "Low",
                    Status = "Open",
                    Category = "Billing",
                    RequestDate = DateTime.UtcNow.AddDays(-20),
                    ResponseCount = 0
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var startDate = DateTime.UtcNow.AddDays(-10);
            var endDate = DateTime.UtcNow;
            var statistics = await service.GetStatisticsAsync(startDate: startDate, endDate: endDate);

            Assert.Equal(1, statistics.TotalRequests);
        }
    }
}

