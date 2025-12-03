using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services.Admin;
using MamMoi.Application.DTOs.Admin;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace MamMoi.Test
{
    public class AdminSubscriptionTest
    {
        private MamMoiDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<MamMoiDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new MamMoiDbContext(options);
        }

        private AdminSubscriptionService GetService(MamMoiDbContext context)
        {
            var logger = new Mock<ILogger<AdminSubscriptionService>>();
            return new AdminSubscriptionService(context, logger.Object);
        }

        // ============================================================
        // TEST 1 — GetAllSubscriptionsAsync: No filters
        // ============================================================
        [Fact]
        public async Task GetAllSubscriptionsAsync_NoFilters_ReturnsAllSubscriptions()
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

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            db.Subscriptions.AddRange(
                new Subscription
                {
                    SubscriptionId = 1,
                    UserId = 1,
                    PlanName = "Gói 1",
                    PlanType = "plan1",
                    StartDate = today,
                    EndDate = today.AddMonths(1),
                    Status = "Active",
                    Price = 100,
                    Currency = "VND"
                },
                new Subscription
                {
                    SubscriptionId = 2,
                    UserId = 1,
                    PlanName = "Gói 2",
                    PlanType = "plan2",
                    StartDate = today.AddMonths(-2),
                    EndDate = today.AddMonths(-1),
                    Status = "Inactive",
                    Price = 200,
                    Currency = "VND"
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (subscriptions, totalCount) = await service.GetAllSubscriptionsAsync();

            Assert.Equal(2, totalCount);
            Assert.Equal(2, subscriptions.Count);
        }

        // ============================================================
        // TEST 2 — GetAllSubscriptionsAsync: Filter by status
        // ============================================================
        [Fact]
        public async Task GetAllSubscriptionsAsync_FilterByStatus_ReturnsCorrectSubscriptions()
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

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            db.Subscriptions.AddRange(
                new Subscription
                {
                    SubscriptionId = 1,
                    UserId = 1,
                    PlanName = "Gói 1",
                    PlanType = "plan1",
                    StartDate = today,
                    EndDate = today.AddMonths(1),
                    Status = "Active",
                    Price = 100,
                    Currency = "VND"
                },
                new Subscription
                {
                    SubscriptionId = 2,
                    UserId = 1,
                    PlanName = "Gói 2",
                    PlanType = "plan2",
                    StartDate = today.AddMonths(-2),
                    EndDate = today.AddMonths(-1),
                    Status = "Inactive",
                    Price = 200,
                    Currency = "VND"
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (subscriptions, totalCount) = await service.GetAllSubscriptionsAsync(status: "Active");

            Assert.Equal(1, totalCount);
            Assert.Single(subscriptions);
            Assert.Equal("Active", subscriptions[0].Status);
        }

        // ============================================================
        // TEST 3 — GetAllSubscriptionsAsync: Filter by userId
        // ============================================================
        [Fact]
        public async Task GetAllSubscriptionsAsync_FilterByUserId_ReturnsCorrectSubscriptions()
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

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            db.Subscriptions.AddRange(
                new Subscription
                {
                    SubscriptionId = 1,
                    UserId = 1,
                    PlanName = "Gói 1",
                    PlanType = "plan1",
                    StartDate = today,
                    EndDate = today.AddMonths(1),
                    Status = "Active",
                    Price = 100,
                    Currency = "VND"
                },
                new Subscription
                {
                    SubscriptionId = 2,
                    UserId = 2,
                    PlanName = "Gói 2",
                    PlanType = "plan2",
                    StartDate = today,
                    EndDate = today.AddMonths(1),
                    Status = "Active",
                    Price = 200,
                    Currency = "VND"
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (subscriptions, totalCount) = await service.GetAllSubscriptionsAsync(userId: 1);

            Assert.Equal(1, totalCount);
            Assert.Single(subscriptions);
            Assert.Equal(1, subscriptions[0].UserId);
        }

        // ============================================================
        // TEST 4 — GetAllSubscriptionsAsync: Filter by planName
        // ============================================================
        [Fact]
        public async Task GetAllSubscriptionsAsync_FilterByPlanName_ReturnsCorrectSubscriptions()
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

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            db.Subscriptions.AddRange(
                new Subscription
                {
                    SubscriptionId = 1,
                    UserId = 1,
                    PlanName = "Gói 1",
                    PlanType = "plan1",
                    StartDate = today,
                    EndDate = today.AddMonths(1),
                    Status = "Active",
                    Price = 100,
                    Currency = "VND"
                },
                new Subscription
                {
                    SubscriptionId = 2,
                    UserId = 1,
                    PlanName = "Gói 2",
                    PlanType = "plan2",
                    StartDate = today,
                    EndDate = today.AddMonths(1),
                    Status = "Active",
                    Price = 200,
                    Currency = "VND"
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (subscriptions, totalCount) = await service.GetAllSubscriptionsAsync(planName: "Gói 1");

            Assert.Equal(1, totalCount);
            Assert.Single(subscriptions);
            Assert.Equal("Gói 1", subscriptions[0].PlanName);
        }

        // ============================================================
        // TEST 5 — GetAllSubscriptionsAsync: Filter by date range
        // ============================================================
        [Fact]
        public async Task GetAllSubscriptionsAsync_FilterByDateRange_ReturnsCorrectSubscriptions()
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

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            db.Subscriptions.AddRange(
                new Subscription
                {
                    SubscriptionId = 1,
                    UserId = 1,
                    PlanName = "Gói 1",
                    PlanType = "plan1",
                    StartDate = today.AddDays(-10),
                    EndDate = today.AddDays(20),
                    Status = "Active",
                    Price = 100,
                    Currency = "VND"
                },
                new Subscription
                {
                    SubscriptionId = 2,
                    UserId = 1,
                    PlanName = "Gói 2",
                    PlanType = "plan2",
                    StartDate = today.AddDays(-50),
                    EndDate = today.AddDays(-30),
                    Status = "Inactive",
                    Price = 200,
                    Currency = "VND"
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var startDate = DateTime.UtcNow.AddDays(-20);
            var endDate = DateTime.UtcNow.AddDays(30);
            var (subscriptions, totalCount) = await service.GetAllSubscriptionsAsync(startDate: startDate, endDate: endDate);

            Assert.Equal(1, totalCount);
            Assert.Single(subscriptions);
        }

        // ============================================================
        // TEST 6 — GetAllSubscriptionsAsync: Pagination
        // ============================================================
        [Fact]
        public async Task GetAllSubscriptionsAsync_WithPagination_ReturnsCorrectPage()
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

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            for (int i = 1; i <= 30; i++)
            {
                db.Subscriptions.Add(new Subscription
                {
                    SubscriptionId = i,
                    UserId = 1,
                    PlanName = $"Gói {i}",
                    PlanType = "plan1",
                    StartDate = today.AddDays(-i),
                    EndDate = today.AddDays(-i + 30),
                    Status = "Active",
                    Price = 100,
                    Currency = "VND"
                });
            }

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (subscriptions, totalCount) = await service.GetAllSubscriptionsAsync(page: 2, pageSize: 10);

            Assert.Equal(30, totalCount);
            Assert.Equal(10, subscriptions.Count);
        }

        // ============================================================
        // TEST 7 — GetAllSubscriptionsAsync: With payments
        // ============================================================
        [Fact]
        public async Task GetAllSubscriptionsAsync_WithPayments_ReturnsPaymentInfo()
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

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            db.Subscriptions.Add(new Subscription
            {
                SubscriptionId = 1,
                UserId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                StartDate = today,
                EndDate = today.AddMonths(1),
                Status = "Active",
                Price = 100,
                Currency = "VND"
            });

            db.Payments.AddRange(
                new Payment
                {
                    PaymentId = 1,
                    SubscriptionId = 1,
                    UserId = 1,
                    PaymentDate = DateTime.UtcNow,
                    Amount = 100,
                    Currency = "VND",
                    TransactionStatus = "Completed",
                    CreatedAt = DateTime.UtcNow
                },
                new Payment
                {
                    PaymentId = 2,
                    SubscriptionId = 1,
                    UserId = 1,
                    PaymentDate = DateTime.UtcNow.AddDays(-1),
                    Amount = 50,
                    Currency = "VND",
                    TransactionStatus = "Completed",
                    CreatedAt = DateTime.UtcNow
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (subscriptions, totalCount) = await service.GetAllSubscriptionsAsync();

            Assert.Single(subscriptions);
            Assert.Equal(2, subscriptions[0].PaymentCount);
            Assert.Equal(150, subscriptions[0].TotalPaid);
            Assert.NotNull(subscriptions[0].LastPaymentDate);
        }

        // ============================================================
        // TEST 8 — GetSubscriptionByIdAsync: Subscription not found
        // ============================================================
        [Fact]
        public async Task GetSubscriptionByIdAsync_ReturnsNull_WhenSubscriptionNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.GetSubscriptionByIdAsync(999);

            Assert.Null(result);
        }

        // ============================================================
        // TEST 9 — GetSubscriptionByIdAsync: Subscription found
        // ============================================================
        [Fact]
        public async Task GetSubscriptionByIdAsync_ReturnsCorrectData_WhenSubscriptionFound()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User 1",
                Email = "user1@test.com",
                Phone = "123456789",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            db.Subscriptions.Add(new Subscription
            {
                SubscriptionId = 1,
                UserId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                StartDate = today,
                EndDate = today.AddMonths(1),
                Status = "Active",
                Price = 100,
                Currency = "VND"
            });

            db.Payments.Add(new Payment
            {
                PaymentId = 1,
                SubscriptionId = 1,
                UserId = 1,
                PaymentDate = DateTime.UtcNow,
                Amount = 100,
                Currency = "VND",
                TransactionStatus = "Completed",
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var result = await service.GetSubscriptionByIdAsync(1);

            Assert.NotNull(result);
            Assert.Equal(1, result.SubscriptionId);
            Assert.Equal("Gói 1", result.PlanName);
            Assert.Equal("user1@test.com", result.UserEmail);
            Assert.Equal("123456789", result.UserPhone);
            Assert.Single(result.Payments);
        }

        // ============================================================
        // TEST 10 — UpdateSubscriptionAsync: Subscription not found
        // ============================================================
        [Fact]
        public async Task UpdateSubscriptionAsync_ReturnsNull_WhenSubscriptionNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var dto = new AdminUpdateSubscriptionDto { Status = "Inactive" };
            var result = await service.UpdateSubscriptionAsync(999, dto);

            Assert.Null(result);
        }

        // ============================================================
        // TEST 11 — UpdateSubscriptionAsync: Update status
        // ============================================================
        [Fact]
        public async Task UpdateSubscriptionAsync_UpdatesStatus()
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

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            db.Subscriptions.Add(new Subscription
            {
                SubscriptionId = 1,
                UserId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                StartDate = today,
                EndDate = today.AddMonths(1),
                Status = "Active",
                Price = 100,
                Currency = "VND"
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new AdminUpdateSubscriptionDto { Status = "Inactive" };
            var result = await service.UpdateSubscriptionAsync(1, dto);

            Assert.NotNull(result);
            Assert.Equal("Inactive", result.Status);
        }

        // ============================================================
        // TEST 12 — UpdateSubscriptionAsync: Update end date
        // ============================================================
        [Fact]
        public async Task UpdateSubscriptionAsync_UpdatesEndDate()
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

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            db.Subscriptions.Add(new Subscription
            {
                SubscriptionId = 1,
                UserId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                StartDate = today,
                EndDate = today.AddMonths(1),
                Status = "Active",
                Price = 100,
                Currency = "VND"
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var newEndDate = today.AddMonths(2);
            var dto = new AdminUpdateSubscriptionDto { EndDate = newEndDate };
            var result = await service.UpdateSubscriptionAsync(1, dto);

            Assert.NotNull(result);
            Assert.Equal(newEndDate, result.EndDate);
        }

        // ============================================================
        // TEST 13 — UpdateSubscriptionAsync: Update both status and end date
        // ============================================================
        [Fact]
        public async Task UpdateSubscriptionAsync_UpdatesBothStatusAndEndDate()
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

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            db.Subscriptions.Add(new Subscription
            {
                SubscriptionId = 1,
                UserId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                StartDate = today,
                EndDate = today.AddMonths(1),
                Status = "Active",
                Price = 100,
                Currency = "VND"
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var newEndDate = today.AddMonths(3);
            var dto = new AdminUpdateSubscriptionDto 
            { 
                Status = "Inactive",
                EndDate = newEndDate
            };
            var result = await service.UpdateSubscriptionAsync(1, dto);

            Assert.NotNull(result);
            Assert.Equal("Inactive", result.Status);
            Assert.Equal(newEndDate, result.EndDate);
        }
    }
}

