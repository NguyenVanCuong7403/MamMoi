using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services.SubscriptionPlans;
using MamMoi.Application.DTOs.SubscriptionPlan;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace MamMoi.Test
{
    public class AdminSubscriptionPlanTest
    {
        private MamMoiDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<MamMoiDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new MamMoiDbContext(options);
        }

        private SubscriptionPlanService GetService(MamMoiDbContext context)
        {
            var logger = new Mock<ILogger<SubscriptionPlanService>>();
            return new SubscriptionPlanService(context, logger.Object);
        }

        // ============================================================
        // TEST 1 — GetAllPlansAsync: No filter
        // ============================================================
        [Fact]
        public async Task GetAllPlansAsync_NoFilter_ReturnsAllPlans()
        {
            var db = GetDbContext();

            db.SubscriptionPlans.AddRange(
                new SubscriptionPlan
                {
                    PlanId = 1,
                    PlanName = "Free",
                    PlanType = null,
                    Price = 0,
                    Currency = "VND",
                    IsActive = true
                },
                new SubscriptionPlan
                {
                    PlanId = 2,
                    PlanName = "Gói 1",
                    PlanType = "plan1",
                    Price = 100,
                    Currency = "VND",
                    IsActive = true
                },
                new SubscriptionPlan
                {
                    PlanId = 3,
                    PlanName = "Gói 2",
                    PlanType = "plan2",
                    Price = 200,
                    Currency = "VND",
                    IsActive = false
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var plans = await service.GetAllPlansAsync();

            Assert.Equal(3, plans.Count);
        }

        // ============================================================
        // TEST 2 — GetAllPlansAsync: Filter by isActive = true
        // ============================================================
        [Fact]
        public async Task GetAllPlansAsync_FilterActiveTrue_ReturnsOnlyActivePlans()
        {
            var db = GetDbContext();

            db.SubscriptionPlans.AddRange(
                new SubscriptionPlan
                {
                    PlanId = 1,
                    PlanName = "Free",
                    PlanType = null,
                    Price = 0,
                    Currency = "VND",
                    IsActive = true
                },
                new SubscriptionPlan
                {
                    PlanId = 2,
                    PlanName = "Gói 1",
                    PlanType = "plan1",
                    Price = 100,
                    Currency = "VND",
                    IsActive = true
                },
                new SubscriptionPlan
                {
                    PlanId = 3,
                    PlanName = "Gói 2",
                    PlanType = "plan2",
                    Price = 200,
                    Currency = "VND",
                    IsActive = false
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var plans = await service.GetAllPlansAsync(isActive: true);

            Assert.Equal(2, plans.Count);
            Assert.All(plans, p => Assert.True(p.IsActive));
        }

        // ============================================================
        // TEST 3 — GetAllPlansAsync: Filter by isActive = false
        // ============================================================
        [Fact]
        public async Task GetAllPlansAsync_FilterActiveFalse_ReturnsOnlyInactivePlans()
        {
            var db = GetDbContext();

            db.SubscriptionPlans.AddRange(
                new SubscriptionPlan
                {
                    PlanId = 1,
                    PlanName = "Free",
                    PlanType = null,
                    Price = 0,
                    Currency = "VND",
                    IsActive = true
                },
                new SubscriptionPlan
                {
                    PlanId = 2,
                    PlanName = "Gói 1",
                    PlanType = "plan1",
                    Price = 100,
                    Currency = "VND",
                    IsActive = false
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var plans = await service.GetAllPlansAsync(isActive: false);

            Assert.Single(plans);
            Assert.False(plans[0].IsActive);
        }

        // ============================================================
        // TEST 4 — GetPlanByIdAsync: Plan not found
        // ============================================================
        [Fact]
        public async Task GetPlanByIdAsync_ReturnsNull_WhenPlanNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.GetPlanByIdAsync(999);

            Assert.Null(result);
        }

        // ============================================================
        // TEST 5 — GetPlanByIdAsync: Invalid planId
        // ============================================================
        [Fact]
        public async Task GetPlanByIdAsync_ReturnsNull_WhenPlanIdInvalid()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.GetPlanByIdAsync(0);

            Assert.Null(result);
        }

        // ============================================================
        // TEST 6 — GetPlanByIdAsync: Plan found
        // ============================================================
        [Fact]
        public async Task GetPlanByIdAsync_ReturnsCorrectData_WhenPlanFound()
        {
            var db = GetDbContext();

            db.SubscriptionPlans.Add(new SubscriptionPlan
            {
                PlanId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                Price = 100,
                Currency = "VND",
                Description = "Test description",
                Features = "Feature 1, Feature 2",
                MaxGardens = 5,
                MaxTreesPerGarden = 10,
                DurationInMonths = 1,
                IsActive = true
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var result = await service.GetPlanByIdAsync(1);

            Assert.NotNull(result);
            Assert.Equal(1, result.PlanId);
            Assert.Equal("Gói 1", result.PlanName);
            Assert.Equal("plan1", result.PlanType);
            Assert.Equal(100, result.Price);
        }

        // ============================================================
        // TEST 7 — GetPlanByNameAsync: Plan not found
        // ============================================================
        [Fact]
        public async Task GetPlanByNameAsync_ReturnsNull_WhenPlanNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.GetPlanByNameAsync("NonExistent");

            Assert.Null(result);
        }

        // ============================================================
        // TEST 8 — GetPlanByNameAsync: Empty name
        // ============================================================
        [Fact]
        public async Task GetPlanByNameAsync_ReturnsNull_WhenNameEmpty()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.GetPlanByNameAsync("");

            Assert.Null(result);
        }

        // ============================================================
        // TEST 9 — GetPlanByNameAsync: Plan found
        // ============================================================
        [Fact]
        public async Task GetPlanByNameAsync_ReturnsCorrectData_WhenPlanFound()
        {
            var db = GetDbContext();

            db.SubscriptionPlans.Add(new SubscriptionPlan
            {
                PlanId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                Price = 100,
                Currency = "VND",
                IsActive = true
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var result = await service.GetPlanByNameAsync("Gói 1");

            Assert.NotNull(result);
            Assert.Equal("Gói 1", result.PlanName);
        }

        // ============================================================
        // TEST 10 — CreatePlanAsync: Plan name already exists
        // ============================================================
        [Fact]
        public async Task CreatePlanAsync_Throws_WhenPlanNameExists()
        {
            var db = GetDbContext();

            db.SubscriptionPlans.Add(new SubscriptionPlan
            {
                PlanId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                Price = 100,
                Currency = "VND",
                IsActive = true
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new CreateSubscriptionPlanDto
            {
                PlanName = "Gói 1",
                PlanType = "plan1",
                Price = 200,
                Currency = "VND",
                IsActive = true
            };

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.CreatePlanAsync(dto));
        }

        // ============================================================
        // TEST 11 — CreatePlanAsync: Negative price
        // ============================================================
        [Fact]
        public async Task CreatePlanAsync_Throws_WhenPriceNegative()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var dto = new CreateSubscriptionPlanDto
            {
                PlanName = "New Plan",
                PlanType = "plan1",
                Price = -100,
                Currency = "VND",
                IsActive = true
            };

            await Assert.ThrowsAsync<ArgumentException>(() =>
                service.CreatePlanAsync(dto));
        }

        // ============================================================
        // TEST 12 — CreatePlanAsync: Success
        // ============================================================
        [Fact]
        public async Task CreatePlanAsync_Success_CreatesPlan()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var dto = new CreateSubscriptionPlanDto
            {
                PlanName = "New Plan",
                PlanType = "plan1",
                Price = 100,
                Currency = "VND",
                Description = "Test description",
                Features = "Feature 1",
                IsActive = true
            };

            var result = await service.CreatePlanAsync(dto);

            Assert.NotNull(result);
            Assert.Equal("New Plan", result.PlanName);
            Assert.Equal(100, result.Price);
            Assert.True(result.IsActive);
        }

        // ============================================================
        // TEST 13 — UpdatePlanAsync: Plan not found
        // ============================================================
        [Fact]
        public async Task UpdatePlanAsync_ReturnsNull_WhenPlanNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var dto = new UpdateSubscriptionPlanDto { PlanName = "Updated" };
            var result = await service.UpdatePlanAsync(999, dto);

            Assert.Null(result);
        }

        // ============================================================
        // TEST 14 — UpdatePlanAsync: Invalid planId
        // ============================================================
        [Fact]
        public async Task UpdatePlanAsync_ReturnsNull_WhenPlanIdInvalid()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var dto = new UpdateSubscriptionPlanDto { PlanName = "Updated" };
            var result = await service.UpdatePlanAsync(0, dto);

            Assert.Null(result);
        }

        // ============================================================
        // TEST 15 — UpdatePlanAsync: Plan name already exists
        // ============================================================
        [Fact]
        public async Task UpdatePlanAsync_Throws_WhenPlanNameExists()
        {
            var db = GetDbContext();

            db.SubscriptionPlans.AddRange(
                new SubscriptionPlan
                {
                    PlanId = 1,
                    PlanName = "Gói 1",
                    PlanType = "plan1",
                    Price = 100,
                    Currency = "VND",
                    IsActive = true
                },
                new SubscriptionPlan
                {
                    PlanId = 2,
                    PlanName = "Gói 2",
                    PlanType = "plan2",
                    Price = 200,
                    Currency = "VND",
                    IsActive = true
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new UpdateSubscriptionPlanDto { PlanName = "Gói 2" };

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.UpdatePlanAsync(1, dto));
        }

        // ============================================================
        // TEST 16 — UpdatePlanAsync: Negative price
        // ============================================================
        [Fact]
        public async Task UpdatePlanAsync_Throws_WhenPriceNegative()
        {
            var db = GetDbContext();

            db.SubscriptionPlans.Add(new SubscriptionPlan
            {
                PlanId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                Price = 100,
                Currency = "VND",
                IsActive = true
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new UpdateSubscriptionPlanDto { Price = -100 };

            await Assert.ThrowsAsync<ArgumentException>(() =>
                service.UpdatePlanAsync(1, dto));
        }

        // ============================================================
        // TEST 17 — UpdatePlanAsync: Invalid duration
        // ============================================================
        [Fact]
        public async Task UpdatePlanAsync_Throws_WhenDurationInvalid()
        {
            var db = GetDbContext();

            db.SubscriptionPlans.Add(new SubscriptionPlan
            {
                PlanId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                Price = 100,
                Currency = "VND",
                IsActive = true
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new UpdateSubscriptionPlanDto { DurationInMonths = 0 };

            await Assert.ThrowsAsync<ArgumentException>(() =>
                service.UpdatePlanAsync(1, dto));
        }

        // ============================================================
        // TEST 18 — UpdatePlanAsync: Success
        // ============================================================
        [Fact]
        public async Task UpdatePlanAsync_Success_UpdatesPlan()
        {
            var db = GetDbContext();

            db.SubscriptionPlans.Add(new SubscriptionPlan
            {
                PlanId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                Price = 100,
                Currency = "VND",
                DurationInMonths = 1,
                IsActive = true
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new UpdateSubscriptionPlanDto
            {
                PlanName = "Updated Plan",
                Price = 150,
                DurationInMonths = 2
            };

            var result = await service.UpdatePlanAsync(1, dto);

            Assert.NotNull(result);
            Assert.Equal("Updated Plan", result.PlanName);
            Assert.Equal(150, result.Price);
            Assert.Equal(2, result.DurationInMonths);
        }

        // ============================================================
        // TEST 19 — ActivatePlanAsync: Plan not found
        // ============================================================
        [Fact]
        public async Task ActivatePlanAsync_ReturnsFalse_WhenPlanNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.ActivatePlanAsync(999);

            Assert.False(result);
        }

        // ============================================================
        // TEST 20 — ActivatePlanAsync: Invalid planId
        // ============================================================
        [Fact]
        public async Task ActivatePlanAsync_ReturnsFalse_WhenPlanIdInvalid()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.ActivatePlanAsync(0);

            Assert.False(result);
        }

        // ============================================================
        // TEST 21 — ActivatePlanAsync: Success
        // ============================================================
        [Fact]
        public async Task ActivatePlanAsync_Success_ActivatesPlan()
        {
            var db = GetDbContext();

            db.SubscriptionPlans.Add(new SubscriptionPlan
            {
                PlanId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                Price = 100,
                Currency = "VND",
                IsActive = false
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var result = await service.ActivatePlanAsync(1);

            Assert.True(result);
            var plan = await db.SubscriptionPlans.FindAsync(1);
            Assert.True(plan!.IsActive);
        }

        // ============================================================
        // TEST 22 — DeactivatePlanAsync: Plan not found
        // ============================================================
        [Fact]
        public async Task DeactivatePlanAsync_ReturnsFalse_WhenPlanNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.DeactivatePlanAsync(999);

            Assert.False(result);
        }

        // ============================================================
        // TEST 23 — DeactivatePlanAsync: Success
        // ============================================================
        [Fact]
        public async Task DeactivatePlanAsync_Success_DeactivatesPlan()
        {
            var db = GetDbContext();

            db.SubscriptionPlans.Add(new SubscriptionPlan
            {
                PlanId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                Price = 100,
                Currency = "VND",
                IsActive = true
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var result = await service.DeactivatePlanAsync(1);

            Assert.True(result);
            var plan = await db.SubscriptionPlans.FindAsync(1);
            Assert.False(plan!.IsActive);
        }

        // ============================================================
        // TEST 24 — PlanNameExistsAsync: Name exists
        // ============================================================
        [Fact]
        public async Task PlanNameExistsAsync_ReturnsTrue_WhenNameExists()
        {
            var db = GetDbContext();

            db.SubscriptionPlans.Add(new SubscriptionPlan
            {
                PlanId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                Price = 100,
                Currency = "VND",
                IsActive = true
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var result = await service.PlanNameExistsAsync("Gói 1");

            Assert.True(result);
        }

        // ============================================================
        // TEST 25 — PlanNameExistsAsync: Name does not exist
        // ============================================================
        [Fact]
        public async Task PlanNameExistsAsync_ReturnsFalse_WhenNameNotExists()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.PlanNameExistsAsync("NonExistent");

            Assert.False(result);
        }

        // ============================================================
        // TEST 26 — PlanNameExistsAsync: Exclude planId
        // ============================================================
        [Fact]
        public async Task PlanNameExistsAsync_ExcludesPlanId_WhenProvided()
        {
            var db = GetDbContext();

            db.SubscriptionPlans.Add(new SubscriptionPlan
            {
                PlanId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                Price = 100,
                Currency = "VND",
                IsActive = true
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            // Should return false because we're excluding the plan with this name
            var result = await service.PlanNameExistsAsync("Gói 1", excludePlanId: 1);

            Assert.False(result);
        }

        // ============================================================
        // TEST 27 — GetCurrentUserSubscriptionAsync: No subscription, returns free plan
        // ============================================================
        [Fact]
        public async Task GetCurrentUserSubscriptionAsync_ReturnsFreePlan_WhenNoSubscription()
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

            db.SubscriptionPlans.Add(new SubscriptionPlan
            {
                PlanId = 1,
                PlanName = "Free",
                PlanType = null,
                Price = 0,
                Currency = "VND",
                IsActive = true
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var result = await service.GetCurrentUserSubscriptionAsync(1);

            Assert.NotNull(result);
            Assert.Equal("Free", result.PlanName);
        }

        // ============================================================
        // TEST 28 — GetCurrentUserSubscriptionAsync: Has active subscription
        // ============================================================
        [Fact]
        public async Task GetCurrentUserSubscriptionAsync_ReturnsActiveSubscription_WhenExists()
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

            db.SubscriptionPlans.Add(new SubscriptionPlan
            {
                PlanId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                Price = 100,
                Currency = "VND",
                IsActive = true
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

            var result = await service.GetCurrentUserSubscriptionAsync(1);

            Assert.NotNull(result);
            Assert.Equal("Gói 1", result.PlanName);
        }

        // ============================================================
        // TEST 29 — GetCurrentUserSubscriptionAsync: Invalid userId
        // ============================================================
        [Fact]
        public async Task GetCurrentUserSubscriptionAsync_ReturnsNull_WhenUserIdInvalid()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.GetCurrentUserSubscriptionAsync(0);

            Assert.Null(result);
        }
    }
}

