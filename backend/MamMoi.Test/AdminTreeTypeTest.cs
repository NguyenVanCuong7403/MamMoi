using MamMoi.Application.DTOs.Admin;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using MamMoi.Infrastructure.Services.Admin;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace MamMoi.Test
{
    public class AdminTreeTypeTest
    {
        private MamMoiDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<MamMoiDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new MamMoiDbContext(options);
        }

        private AdminTreeTypeService GetService(MamMoiDbContext context)
        {
            var logger = new Mock<ILogger<AdminTreeTypeService>>();
            var img = new Mock<IImageUploadService>();

            return new AdminTreeTypeService(context, logger.Object, img.Object);
        }

        // ======================================================
        //  TEST 1 — searchTerm = null (default branch)
        // ======================================================
        [Fact]
        public async Task GetAllTreeTypesAsync_NoSearchTerm_ReturnsAllItems()
        {
            var db = GetDbContext();

            db.SoilMasters.Add(new SoilMaster
            {
                SoilMasterId = 1,
                SoilName = "Test Soil"
            });

            db.TreeTypes.AddRange(
                new TreeType
                {
                    TreeTypeId = 1,
                    SoilMasterId = 1,
                    TreeTypeName = "Apple",
                    ScientificName = "",
                    Description = "",
                    Category = "",
                    IsActive = true
                },
                new TreeType
                {
                    TreeTypeId = 2,
                    SoilMasterId = 1,
                    TreeTypeName = "Banana",
                    ScientificName = "",
                    Description = "",
                    Category = "",
                    IsActive = false
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var (treeTypes, totalCount) = await service.GetAllTreeTypesAsync();

            Assert.Equal(2, totalCount);
            Assert.Equal(2, treeTypes.Count);
        }

        // ======================================================
        //  TEST 2 — searchTerm applied (branch IF 1)
        // ======================================================
        [Fact]
        public async Task GetAllTreeTypesAsync_WithSearchTerm_FiltersCorrectly()
        {
            var db = GetDbContext();

            db.SoilMasters.Add(new SoilMaster
            {
                SoilMasterId = 1,
                SoilName = "Soil"
            });

            db.TreeTypes.AddRange(
                new TreeType
                {
                    TreeTypeId = 1,
                    SoilMasterId = 1,
                    TreeTypeName = "Mango",
                    ScientificName = "",
                    Description = "",
                    Category = "",
                    IsActive = true
                },
                new TreeType
                {
                    TreeTypeId = 2,
                    SoilMasterId = 1,
                    TreeTypeName = "Orange",
                    ScientificName = "",
                    Description = "",
                    Category = "",
                    IsActive = true
                }
            );

            await db.SaveChangesAsync();
            var service = GetService(db);

            var (treeTypes, totalCount) =
                await service.GetAllTreeTypesAsync(searchTerm: "Man");

            Assert.Single(treeTypes);
            Assert.Equal("Mango", treeTypes[0].TreeTypeName);
            Assert.Equal(1, totalCount);
        }

        // ======================================================
        //  TEST 3 — isActive = true (branch IF 2)
        // ======================================================
        [Fact]
        public async Task GetAllTreeTypesAsync_FilterActiveTrue_ReturnsOnlyActiveItems()
        {
            var db = GetDbContext();

            db.SoilMasters.Add(new SoilMaster { SoilMasterId = 1, SoilName = "Soil" });

            db.TreeTypes.AddRange(
                new TreeType
                {
                    TreeTypeId = 1,
                    SoilMasterId = 1,
                    TreeTypeName = "A",
                    ScientificName = "",
                    Description = "",
                    Category = "",
                    IsActive = true
                },
                new TreeType
                {
                    TreeTypeId = 2,
                    SoilMasterId = 1,
                    TreeTypeName = "B",
                    ScientificName = "",
                    Description = "",
                    Category = "",
                    IsActive = false
                }
            );
            await db.SaveChangesAsync();

            var service = GetService(db);

            var (treeTypes, totalCount) =
                await service.GetAllTreeTypesAsync(isActive: true);

            Assert.Single(treeTypes);
            Assert.Equal(1, totalCount);
            Assert.True(treeTypes[0].IsActive);
        }

        // ======================================================
        //  TEST 4 — isActive = false
        // ======================================================
        [Fact]
        public async Task GetAllTreeTypesAsync_FilterInactive_ReturnsOnlyInactiveItems()
        {
            var db = GetDbContext();

            db.SoilMasters.Add(new SoilMaster { SoilMasterId = 1, SoilName = "Soil" });

            db.TreeTypes.AddRange(
                new TreeType
                {
                    TreeTypeId = 1,
                    SoilMasterId = 1,
                    TreeTypeName = "A",
                    ScientificName = "",
                    Description = "",
                    Category = "",
                    IsActive = true
                },
                new TreeType
                {
                    TreeTypeId = 2,
                    SoilMasterId = 1,
                    TreeTypeName = "B",
                    ScientificName = "",
                    Description = "",
                    Category = "",
                    IsActive = false
                }
            );
            await db.SaveChangesAsync();

            var service = GetService(db);

            var (treeTypes, totalCount) =
                await service.GetAllTreeTypesAsync(isActive: false);

            Assert.Single(treeTypes);
            Assert.False(treeTypes[0].IsActive);
        }

        // ======================================================
        // TEST 5 — Pagination branch
        // ======================================================
        [Fact]
        public async Task GetAllTreeTypesAsync_WithPagination_ReturnsCorrectPage()
        {
            var db = GetDbContext();

            db.SoilMasters.Add(new SoilMaster { SoilMasterId = 1, SoilName = "Soil" });

            for (int i = 1; i <= 30; i++)
            {
                db.TreeTypes.Add(new TreeType
                {
                    TreeTypeId = i,
                    SoilMasterId = 1,
                    TreeTypeName = $"Tree{i:D2}", // Tree01, Tree02, ...
                    ScientificName = "",
                    Description = "",
                    Category = "",
                    IsActive = true
                });
            }

            await db.SaveChangesAsync();
            var service = GetService(db);

            var (treeTypes, totalCount) =
                await service.GetAllTreeTypesAsync(page: 2, pageSize: 10);

            Assert.Equal(30, totalCount);
            Assert.Equal(10, treeTypes.Count);
            // Chỉ cần đảm bảo trong page này có Tree11 (không phụ thuộc exact index)
            Assert.Contains(treeTypes, t => t.TreeTypeName == "Tree11");
        }
        // =======================================================================
        //  TESTS FOR: GetTreeTypeByIdAsync
        // =======================================================================

        [Fact]
        public async Task GetTreeTypeByIdAsync_ReturnsNull_WhenNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.GetTreeTypeByIdAsync(999);

            Assert.Null(result);
        }

        [Fact]
        public async Task GetTreeTypeByIdAsync_ReturnsCorrectData_WhenFound()
        {
            var db = GetDbContext();

            // Seed Soil
            db.SoilMasters.Add(new SoilMaster
            {
                SoilMasterId = 1,
                SoilName = "Loamy Soil"
            });

            // Seed TreeType
            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 10,
                SoilMasterId = 1,
                TreeTypeName = "Mango",
                ScientificName = "Mangifera indica",
                Description = "Sample description",
                Category = "Fruit",
                AverageLifespanYears = 5,
                OptimalTemperatureMin = 20,
                OptimalTemperatureMax = 35,
                OptimalHumidityMin = 50,
                OptimalHumidityMax = 80,
                DroughtTolerance = "3",
                FloodTolerance = "2",
                FrostTolerance = "1",
                WindTolerance = "4",
                ImageUrl = "img.png",
                CareGuide = "Water weekly",
                LightRequirement = "Medium",
                WaterRequirement = "Medium",
                Pests = "None",
                SeasonalRoadmap = "Spring growth",
                IsActive = true
            });

            // Seed related tables for Count()
            db.TreeVarietys.Add(new TreeVariety
            {
                VarietyId = 1,
                TreeTypeId = 10
            });
            db.Trees.Add(new Tree
            {
                TreeId = 1,
                TreeTypeId = 10
            });
            db.TreeGrowthStages.Add(new TreeGrowthStage
            {
                StageId = 1,
                TreeTypeId = 10,
                StageName = "Seedling",
                StageOrder = 1
            });


            await db.SaveChangesAsync();
            var service = GetService(db);

            var detail = await service.GetTreeTypeByIdAsync(10);

            Assert.NotNull(detail);
            Assert.Equal(10, detail.TreeTypeId);
            Assert.Equal("Mango", detail.TreeTypeName);
            Assert.Equal("Mangifera indica", detail.ScientificName);
            Assert.Equal("Loamy Soil", detail.SoilMasterName);

            Assert.Equal(1, detail.VarietiesCount);
            Assert.Equal(1, detail.TreesCount);
            Assert.Equal(1, detail.GrowthStagesCount);
        }

        [Fact]
        public async Task CreateTreeTypeAsync_SoilMasterNotFound_ThrowsException()
        {
            // Arrange
            var db = GetDbContext();     // KHÔNG thêm SoilMaster
            var service = GetService(db);

            var dto = new CreateTreeTypeDto
            {
                SoilMasterId = 999,            // không tồn tại
                TreeTypeName = "Mango"
            };

            // Act + Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.CreateTreeTypeAsync(dto));

            Assert.Equal("SoilMaster not found", ex.Message);
        }
        [Fact]
        public async Task CreateTreeTypeAsync_NameAlreadyExists_ThrowsException()
        {
            var db = GetDbContext();

            // Seed SoilMaster
            db.SoilMasters.Add(new SoilMaster { SoilMasterId = 1, SoilName = "Soil" });

            // Seed TreeType trùng tên
            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                SoilMasterId = 1,
                TreeTypeName = "Mango",
                ScientificName = "",
                Description = ""
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new CreateTreeTypeDto
            {
                SoilMasterId = 1,
                TreeTypeName = "Mango"   // đã tồn tại
            };

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.CreateTreeTypeAsync(dto));

            Assert.Equal("TreeType name already exists", ex.Message);
        }

        [Fact]
        public async Task CreateTreeTypeAsync_Success_ReturnsCreatedTreeType()
        {
            var db = GetDbContext();

            // Seed SoilMaster hợp lệ
            db.SoilMasters.Add(new SoilMaster
            {
                SoilMasterId = 1,
                SoilName = "Standard Soil"
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new CreateTreeTypeDto
            {
                SoilMasterId = 1,
                TreeTypeName = "Durian",
                ScientificName = "Durio zibethinus",
                Description = "Smelly but delicious",
                Category = "Fruit",
                AverageLifespanYears = 25,
                OptimalTemperatureMin = 22,
                OptimalTemperatureMax = 32,
                OptimalHumidityMin = 55,
                OptimalHumidityMax = 80,
                DroughtTolerance = "3",
                FloodTolerance = "1",
                FrostTolerance = "0",
                WindTolerance = "3",
                ImageUrl = "durian.png",
                CareGuide = "Water weekly",
                LightRequirement = "Medium",
                WaterRequirement = "Medium",
                Pests = "None",
                SeasonalRoadmap = "Spring"
            };

            // Act
            var result = await service.CreateTreeTypeAsync(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Durian", result.TreeTypeName);
            Assert.Equal("Durio zibethinus", result.ScientificName);
            Assert.False(result.IsActive);    // mặc định = false
            Assert.Equal(0, result.VarietiesCount);
            Assert.Equal(0, result.TreesCount);
            Assert.Equal(0, result.GrowthStagesCount);
        }
        // ======================================================
        // UPDATE — TEST 1: TreeType không tồn tại → return null
        // ======================================================
        [Fact]
        public async Task UpdateTreeTypeAsync_ReturnsNull_WhenTreeTypeNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db);

            var result = await service.UpdateTreeTypeAsync(999, new UpdateTreeTypeDto());

            Assert.Null(result);
        }

        // ======================================================
        // UPDATE — TEST 2: SoilMasterId tồn tại = false → exception
        // ======================================================
        [Fact]
        public async Task UpdateTreeTypeAsync_Throws_WhenSoilMasterNotFound()
        {
            var db = GetDbContext();

            // Seed existing TreeType
            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                SoilMasterId = 1,
                TreeTypeName = "Apple",
                ScientificName = "",
                Category = ""
            });

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new UpdateTreeTypeDto
            {
                SoilMasterId = 999
            };

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.UpdateTreeTypeAsync(1, dto));
        }

        // ======================================================
        // UPDATE — TEST 3: TreeTypeName bị trùng → exception
        // ======================================================
        [Fact]       
        public async Task UpdateTreeTypeAsync_Throws_WhenTreeTypeNameExists()
        {
            var db = GetDbContext();

            db.SoilMasters.Add(new SoilMaster { SoilMasterId = 1, SoilName = "Soil" });

            db.TreeTypes.AddRange(
                new TreeType
                {
                    TreeTypeId = 1,
                    SoilMasterId = 1,
                    TreeTypeName = "A",
                    ScientificName = "",
                    Description = "",
                    Category = "",
                    AverageLifespanYears = 1,
                    OptimalTemperatureMin = 10,
                    OptimalTemperatureMax = 30,
                    OptimalHumidityMin = 20,
                    OptimalHumidityMax = 80,
                    DroughtTolerance = "1",
                    FloodTolerance = "1",
                    FrostTolerance = "1",
                    WindTolerance = "1",
                    ImageUrl = null,
                    IsActive = true,
                    CareGuide = "",
                    LightRequirement = "",
                    WaterRequirement = "",
                    Pests = "",
                    SeasonalRoadmap = ""
                },
                new TreeType
                {
                    TreeTypeId = 2,
                    SoilMasterId = 1,
                    TreeTypeName = "B",
                    ScientificName = "",
                    Description = "",
                    Category = "",
                    AverageLifespanYears = 1,
                    OptimalTemperatureMin = 10,
                    OptimalTemperatureMax = 30,
                    OptimalHumidityMin = 20,
                    OptimalHumidityMax = 80,
                    DroughtTolerance = "1",
                    FloodTolerance = "1",
                    FrostTolerance = "1",
                    WindTolerance = "1",
                    ImageUrl = null,
                    IsActive = true,
                    CareGuide = "",
                    LightRequirement = "",
                    WaterRequirement = "",
                    Pests = "",
                    SeasonalRoadmap = ""
                }
            );

            await db.SaveChangesAsync();

            var service = GetService(db);

            var dto = new UpdateTreeTypeDto
            {
                TreeTypeName = "B" // trùng TreeTypeId=2
            };

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.UpdateTreeTypeAsync(1, dto));
        }


        // ======================================================
        // UPDATE — TEST 4: Update thành công (không đổi ảnh)
        // ======================================================
        [Fact]
        public async Task UpdateTreeTypeAsync_Success_WhenValid()
        {
            var db = GetDbContext();

            db.SoilMasters.Add(new SoilMaster { SoilMasterId = 1, SoilName = "Soil" });

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                SoilMasterId = 1,
                TreeTypeName = "Mango",
                ScientificName = "",
                Category = "",
                ImageUrl = "old.png"
            });

            await db.SaveChangesAsync();
            var service = GetService(db);

            var dto = new UpdateTreeTypeDto
            {
                TreeTypeName = "New Mango",
                Description = "Updated",
                ImageUrl = "old.png" // không đổi ảnh
            };

            var result = await service.UpdateTreeTypeAsync(1, dto);

            Assert.NotNull(result);
            Assert.Equal("New Mango", result.TreeTypeName);
            Assert.Equal("Updated", result.Description);
        }

        // ======================================================
        // UPDATE — TEST 5: Đổi ảnh → DeleteImageAsync được gọi
        // ======================================================
        [Fact]
        public async Task UpdateTreeTypeAsync_DeletesOldImage_WhenImageChanged()
        {
            var db = GetDbContext();

            db.SoilMasters.Add(new SoilMaster { SoilMasterId = 1, SoilName = "Soil" });

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                SoilMasterId = 1,
                TreeTypeName = "Apple",
                ScientificName = "",
                Description = "",
                Category = "",
                AverageLifespanYears = 1,
                OptimalTemperatureMin = 1,
                OptimalTemperatureMax = 10,
                OptimalHumidityMin = 20,
                OptimalHumidityMax = 80,
                DroughtTolerance = "1",
                FloodTolerance = "1",
                FrostTolerance = "1",
                WindTolerance = "1",
                ImageUrl = "old.png",
                IsActive = true,
                CareGuide = "",
                LightRequirement = "",
                WaterRequirement = "",
                Pests = "",
                SeasonalRoadmap = ""
            });
            await db.SaveChangesAsync();

            var mockImg = new Mock<IImageUploadService>();
            var logger = new Mock<ILogger<AdminTreeTypeService>>();

            var service = new AdminTreeTypeService(db, logger.Object, mockImg.Object);

            var dto = new UpdateTreeTypeDto
            {
                ImageUrl = "new.png"
            };

            await service.UpdateTreeTypeAsync(1, dto);

            mockImg.Verify(m => m.DeleteImageAsync("old.png"), Times.Once);
        }

        // ======================================================
        // UPDATE — TEST 6: Xóa ảnh (ImageUrl = "")
        // ======================================================
        [Fact]
        public async Task UpdateTreeTypeAsync_RemovesImage_WhenImageUrlEmpty()
        {
            var db = GetDbContext();

            db.SoilMasters.Add(new SoilMaster { SoilMasterId = 1, SoilName = "Soil" });

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                SoilMasterId = 1,
                TreeTypeName = "Apple",
                ScientificName = "",
                Description = "",
                Category = "",
                AverageLifespanYears = 1,
                OptimalTemperatureMin = 1,
                OptimalTemperatureMax = 10,
                OptimalHumidityMin = 20,
                OptimalHumidityMax = 80,
                DroughtTolerance = "1",
                FloodTolerance = "1",
                FrostTolerance = "1",
                WindTolerance = "1",
                ImageUrl = "old.png",
                IsActive = true,
                CareGuide = "",
                LightRequirement = "",
                WaterRequirement = "",
                Pests = "",
                SeasonalRoadmap = ""
            });

            await db.SaveChangesAsync();

            var mockImg = new Mock<IImageUploadService>();
            var logger = new Mock<ILogger<AdminTreeTypeService>>();

            var service = new AdminTreeTypeService(db, logger.Object, mockImg.Object);

            var dto = new UpdateTreeTypeDto
            {
                ImageUrl = "" // xóa ảnh
            };

            await service.UpdateTreeTypeAsync(1, dto);

            mockImg.Verify(m => m.DeleteImageAsync("old.png"), Times.Once);
        }


    }
}
