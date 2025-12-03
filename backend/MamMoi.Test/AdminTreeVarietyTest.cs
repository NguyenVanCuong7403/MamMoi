using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services.Admin;
using MamMoi.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using MamMoi.Application.DTOs.Admin;

namespace MamMoi.Test
{
    public class AdminTreeVarietyTest
    {
        private MamMoiDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<MamMoiDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new MamMoiDbContext(options);
        }

        private AdminTreeVarietyService GetService(MamMoiDbContext context)
        {
            var logger = new Mock<ILogger<AdminTreeVarietyService>>();
            return new AdminTreeVarietyService(context, logger.Object);
        }

        // ======================================================
        // TEST 1 — No filter (default branch)
        // ======================================================
        [Fact]
        public async Task GetAllTreeVarietiesAsync_NoFilters_ReturnsAll()
        {
            var db = GetDbContext();

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                TreeTypeName = "Apple",
                ScientificName = ""    // required
            });

            db.TreeVarietys.AddRange(
                new TreeVariety { VarietyId = 1, TreeTypeId = 1, VarietyName = "A" },
                new TreeVariety { VarietyId = 2, TreeTypeId = 1, VarietyName = "B" }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (varieties, totalCount) = await service.GetAllTreeVarietiesAsync();

            Assert.Equal(2, totalCount);
            Assert.Equal(2, varieties.Count);
        }

        // ======================================================
        // TEST 2 — searchTerm branch
        // ======================================================
        [Fact]
        public async Task GetAllTreeVarietiesAsync_WithSearchTerm_FiltersCorrectly()
        {
            var db = GetDbContext();

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                TreeTypeName = "Apple",
                ScientificName = ""    // required
            });

            db.TreeVarietys.AddRange(
                new TreeVariety { VarietyId = 1, TreeTypeId = 1, VarietyName = "Sweet Mango" },
                new TreeVariety { VarietyId = 2, TreeTypeId = 1, VarietyName = "Banana" }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (varieties, totalCount) =
                await service.GetAllTreeVarietiesAsync(searchTerm: "Mango");

            Assert.Single(varieties);
            Assert.Equal("Sweet Mango", varieties[0].VarietyName);
            Assert.Equal(1, totalCount);
        }

        // ======================================================
        // TEST 3 — Filter by treeTypeId
        // ======================================================
        [Fact]
        public async Task GetAllTreeVarietiesAsync_FilterByTreeTypeId_ReturnsCorrect()
        {
            var db = GetDbContext();

            db.TreeTypes.AddRange(
                new TreeType
                {
                    TreeTypeId = 1,
                    TreeTypeName = "Apple",
                    ScientificName = ""    // required
                },
                new TreeType
                {
                    TreeTypeId = 2,
                    TreeTypeName = "Orange",
                    ScientificName = ""    // required
                }
            );

            db.TreeVarietys.AddRange(
                new TreeVariety { VarietyId = 1, TreeTypeId = 1, VarietyName = "A1" },
                new TreeVariety { VarietyId = 2, TreeTypeId = 2, VarietyName = "O1" }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (varieties, totalCount) =
                await service.GetAllTreeVarietiesAsync(treeTypeId: 1);

            Assert.Single(varieties);
            Assert.Equal(1, totalCount);
            Assert.Equal("A1", varieties[0].VarietyName);
        }

        // ======================================================
        // TEST 4 — Pagination branch
        // ======================================================
        [Fact]
        public async Task GetAllTreeVarietiesAsync_Pagination_WorksCorrectly()
        {
            var db = GetDbContext();

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                TreeTypeName = "Apple",
                ScientificName = ""    // required
            });

            for (int i = 1; i <= 30; i++)
            {
                db.TreeVarietys.Add(new TreeVariety
                {
                    VarietyId = i,
                    TreeTypeId = 1,
                    VarietyName = $"V{i:D2}"
                });
            }

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (varieties, totalCount) =
                await service.GetAllTreeVarietiesAsync(page: 2, pageSize: 10);

            Assert.Equal(30, totalCount);
            Assert.Equal(10, varieties.Count);
            Assert.Contains(varieties, v => v.VarietyName == "V11");
        }
        [Fact]
        public async Task CreateTreeVarietyAsync_Throws_WhenTreeTypeNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var dto = new CreateTreeVarietyDto
            {
                TreeTypeId = 999,   // không tồn tại
                VarietyName = "AAA"
            };

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.CreateTreeVarietyAsync(dto));
        }
        [Fact]
        public async Task CreateTreeVarietyAsync_Success_ReturnsCorrectDetail()
        {
            var db = GetDbContext();

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                TreeTypeName = "Apple",
                ScientificName = ""
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new CreateTreeVarietyDto
            {
                TreeTypeId = 1,
                VarietyName = "Fuji",
                VarietyDescription = "Red sweet apple",
                ImageUrl = "img.jpg"
            };

            var result = await service.CreateTreeVarietyAsync(dto);

            Assert.NotNull(result);
            Assert.Equal("Fuji", result.VarietyName);
            Assert.Equal("Apple", result.TreeTypeName);
            Assert.Equal(1, result.TreeTypeId);
            Assert.Equal("img.jpg", result.ImageUrl);
            Assert.Equal(0, result.TreesCount);
        }
        [Fact]
        public async Task UpdateTreeVarietyAsync_ReturnsNull_WhenVarietyNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var dto = new UpdateTreeVarietyDto
            {
                VarietyName = "New"
            };

            var result = await service.UpdateTreeVarietyAsync(999, dto);
            Assert.Null(result);
        }
        [Fact]
        public async Task UpdateTreeVarietyAsync_Throws_WhenTreeTypeNotFound()
        {
            var db = GetDbContext();

            db.TreeVarietys.Add(new TreeVariety
            {
                VarietyId = 1,
                TreeTypeId = 1,
                VarietyName = "Old Name"
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new UpdateTreeVarietyDto
            {
                TreeTypeId = 999   // không tồn tại
            };

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.UpdateTreeVarietyAsync(1, dto));
        }
        [Fact]
        public async Task UpdateTreeVarietyAsync_Success_UpdatesFields()
        {
            var db = GetDbContext();

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                TreeTypeName = "Apple",
                ScientificName = ""
            });

            db.TreeVarietys.Add(new TreeVariety
            {
                VarietyId = 1,
                TreeTypeId = 1,
                VarietyName = "Old",
                VarietyDescription = "Old desc",
                ImageUrl = "old.jpg"
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new UpdateTreeVarietyDto
            {
                VarietyName = "New Name",
                VarietyDescription = "New Description",
                ImageUrl = "new.jpg"
            };

            var result = await service.UpdateTreeVarietyAsync(1, dto);

            Assert.NotNull(result);
            Assert.Equal("New Name", result.VarietyName);
            Assert.Equal("New Description", result.VarietyDescription);
            Assert.Equal("new.jpg", result.ImageUrl);
        }
        [Fact]
        public async Task UpdateTreeVarietyAsync_UpdatesTreeTypeId_Success()
        {
            var db = GetDbContext();

            db.TreeTypes.AddRange(
                new TreeType { TreeTypeId = 1, TreeTypeName = "Apple", ScientificName = "" },
                new TreeType { TreeTypeId = 2, TreeTypeName = "Mango", ScientificName = "" }
            );

            db.TreeVarietys.Add(new TreeVariety
            {
                VarietyId = 1,
                TreeTypeId = 1,
                VarietyName = "Var1"
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new UpdateTreeVarietyDto
            {
                TreeTypeId = 2
            };

            var result = await service.UpdateTreeVarietyAsync(1, dto);

            Assert.NotNull(result);
            Assert.Equal(2, result.TreeTypeId);
            Assert.Equal("Mango", result.TreeTypeName);
        }

    }
}
