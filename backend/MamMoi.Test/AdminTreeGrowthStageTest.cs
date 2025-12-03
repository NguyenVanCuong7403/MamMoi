    using MamMoi.Infrastructure.Models;
    using MamMoi.Infrastructure.Services.Admin;
    using MamMoi.Application.DTOs.Admin;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Moq;
    using MamMoi.Application.Interfaces;
    using Microsoft.AspNetCore.Http;

namespace MamMoi.Test
{
    public class AdminTreeGrowthStageTest
    {
        private MamMoiDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<MamMoiDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new MamMoiDbContext(options);
        }
        

        private AdminTreeGrowthStageService GetService(
            MamMoiDbContext context,
            out Mock<IImageUploadService> imageServiceMock)
        {
            var logger = new Mock<ILogger<AdminTreeGrowthStageService>>();
            imageServiceMock = new Mock<IImageUploadService>();

            // Mock upload — Task<string>
            imageServiceMock
                .Setup(s => s.UploadImageAsync(
                    It.IsAny<Stream>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<CancellationToken>()
                ))
                .ReturnsAsync("fake-url.jpg");

            // Mock delete — Task<bool>
            imageServiceMock
                .Setup(s => s.DeleteImageAsync(It.IsAny<string>()))
                .ReturnsAsync(true);

            return new AdminTreeGrowthStageService(
                context,
                logger.Object,
                imageServiceMock.Object
            );
        }

        // ============================================================
        // TEST 1 — TreeTypeId không tồn tại → throw
        // ============================================================
        [Fact]
            public async Task CreateTreeGrowthStageAsync_Throws_WhenTreeTypeNotFound()
            {
                var db = GetDbContext();
                var service = GetService(db, out var _);

                var dto = new CreateTreeGrowthStageDto
                {
                    TreeTypeId = 999,
                    StageName = "Seedling"
                };

                await Assert.ThrowsAsync<InvalidOperationException>(() =>
                    service.CreateTreeGrowthStageAsync(dto));
            }


            // ============================================================
            // TEST 2 — Không truyền StageOrder → StageOrder = 1, MinAge auto = 0
            // ============================================================
            [Fact]
            public async Task CreateTreeGrowthStageAsync_NoStageOrder_AddsAsFirstStage()
            {
                var db = GetDbContext();

                db.TreeTypes.Add(new TreeType
                {
                    TreeTypeId = 1,
                    TreeTypeName = "Apple",
                    ScientificName = ""
                });
                await db.SaveChangesAsync();

                var service = GetService(db, out var _);

                var dto = new CreateTreeGrowthStageDto
                {
                    TreeTypeId = 1,
                    StageName = "Seedling"
                };

                var result = await service.CreateTreeGrowthStageAsync(dto);

                Assert.NotNull(result);
                Assert.Equal(1, result.StageOrder);
                Assert.Equal(0, result.MinAgeInMonths);   // auto
            }


            // ============================================================
            // TEST 3 — StageOrder trùng → shift StageOrder các stage khác
            // ============================================================
            [Fact]
            public async Task CreateTreeGrowthStageAsync_ShiftsExistingStages_WhenOrderConflict()
            {
                var db = GetDbContext();

                db.TreeTypes.Add(new TreeType { TreeTypeId = 1, TreeTypeName = "Apple", ScientificName = "" });

                db.TreeGrowthStages.AddRange(
                    new TreeGrowthStage { StageId = 1, TreeTypeId = 1, StageOrder = 1, StageName = "S1", MaxAgeInMonths = 2 },
                    new TreeGrowthStage { StageId = 2, TreeTypeId = 1, StageOrder = 2, StageName = "S2", MaxAgeInMonths = 5 }
                );
                await db.SaveChangesAsync();

                var service = GetService(db, out var _);

                var dto = new CreateTreeGrowthStageDto
                {
                    TreeTypeId = 1,
                    StageOrder = 1,
                    StageName = "Inserted"
                };

                var result = await service.CreateTreeGrowthStageAsync(dto);

                Assert.NotNull(result);
                Assert.Equal(1, result.StageOrder);

                var stages = db.TreeGrowthStages.OrderBy(s => s.StageOrder).ToList();

                Assert.Equal(3, stages.Count);
                Assert.Equal("Inserted", stages[0].StageName);
                Assert.Equal("S1", stages[1].StageName);
                Assert.Equal("S2", stages[2].StageName);
            }


            // ============================================================
            // TEST 4 — Auto set MinAge theo previousStage.MaxAge + 1
            // ============================================================
            [Fact]
            public async Task CreateTreeGrowthStageAsync_MinAge_AutoAdjusted()
            {
                var db = GetDbContext();

                db.TreeTypes.Add(new TreeType { TreeTypeId = 1, TreeTypeName = "Apple", ScientificName = "" });

                db.TreeGrowthStages.Add(new TreeGrowthStage
                {
                    StageName = "Stage 1",
                    TreeTypeId = 1,
                    StageOrder = 1,
                    MinAgeInMonths = 0,
                    MaxAgeInMonths = 10
                });
                await db.SaveChangesAsync();

                var service = GetService(db, out var _);

                var dto = new CreateTreeGrowthStageDto
                {
                    TreeTypeId = 1,
                    StageOrder = 2,
                    StageName = "Next",
                    MinAgeInMonths = 1
                };

                var result = await service.CreateTreeGrowthStageAsync(dto);

                Assert.Equal(11, result.MinAgeInMonths);

            }


            // ============================================================
            // TEST 5 — Overlapping tuổi → throw
            // ============================================================
            [Fact]
            public async Task CreateTreeGrowthStageAsync_Throws_WhenAgeOverlaps()
            {
                var db = GetDbContext();

                db.TreeTypes.Add(new TreeType { TreeTypeId = 1, TreeTypeName = "Apple", ScientificName = "" });

                db.TreeGrowthStages.Add(new TreeGrowthStage
                {
                    StageName = "Stage 1",
                    TreeTypeId = 1,
                    StageOrder = 1,
                    MinAgeInMonths = 0,
                    MaxAgeInMonths = 10
                });
                await db.SaveChangesAsync();

                var service = GetService(db, out var _);

                var dto = new CreateTreeGrowthStageDto
                {
                    TreeTypeId = 1,
                    StageOrder = 2,
                    StageName = "Invalid",
                    MinAgeInMonths = 3,
                    MaxAgeInMonths = 10
                };

                await Assert.ThrowsAnyAsync<Exception>(() =>
                    service.CreateTreeGrowthStageAsync(dto));
            }


            // ============================================================
            // TEST 6 — Kích hoạt TreeType.IsActive = true khi tạo stage đầu tiên
            // ============================================================
            [Fact]
            public async Task CreateTreeGrowthStageAsync_ActivatesTreeType_WhenFirstStageAdded()
            {
                var db = GetDbContext();

                db.TreeTypes.Add(new TreeType
                {
                    TreeTypeId = 1,
                    TreeTypeName = "Apple",
                    ScientificName = "",
                    IsActive = false
                });
                await db.SaveChangesAsync();

                var service = GetService(db, out var _);

                var dto = new CreateTreeGrowthStageDto
                {
                    TreeTypeId = 1,
                    StageName = "Seedling"
                };

                var result = await service.CreateTreeGrowthStageAsync(dto);

                Assert.True(db.TreeTypes.First().IsActive);
            }
        // =============================================================
        // U1 — stageId không tồn tại → return null
        // =============================================================
        [Fact]
        public async Task UpdateTreeGrowthStageAsync_ReturnsNull_WhenStageNotFound()
        {
            var db = GetDbContext();
            var service = GetService(db, out var _);

            var dto = new UpdateTreeGrowthStageDto();
            var result = await service.UpdateTreeGrowthStageAsync(999, dto);

            Assert.Null(result);
        }



        // =============================================================
        // U2 — TreeTypeId mới không tồn tại → throw
        // =============================================================
        [Fact]
        public async Task UpdateTreeGrowthStageAsync_Throws_WhenTreeTypeNotFound()
        {
            var db = GetDbContext();

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                TreeTypeName = "Apple",
                ScientificName = "Malus"
            });

            db.TreeGrowthStages.Add(new TreeGrowthStage
            {
                StageId = 1,
                TreeTypeId = 1,
                StageOrder = 1,
                StageName = "A"
            });
            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var dto = new UpdateTreeGrowthStageDto { TreeTypeId = 999 };

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.UpdateTreeGrowthStageAsync(1, dto));
        }



        // =============================================================
        // U3 — Update StageName
        // =============================================================
        [Fact]
        public async Task UpdateTreeGrowthStageAsync_UpdatesStageName()
        {
            var db = GetDbContext();

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                TreeTypeName = "Apple",
                ScientificName = "Malus domestica"
            });

            db.TreeGrowthStages.Add(new TreeGrowthStage
            {
                StageId = 1,
                TreeTypeId = 1,
                StageOrder = 1,
                StageName = "Old"
            });
            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var dto = new UpdateTreeGrowthStageDto { StageName = "New" };

            var result = await service.UpdateTreeGrowthStageAsync(1, dto);

            Assert.Equal("New", result.StageName);
        }



        // =============================================================
        // U4 — Đổi StageOrder từ 2 → 4
        // =============================================================
        [Fact]
        public async Task UpdateTreeGrowthStageAsync_ShiftOrder_Up()
        {
            var db = GetDbContext();

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                TreeTypeName = "Apple",
                ScientificName = "Malus"
            });

            db.TreeGrowthStages.AddRange(
                new TreeGrowthStage { StageId = 1, TreeTypeId = 1, StageOrder = 2, StageName = "S2" },
                new TreeGrowthStage { StageId = 2, TreeTypeId = 1, StageOrder = 3, StageName = "S3" },
                new TreeGrowthStage { StageId = 3, TreeTypeId = 1, StageOrder = 4, StageName = "S4" }
            );
            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            await service.UpdateTreeGrowthStageAsync(1, new UpdateTreeGrowthStageDto { StageOrder = 4 });

            var list = db.TreeGrowthStages.OrderBy(s => s.StageOrder).ToList();

            // Expected:
            // 1 → 3
            // 2 → 2
            // 3 → 1

            Assert.Equal(2, list[0].StageOrder);
            Assert.Equal(2, list[0].StageId);

            Assert.Equal(3, list[1].StageOrder);
            Assert.Equal(3, list[1].StageId);

            Assert.Equal(4, list[2].StageOrder);
            Assert.Equal(1, list[2].StageId);
        }



        // =============================================================
        // U5 — Đổi StageOrder từ 5 → 2
        // =============================================================
        [Fact]
        public async Task UpdateTreeGrowthStageAsync_ShiftOrder_Down()
        {
            var db = GetDbContext();

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                TreeTypeName = "Apple",
                ScientificName = "Malus"
            });

            db.TreeGrowthStages.AddRange(
                new TreeGrowthStage { StageId = 1, TreeTypeId = 1, StageOrder = 5, StageName = "S5" },
                new TreeGrowthStage { StageId = 2, TreeTypeId = 1, StageOrder = 2, StageName = "S2" },
                new TreeGrowthStage { StageId = 3, TreeTypeId = 1, StageOrder = 3, StageName = "S3" },
                new TreeGrowthStage { StageId = 4, TreeTypeId = 1, StageOrder = 4, StageName = "S4" }
            );
            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            await service.UpdateTreeGrowthStageAsync(1, new UpdateTreeGrowthStageDto { StageOrder = 2 });

            var list = db.TreeGrowthStages.OrderBy(s => s.StageOrder).ToList();

            Assert.Equal(1, list[1].StageId);   // vị trí thứ 2 phải là StageId=1
        }



        // =============================================================
        // U6 — Auto adjust MinAge
        // =============================================================
        [Fact]
        public async Task UpdateTreeGrowthStageAsync_AutoAdjustMinAge()
        {
            var db = GetDbContext();

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                TreeTypeName = "Apple",
                ScientificName = "Malus"
            });

            db.TreeGrowthStages.AddRange(
                new TreeGrowthStage
                {
                    StageId = 1,
                    TreeTypeId = 1,
                    StageOrder = 1,
                    StageName = "Stage 1",
                    MinAgeInMonths = 0,
                    MaxAgeInMonths = 10
                },
                new TreeGrowthStage
                {
                    StageId = 2,
                    TreeTypeId = 1,
                    StageOrder = 2,
                    StageName = "Stage 2",
                    MinAgeInMonths = 11,
                    MaxAgeInMonths = 20
                }
            );
            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var dto = new UpdateTreeGrowthStageDto { MinAgeInMonths = 5 };

            var result = await service.UpdateTreeGrowthStageAsync(2, dto);

            Assert.Equal(11, result.MinAgeInMonths);
        }



        // =============================================================
        // U7 — Invalid age range → throw
        // =============================================================
        [Fact]
        public async Task UpdateTreeGrowthStageAsync_Throws_InvalidAgeRange()
        {
            var db = GetDbContext();

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                TreeTypeName = "Apple",
                ScientificName = "Malus"
            });

            db.TreeGrowthStages.Add(new TreeGrowthStage
            {
                StageId = 1,
                TreeTypeId = 1,
                StageOrder = 1,
                StageName = "Stage 1",
                MinAgeInMonths = 0,
                MaxAgeInMonths = 10
            });
            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var dto = new UpdateTreeGrowthStageDto
            {
                MinAgeInMonths = 15,
                MaxAgeInMonths = 5
            };

            await Assert.ThrowsAnyAsync<Exception>(() =>
                service.UpdateTreeGrowthStageAsync(1, dto));
        }



        // =============================================================
        // U8 — overlap age → throw
        // =============================================================
        [Fact]
        public async Task UpdateTreeGrowthStageAsync_Throws_AgeOverlap()
        {
            var db = GetDbContext();

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                TreeTypeName = "Apple",
                ScientificName = "Malus"
            });

            db.TreeGrowthStages.AddRange(
                new TreeGrowthStage { StageId = 1, TreeTypeId = 1, StageOrder = 1, StageName = "S1", MinAgeInMonths = 0, MaxAgeInMonths = 5 },
                new TreeGrowthStage { StageId = 2, TreeTypeId = 1, StageOrder = 2, StageName = "S2", MinAgeInMonths = 6, MaxAgeInMonths = 10 }
            );
            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var dto = new UpdateTreeGrowthStageDto
            {
                MinAgeInMonths = 3,
                MaxAgeInMonths = 7
            };

            await Assert.ThrowsAnyAsync<Exception>(() =>
                service.UpdateTreeGrowthStageAsync(2, dto));
        }



        // =============================================================
        // U9 — Remove Image
        // =============================================================
        [Fact]
        public async Task UpdateTreeGrowthStageAsync_RemoveImage()
        {
            var db = GetDbContext();

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                TreeTypeName = "Apple",
                ScientificName = "Malus"
            });

            db.TreeGrowthStages.Add(new TreeGrowthStage
            {
                StageId = 1,
                TreeTypeId = 1,
                StageOrder = 1,
                StageName = "Stage 1",
                ImageUrl = "old.jpg"
            });
            await db.SaveChangesAsync();

            var service = GetService(db, out var imageServiceMock);

            var dto = new UpdateTreeGrowthStageDto { ImageUrl = "" };

            var result = await service.UpdateTreeGrowthStageAsync(1, dto);

            Assert.Null(result.ImageUrl);
            imageServiceMock.Verify(s => s.DeleteImageAsync("old.jpg"), Times.Once);
        }



        // =============================================================
        // U10 — Full update OK
        // =============================================================
        [Fact]
        public async Task UpdateTreeGrowthStageAsync_Success()
        {
            var db = GetDbContext();

            db.TreeTypes.Add(new TreeType
            {
                TreeTypeId = 1,
                TreeTypeName = "Apple",
                ScientificName = "Malus"
            });

            db.TreeGrowthStages.Add(new TreeGrowthStage
            {
                StageId = 1,
                TreeTypeId = 1,
                StageOrder = 1,
                StageName = "Old",
                MinAgeInMonths = 0,
                MaxAgeInMonths = 10
            });
            await db.SaveChangesAsync();

            var service = GetService(db, out var _);

            var dto = new UpdateTreeGrowthStageDto
            {
                StageName = "New",
                Description = "Desc",
                MinAgeInMonths = 0,
                MaxAgeInMonths = 12,
                WateringFrequencyDays = 3,
                WateringAmountLiters = 5,
                FertilizingFrequencyDays = 10,
                FertilizerType = "Organic",
                FertilizerAmountGrams = 20,
                PruningFrequencyDays = 30,
                CareInstructions = "Care",
                CommonIssues = "Issues",
                CriticalWeatherFactors = "Weather",
                VulnerabilityLevel = 2,
                Icon = "icon.png",
                NodeColor = "#fff",
                LineColor = "#000"
            };

            var result = await service.UpdateTreeGrowthStageAsync(1, dto);

            Assert.Equal("New", result.StageName);
            Assert.Equal("Desc", result.Description);
            Assert.Equal(12, result.MaxAgeInMonths);
        }

    }
}
