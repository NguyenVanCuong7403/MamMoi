using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services.Notifications;
using MamMoi.Application.DTOs.Notification;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace MamMoi.Test
{
    public class AdminNotificationTest
    {
        private MamMoiDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<MamMoiDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new MamMoiDbContext(options);
        }

        private NotificationService GetService(MamMoiDbContext context)
        {
            var logger = new Mock<ILogger<NotificationService>>();
            return new NotificationService(context, logger.Object);
        }

        // ============================================================
        // TEST 1 — BroadcastNotificationAsync: Title is required
        // ============================================================
        [Fact]
        public async Task BroadcastNotificationAsync_Throws_WhenTitleEmpty()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var dto = new BroadcastNotificationDto
            {
                Title = "",
                Message = "Test message"
            };

            await Assert.ThrowsAsync<ArgumentException>(() =>
                service.BroadcastNotificationAsync(dto));
        }

        // ============================================================
        // TEST 2 — BroadcastNotificationAsync: Message is required
        // ============================================================
        [Fact]
        public async Task BroadcastNotificationAsync_Throws_WhenMessageEmpty()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var dto = new BroadcastNotificationDto
            {
                Title = "Test Title",
                Message = ""
            };

            await Assert.ThrowsAsync<ArgumentException>(() =>
                service.BroadcastNotificationAsync(dto));
        }

        // ============================================================
        // TEST 3 — BroadcastNotificationAsync: No active users
        // ============================================================
        [Fact]
        public async Task BroadcastNotificationAsync_ReturnsZero_WhenNoActiveUsers()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var dto = new BroadcastNotificationDto
            {
                Title = "Test Title",
                Message = "Test message"
            };

            var result = await service.BroadcastNotificationAsync(dto);

            Assert.Equal(0, result);
        }

        // ============================================================
        // TEST 4 — BroadcastNotificationAsync: Success
        // ============================================================
        [Fact]
        public async Task BroadcastNotificationAsync_Success_SendsToAllActiveUsers()
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
                },
                new User
                {
                    UserId = 3,
                    RoleId = 1,
                    FullName = "User 3",
                    Email = "user3@test.com",
                    PasswordHash = new byte[] { 1, 2, 3 },
                    IsActive = false, // Inactive user
                    CreatedAt = DateTime.UtcNow
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new BroadcastNotificationDto
            {
                Title = "Test Title",
                Message = "Test message",
                NotificationType = "Broadcast",
                Priority = "High",
                Category = "System"
            };

            var result = await service.BroadcastNotificationAsync(dto);

            Assert.Equal(2, result); // Only active users

            var notifications = await db.Notifications.ToListAsync();
            Assert.Equal(2, notifications.Count);
            Assert.All(notifications, n =>
            {
                Assert.Equal("Test Title", n.Title);
                Assert.Equal("Test message", n.Message);
                Assert.Equal("Broadcast", n.NotificationType);
                Assert.Equal("High", n.Priority);
                Assert.NotNull(n.GroupId);
                Assert.StartsWith("Broadcast-", n.GroupId!);
            });
        }

        // ============================================================
        // TEST 5 — BroadcastNotificationAsync: With expiresAt
        // ============================================================
        [Fact]
        public async Task BroadcastNotificationAsync_WithExpiresAt_SetsExpiration()
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

            await db.SaveChangesAsync();

            var service = GetService(db);

            var expiresAt = DateTime.UtcNow.AddDays(7);
            var dto = new BroadcastNotificationDto
            {
                Title = "Test Title",
                Message = "Test message",
                ExpiresAt = expiresAt
            };

            var result = await service.BroadcastNotificationAsync(dto);

            Assert.Equal(1, result);

            var notification = await db.Notifications.FirstAsync();
            Assert.NotNull(notification.ExpiresAt);
        }

        // ============================================================
        // TEST 6 — UpdateBroadcastNotificationAsync: GroupId is required
        // ============================================================
        [Fact]
        public async Task UpdateBroadcastNotificationAsync_Throws_WhenGroupIdEmpty()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var dto = new UpdateBroadcastNotificationDto
            {
                Title = "Updated Title"
            };

            await Assert.ThrowsAsync<ArgumentException>(() =>
                service.UpdateBroadcastNotificationAsync("", dto));
        }

        // ============================================================
        // TEST 7 — UpdateBroadcastNotificationAsync: Group not found
        // ============================================================
        [Fact]
        public async Task UpdateBroadcastNotificationAsync_ReturnsFalse_WhenGroupNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var dto = new UpdateBroadcastNotificationDto
            {
                Title = "Updated Title"
            };

            var result = await service.UpdateBroadcastNotificationAsync("NonExistent", dto);

            Assert.False(result);
        }

        // ============================================================
        // TEST 8 — UpdateBroadcastNotificationAsync: Cannot update sent notifications
        // ============================================================
        [Fact]
        public async Task UpdateBroadcastNotificationAsync_Throws_WhenNotificationsAlreadySent()
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

            var groupId = "Broadcast-20240101120000";
            db.Notifications.Add(new Notification
            {
                NotificationId = 1,
                UserId = 1,
                Title = "Original Title",
                Message = "Original message",
                NotificationType = "Broadcast",
                Priority = "Normal",
                Status = "Sent",
                IsRead = false,
                SentAt = DateTime.UtcNow,
                DeliveredAt = DateTime.UtcNow,
                GroupId = groupId
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new UpdateBroadcastNotificationDto
            {
                Title = "Updated Title"
            };

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.UpdateBroadcastNotificationAsync(groupId, dto));
        }

        // ============================================================
        // TEST 9 — UpdateBroadcastNotificationAsync: Success
        // ============================================================
        [Fact]
        public async Task UpdateBroadcastNotificationAsync_Success_UpdatesNotifications()
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

            var groupId = "Broadcast-20240101120000";
            db.Notifications.AddRange(
                new Notification
                {
                    NotificationId = 1,
                    UserId = 1,
                    Title = "Original Title",
                    Message = "Original message",
                    NotificationType = "Broadcast",
                    Priority = "Normal",
                    Status = "Pending",
                    IsRead = false,
                    SentAt = default(DateTime),
                    GroupId = groupId
                },
                new Notification
                {
                    NotificationId = 2,
                    UserId = 2,
                    Title = "Original Title",
                    Message = "Original message",
                    NotificationType = "Broadcast",
                    Priority = "Normal",
                    Status = "Pending",
                    IsRead = false,
                    SentAt = default(DateTime),
                    GroupId = groupId
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new UpdateBroadcastNotificationDto
            {
                Title = "Updated Title",
                Message = "Updated message",
                Priority = "High",
                Category = "System"
            };

            var result = await service.UpdateBroadcastNotificationAsync(groupId, dto);

            Assert.True(result);

            var notifications = await db.Notifications.Where(n => n.GroupId == groupId).ToListAsync();
            Assert.Equal(2, notifications.Count);
            Assert.All(notifications, n =>
            {
                Assert.Equal("Updated Title", n.Title);
                Assert.Equal("Updated message", n.Message);
                Assert.Equal("High", n.Priority);
                Assert.Equal("System", n.Category);
            });
        }

        // ============================================================
        // TEST 10 — DeleteBroadcastNotificationAsync: GroupId is required
        // ============================================================
        [Fact]
        public async Task DeleteBroadcastNotificationAsync_Throws_WhenGroupIdEmpty()
        {
            var db = GetDbContext();
            var service = GetService(db);

            await Assert.ThrowsAsync<ArgumentException>(() =>
                service.DeleteBroadcastNotificationAsync(""));
        }

        // ============================================================
        // TEST 11 — DeleteBroadcastNotificationAsync: Group not found
        // ============================================================
        [Fact]
        public async Task DeleteBroadcastNotificationAsync_ReturnsFalse_WhenGroupNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.DeleteBroadcastNotificationAsync("NonExistent");

            Assert.False(result);
        }

        // ============================================================
        // TEST 12 — DeleteBroadcastNotificationAsync: Cannot delete sent notifications
        // ============================================================
        [Fact]
        public async Task DeleteBroadcastNotificationAsync_Throws_WhenNotificationsAlreadySent()
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

            var groupId = "Broadcast-20240101120000";
            db.Notifications.Add(new Notification
            {
                NotificationId = 1,
                UserId = 1,
                Title = "Test Title",
                Message = "Test message",
                NotificationType = "Broadcast",
                Priority = "Normal",
                Status = "Sent",
                IsRead = false,
                SentAt = DateTime.UtcNow,
                DeliveredAt = DateTime.UtcNow,
                GroupId = groupId
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.DeleteBroadcastNotificationAsync(groupId));
        }

        // ============================================================
        // TEST 13 — DeleteBroadcastNotificationAsync: Success
        // ============================================================
        [Fact]
        public async Task DeleteBroadcastNotificationAsync_Success_DeletesNotifications()
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

            var groupId = "Broadcast-20240101120000";
            db.Notifications.AddRange(
                new Notification
                {
                    NotificationId = 1,
                    UserId = 1,
                    Title = "Test Title",
                    Message = "Test message",
                    NotificationType = "Broadcast",
                    Priority = "Normal",
                    Status = "Pending",
                    IsRead = false,
                    SentAt = default(DateTime),
                    GroupId = groupId
                },
                new Notification
                {
                    NotificationId = 2,
                    UserId = 2,
                    Title = "Test Title",
                    Message = "Test message",
                    NotificationType = "Broadcast",
                    Priority = "Normal",
                    Status = "Pending",
                    IsRead = false,
                    SentAt = default(DateTime),
                    GroupId = groupId
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var result = await service.DeleteBroadcastNotificationAsync(groupId);

            Assert.True(result);

            var notifications = await db.Notifications.Where(n => n.GroupId == groupId).ToListAsync();
            Assert.Empty(notifications);
        }

        // ============================================================
        // TEST 14 — GetBroadcastNotificationsAsync: Returns all broadcast groups
        // ============================================================
        [Fact]
        public async Task GetBroadcastNotificationsAsync_ReturnsAllBroadcastGroups()
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

            var groupId1 = "Broadcast-20240101120000";
            var groupId2 = "Broadcast-20240102120000";

            db.Notifications.AddRange(
                new Notification
                {
                    NotificationId = 1,
                    UserId = 1,
                    Title = "Title 1",
                    Message = "Message 1",
                    NotificationType = "Broadcast",
                    Priority = "High",
                    Category = "System",
                    Status = "Sent",
                    IsRead = false,
                    SentAt = DateTime.UtcNow.AddDays(-2),
                    DeliveredAt = DateTime.UtcNow.AddDays(-2),
                    GroupId = groupId1
                },
                new Notification
                {
                    NotificationId = 2,
                    UserId = 2,
                    Title = "Title 1",
                    Message = "Message 1",
                    NotificationType = "Broadcast",
                    Priority = "High",
                    Category = "System",
                    Status = "Sent",
                    IsRead = false,
                    SentAt = DateTime.UtcNow.AddDays(-2),
                    DeliveredAt = DateTime.UtcNow.AddDays(-2),
                    GroupId = groupId1
                },
                new Notification
                {
                    NotificationId = 3,
                    UserId = 1,
                    Title = "Title 2",
                    Message = "Message 2",
                    NotificationType = "Broadcast",
                    Priority = "Normal",
                    Status = "Sent",
                    IsRead = false,
                    SentAt = DateTime.UtcNow.AddDays(-1),
                    DeliveredAt = DateTime.UtcNow.AddDays(-1),
                    GroupId = groupId2
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var result = await service.GetBroadcastNotificationsAsync();

            Assert.Equal(2, result.Count);
            var group1 = result.First(r => r.GroupId == groupId1);
            Assert.Equal(2, group1.RecipientCount);
            Assert.Equal("Title 1", group1.Title);
            Assert.Equal("High", group1.Priority);
        }

        // ============================================================
        // TEST 15 — GetBroadcastNotificationsAsync: Returns empty list when no broadcasts
        // ============================================================
        [Fact]
        public async Task GetBroadcastNotificationsAsync_ReturnsEmptyList_WhenNoBroadcasts()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.GetBroadcastNotificationsAsync();

            Assert.Empty(result);
        }
    }
}

