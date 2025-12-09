using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services.Admin;
using MamMoi.Application.DTOs.Admin;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace MamMoi.Test
{
    public class AdminUserTest
    {
        private MamMoiDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<MamMoiDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new MamMoiDbContext(options);
        }

        private AdminUserService GetService(MamMoiDbContext context)
        {
            var logger = new Mock<ILogger<AdminUserService>>();
            return new AdminUserService(context, logger.Object);
        }

        // ============================================================
        // TEST 1 — GetAllUsersAsync: No filters (default branch)
        // ============================================================
        [Fact]
        public async Task GetAllUsersAsync_NoFilters_ReturnsAllUsers()
        {
            var db = GetDbContext();

            db.Roles.AddRange(
                new Role { RoleId = 1, RoleName = "SystemAdmin" },
                new Role { RoleId = 2, RoleName = "BusinessAdmin" },
                new Role { RoleId = 3, RoleName = "Farmer" }
            );

            db.Users.AddRange(
                new User
                {
                    UserId = 1,
                    RoleId = 1,
                    FullName = "Admin User",
                    Email = "admin@test.com",
                    Phone = "123456789",
                    PasswordHash = new byte[] { 1, 2, 3 },
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    UserId = 2,
                    RoleId = 3,
                    FullName = "Farmer User",
                    Email = "farmer@test.com",
                    PasswordHash = new byte[] { 1, 2, 3 },
                    IsActive = false,
                    CreatedAt = DateTime.UtcNow
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (users, totalCount) = await service.GetAllUsersAsync();

            Assert.Equal(2, totalCount);
            Assert.Equal(2, users.Count);
        }

        // ============================================================
        // TEST 2 — GetAllUsersAsync: With searchTerm
        // ============================================================
        [Fact]
        public async Task GetAllUsersAsync_WithSearchTerm_FiltersCorrectly()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.AddRange(
                new User
                {
                    UserId = 1,
                    RoleId = 1,
                    FullName = "John Doe",
                    Email = "john@test.com",
                    Phone = "111111111",
                    PasswordHash = new byte[] { 1, 2, 3 },
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    UserId = 2,
                    RoleId = 1,
                    FullName = "Jane Smith",
                    Email = "jane@test.com",
                    Phone = "222222222",
                    PasswordHash = new byte[] { 1, 2, 3 },
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (users, totalCount) = await service.GetAllUsersAsync(searchTerm: "John");

            Assert.Single(users);
            Assert.Equal(1, totalCount);
            Assert.Equal("John Doe", users[0].FullName);
        }

        // ============================================================
        // TEST 3 — GetAllUsersAsync: Filter by roleId
        // ============================================================
        [Fact]
        public async Task GetAllUsersAsync_FilterByRoleId_ReturnsCorrectUsers()
        {
            var db = GetDbContext();

            db.Roles.AddRange(
                new Role { RoleId = 1, RoleName = "SystemAdmin" },
                new Role { RoleId = 2, RoleName = "BusinessAdmin" },
                new Role { RoleId = 3, RoleName = "Farmer" }
            );

            db.Users.AddRange(
                new User
                {
                    UserId = 1,
                    RoleId = 1,
                    FullName = "Admin",
                    Email = "admin@test.com",
                    PasswordHash = new byte[] { 1, 2, 3 },
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    UserId = 2,
                    RoleId = 3,
                    FullName = "Farmer",
                    Email = "farmer@test.com",
                    PasswordHash = new byte[] { 1, 2, 3 },
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (users, totalCount) = await service.GetAllUsersAsync(roleId: 1);

            Assert.Single(users);
            Assert.Equal(1, totalCount);
            Assert.Equal("SystemAdmin", users[0].RoleName);
        }

        // ============================================================
        // TEST 4 — GetAllUsersAsync: Filter by isActive
        // ============================================================
        [Fact]
        public async Task GetAllUsersAsync_FilterByIsActive_ReturnsCorrectUsers()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.AddRange(
                new User
                {
                    UserId = 1,
                    RoleId = 1,
                    FullName = "Active User",
                    Email = "active@test.com",
                    PasswordHash = new byte[] { 1, 2, 3 },
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    UserId = 2,
                    RoleId = 1,
                    FullName = "Inactive User",
                    Email = "inactive@test.com",
                    PasswordHash = new byte[] { 1, 2, 3 },
                    IsActive = false,
                    CreatedAt = DateTime.UtcNow
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (users, totalCount) = await service.GetAllUsersAsync(isActive: true);

            Assert.Single(users);
            Assert.Equal(1, totalCount);
            Assert.True(users[0].IsActive);
        }

        // ============================================================
        // TEST 5 — GetAllUsersAsync: Pagination
        // ============================================================
        [Fact]
        public async Task GetAllUsersAsync_WithPagination_ReturnsCorrectPage()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            for (int i = 1; i <= 30; i++)
            {
                db.Users.Add(new User
                {
                    UserId = i,
                    RoleId = 1,
                    FullName = $"User {i:D2}",
                    Email = $"user{i}@test.com",
                    PasswordHash = new byte[] { 1, 2, 3 },
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-i)
                });
            }

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (users, totalCount) = await service.GetAllUsersAsync(page: 2, pageSize: 10);

            Assert.Equal(30, totalCount);
            Assert.Equal(10, users.Count);
        }

        // ============================================================
        // TEST 6 — GetAllUsersAsync: With subscription plan
        // ============================================================
        [Fact]
        public async Task GetAllUsersAsync_WithSubscription_ReturnsPlanType()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            var user = new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User",
                Email = "user@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            db.Users.Add(user);

            db.Subscriptions.Add(new Subscription
            {
                SubscriptionId = 1,
                UserId = 1,
                PlanName = "Gói 1",
                PlanType = "plan1",
                StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
                EndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(1)),
                Status = "Active",
                Price = 100,
                Currency = "VND"
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (users, totalCount) = await service.GetAllUsersAsync();

            Assert.Single(users);
            Assert.Equal("seedling", users[0].PlanType);
        }

        // ============================================================
        // TEST 7 — GetUserByIdAsync: User not found
        // ============================================================
        [Fact]
        public async Task GetUserByIdAsync_ReturnsNull_WhenUserNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.GetUserByIdAsync(999);

            Assert.Null(result);
        }

        // ============================================================
        // TEST 8 — GetUserByIdAsync: User found
        // ============================================================
        [Fact]
        public async Task GetUserByIdAsync_ReturnsCorrectData_WhenUserFound()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "Test User",
                Email = "test@test.com",
                Phone = "123456789",
                Address = "Test Address",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            db.Gardens.Add(new Garden { GardenId = 1, UserId = 1, Name = "Garden 1", CreatedAt = DateTime.UtcNow });
            
            // Tree requires more fields, so we'll add minimal required fields
            db.TreeTypes.Add(new TreeType { TreeTypeId = 1, TreeTypeName = "Test Type", ScientificName = "" });
            db.TreeGrowthStages.Add(new TreeGrowthStage { StageId = 1, TreeTypeId = 1, StageName = "Stage 1", StageOrder = 1 });
            db.Trees.Add(new Tree 
            { 
                TreeId = 1, 
                UserId = 1, 
                GardenId = 1,
                TreeTypeId = 1,
                StageId = 1,
                TreeName = "Tree 1",
                CreatedAt = DateTime.UtcNow
            });
            db.Subscriptions.Add(new Subscription { SubscriptionId = 1, UserId = 1, PlanName = "Plan", Status = "Active", Price = 100, Currency = "VND", StartDate = DateOnly.FromDateTime(DateTime.UtcNow) });
            db.Payments.Add(new Payment 
            { 
                PaymentId = 1, 
                UserId = 1, 
                SubscriptionId = 1,
                Amount = 100, 
                Currency = "VND", 
                TransactionStatus = "Completed",
                PaymentDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var result = await service.GetUserByIdAsync(1);

            Assert.NotNull(result);
            Assert.Equal(1, result.UserId);
            Assert.Equal("Test User", result.FullName);
            Assert.Equal("test@test.com", result.Email);
            Assert.Equal(1, result.GardensCount);
            Assert.Equal(1, result.TreesCount);
            Assert.Equal(1, result.SubscriptionsCount);
            Assert.Equal(1, result.PaymentsCount);
        }

        // ============================================================
        // TEST 9 — UpdateUserAsync: User not found
        // ============================================================
        [Fact]
        public async Task UpdateUserAsync_ReturnsNull_WhenUserNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var dto = new AdminUpdateUserDto { FullName = "New Name" };
            var result = await service.UpdateUserAsync(999, dto);

            Assert.Null(result);
        }

        // ============================================================
        // TEST 10 — UpdateUserAsync: Update FullName
        // ============================================================
        [Fact]
        public async Task UpdateUserAsync_UpdatesFullName()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "Old Name",
                Email = "test@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new AdminUpdateUserDto { FullName = "New Name" };
            var result = await service.UpdateUserAsync(1, dto);

            Assert.NotNull(result);
            Assert.Equal("New Name", result.FullName);
        }

        // ============================================================
        // TEST 11 — UpdateUserAsync: Email already exists
        // ============================================================
        [Fact]
        public async Task UpdateUserAsync_Throws_WhenEmailExists()
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

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new AdminUpdateUserDto { Email = "user2@test.com" };

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.UpdateUserAsync(1, dto));
        }

        // ============================================================
        // TEST 12 — UpdateUserAsync: Cannot change to SystemAdmin role
        // ============================================================
        [Fact]
        public async Task UpdateUserAsync_Throws_WhenChangingToSystemAdmin()
        {
            var db = GetDbContext();

            db.Roles.AddRange(
                new Role { RoleId = 1, RoleName = "Farmer" },
                new Role { RoleId = 3, RoleName = "SystemAdmin" }
            );

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User",
                Email = "user@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new AdminUpdateUserDto { RoleId = 3 };

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.UpdateUserAsync(1, dto));

            Assert.Contains("Không thể chuyển đổi vai trò thành Quản trị hệ thống", ex.Message);
        }

        // ============================================================
        // TEST 13 — UpdateUserAsync: Cannot change SystemAdmin role
        // ============================================================
        [Fact]
        public async Task UpdateUserAsync_Throws_WhenChangingSystemAdminRole()
        {
            var db = GetDbContext();

            db.Roles.AddRange(
                new Role { RoleId = 1, RoleName = "Farmer" },
                new Role { RoleId = 3, RoleName = "SystemAdmin" }
            );

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 3, // SystemAdmin
                FullName = "Admin",
                Email = "admin@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new AdminUpdateUserDto { RoleId = 1 };

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.UpdateUserAsync(1, dto));

            Assert.Contains("Không thể thay đổi vai trò của Quản trị hệ thống", ex.Message);
        }

        // ============================================================
        // TEST 14 — UpdateUserAsync: Role not found
        // ============================================================
        [Fact]
        public async Task UpdateUserAsync_Throws_WhenRoleNotFound()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User",
                Email = "user@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new AdminUpdateUserDto { RoleId = 999 };

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.UpdateUserAsync(1, dto));
        }

        // ============================================================
        // TEST 15 — UpdateUserAsync: Success with all fields
        // ============================================================
        [Fact]
        public async Task UpdateUserAsync_Success_UpdatesAllFields()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "Old Name",
                Email = "old@test.com",
                Phone = "111111111",
                Address = "Old Address",
                ExperienceLevel = "Beginner",
                PreferredLanguage = "en",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new AdminUpdateUserDto
            {
                FullName = "New Name",
                Email = "new@test.com",
                Phone = "222222222",
                Address = "New Address",
                ExperienceLevel = "Advanced",
                PreferredLanguage = "vi"
            };

            var result = await service.UpdateUserAsync(1, dto);

            Assert.NotNull(result);
            Assert.Equal("New Name", result.FullName);
            Assert.Equal("new@test.com", result.Email);
            Assert.Equal("222222222", result.Phone);
            Assert.Equal("New Address", result.Address);
            Assert.Equal("Advanced", result.ExperienceLevel);
            Assert.Equal("vi", result.PreferredLanguage);
        }

        // ============================================================
        // TEST 16 — ActivateUserAsync: User not found
        // ============================================================
        [Fact]
        public async Task ActivateUserAsync_ReturnsFalse_WhenUserNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.ActivateUserAsync(999);

            Assert.False(result);
        }

        // ============================================================
        // TEST 17 — ActivateUserAsync: Success
        // ============================================================
        [Fact]
        public async Task ActivateUserAsync_Success_ActivatesUser()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User",
                Email = "user@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = false,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var result = await service.ActivateUserAsync(1);

            Assert.True(result);
            var user = await db.Users.FindAsync(1);
            Assert.True(user!.IsActive);
        }

        // ============================================================
        // TEST 18 — DeactivateUserAsync: User not found
        // ============================================================
        [Fact]
        public async Task DeactivateUserAsync_ReturnsFalse_WhenUserNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.DeactivateUserAsync(999);

            Assert.False(result);
        }

        // ============================================================
        // TEST 19 — DeactivateUserAsync: Success
        // ============================================================
        [Fact]
        public async Task DeactivateUserAsync_Success_DeactivatesUser()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User",
                Email = "user@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var result = await service.DeactivateUserAsync(1);

            Assert.True(result);
            var user = await db.Users.FindAsync(1);
            Assert.False(user!.IsActive);
        }

        // ============================================================
        // TEST 20 — UpdateUserSubscriptionPlanAsync: User not found
        // ============================================================
        [Fact]
        public async Task UpdateUserSubscriptionPlanAsync_ReturnsFalse_WhenUserNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.UpdateUserSubscriptionPlanAsync(999, "seedling", null, null);

            Assert.False(result);
        }

        // ============================================================
        // TEST 21 — UpdateUserSubscriptionPlanAsync: Invalid end date
        // ============================================================
        [Fact]
        public async Task UpdateUserSubscriptionPlanAsync_Throws_WhenEndDateBeforeStartDate()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User",
                Email = "user@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var startDate = DateOnly.FromDateTime(DateTime.UtcNow);
            var endDate = startDate.AddDays(-1);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.UpdateUserSubscriptionPlanAsync(1, "seedling", startDate, endDate));
        }

        // ============================================================
        // TEST 22 — UpdateUserSubscriptionPlanAsync: Invalid plan type
        // ============================================================
        [Fact]
        public async Task UpdateUserSubscriptionPlanAsync_Throws_WhenPlanTypeInvalid()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User",
                Email = "user@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.UpdateUserSubscriptionPlanAsync(1, "invalid", null, null));
        }

        // ============================================================
        // TEST 23 — UpdateUserSubscriptionPlanAsync: Plan not found
        // ============================================================
        [Fact]
        public async Task UpdateUserSubscriptionPlanAsync_Throws_WhenPlanNotFound()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User",
                Email = "user@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.UpdateUserSubscriptionPlanAsync(1, "seedling", null, null));
        }

        // ============================================================
        // TEST 24 — UpdateUserSubscriptionPlanAsync: Success with seedling plan
        // ============================================================
        [Fact]
        public async Task UpdateUserSubscriptionPlanAsync_Success_WithSeedlingPlan()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User",
                Email = "user@test.com",
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
                DurationInMonths = 1,
                IsActive = true
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var result = await service.UpdateUserSubscriptionPlanAsync(1, "seedling", null, null);

            Assert.True(result);
            var subscription = await db.Subscriptions.FirstOrDefaultAsync(s => s.UserId == 1);
            Assert.NotNull(subscription);
            Assert.Equal("plan1", subscription.PlanType);
            Assert.Equal("Active", subscription.Status);
        }

        // ============================================================
        // TEST 25 — UpdateUserSubscriptionPlanAsync: Close existing subscription
        // ============================================================
        [Fact]
        public async Task UpdateUserSubscriptionPlanAsync_ClosesExistingSubscription()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User",
                Email = "user@test.com",
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
                StartDate = today.AddDays(-10),
                EndDate = today.AddDays(20),
                Status = "Active",
                Price = 100,
                Currency = "VND"
            });

            db.SubscriptionPlans.Add(new SubscriptionPlan
            {
                PlanId = 2,
                PlanName = "Gói 2",
                PlanType = "plan2",
                Price = 200,
                Currency = "VND",
                DurationInMonths = 1,
                IsActive = true
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var newStartDate = today.AddDays(1);
            var result = await service.UpdateUserSubscriptionPlanAsync(1, "orchard", newStartDate, null);

            Assert.True(result);
            var oldSubscription = await db.Subscriptions.FindAsync(1);
            Assert.Equal("Inactive", oldSubscription!.Status);
        }

        // ============================================================
        // TEST 26 — UpdateUserSubscriptionPlanAsync: Set to free
        // ============================================================
        [Fact]
        public async Task UpdateUserSubscriptionPlanAsync_Success_WhenSettingToFree()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User",
                Email = "user@test.com",
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
                StartDate = today.AddDays(-10),
                EndDate = today.AddDays(20),
                Status = "Active",
                Price = 100,
                Currency = "VND"
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var result = await service.UpdateUserSubscriptionPlanAsync(1, "free", null, null);

            Assert.True(result);
            var subscription = await db.Subscriptions.FindAsync(1);
            Assert.Equal("Inactive", subscription!.Status);
        }

        // ============================================================
        // TEST 27 — ResetUserPasswordAsync: User not found
        // ============================================================
        [Fact]
        public async Task ResetUserPasswordAsync_ReturnsFalse_WhenUserNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.ResetUserPasswordAsync(999, "NewPassword123");

            Assert.False(result);
        }

        // ============================================================
        // TEST 28 — ResetUserPasswordAsync: Password too short
        // ============================================================
        [Fact]
        public async Task ResetUserPasswordAsync_Throws_WhenPasswordTooShort()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User",
                Email = "user@test.com",
                PasswordHash = new byte[] { 1, 2, 3 },
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.ResetUserPasswordAsync(1, "Short"));
        }

        // ============================================================
        // TEST 29 — ResetUserPasswordAsync: Success
        // ============================================================
        [Fact]
        public async Task ResetUserPasswordAsync_Success_UpdatesPassword()
        {
            var db = GetDbContext();

            db.Roles.Add(new Role { RoleId = 1, RoleName = "Farmer" });

            var oldHash = new byte[] { 1, 2, 3 };
            db.Users.Add(new User
            {
                UserId = 1,
                RoleId = 1,
                FullName = "User",
                Email = "user@test.com",
                PasswordHash = oldHash,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var newPassword = "NewPassword123";
            var result = await service.ResetUserPasswordAsync(1, newPassword);

            Assert.True(result);
            var user = await db.Users.FindAsync(1);
            Assert.NotNull(user);
            Assert.NotEqual(oldHash, user.PasswordHash);
        }
    }
}

