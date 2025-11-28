using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Infrastructure.Services
{
    public class TreeImageService : ITreeImageService
    {
        private readonly MamMoiDbContext _db;
        private readonly IImageUploadService _imageUploadService;
        
        public TreeImageService(MamMoiDbContext db, IImageUploadService imageUploadService)
        {
            _db = db;
            _imageUploadService = imageUploadService;
        }

        public async Task<TreeImageDto> AddImageAsync(int userId, int treeId, UploadTreeImageRequest req, CancellationToken ct)
        {
            var treeExists = await _db.Trees.AnyAsync(t => t.TreeId == treeId, ct);
            if (!treeExists) throw new KeyNotFoundException("Tree not found");

            var img = new TreeImage
            {
                TreeId = treeId,
                ImageUrl = req.ImageUrl,
                ThumbnailUrl = req.ThumbnailUrl,
                Description = req.Description,
                CapturedAt = req.CapturedAt,
                Tags = req.Tags,
                UploadedAt = DateTime.UtcNow
            };

            _db.TreeImages.Add(img);
            await _db.SaveChangesAsync(ct);

            _db.ActivityLogs.Add(new ActivityLog
            {
                UserId = userId,
                TreeId = treeId,
                ActivityType = "UploadImage",
                ActivityDescription = $"Upload image {img.ImageId}",
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync(ct);

            return new TreeImageDto(
                img.ImageId,
                img.ImageUrl ?? string.Empty,
                img.ThumbnailUrl,
                img.Description,
                img.UploadedAt,
                img.CapturedAt
            );
        }

        public async Task<bool> DeleteImageAsync(int userId, int treeId, int imageId, CancellationToken ct)
        {
            var img = await _db.TreeImages
                .FirstOrDefaultAsync(i => i.ImageId == imageId && i.TreeId == treeId, ct);
            if (img == null) return false;

            // Delete physical files
            if (!string.IsNullOrEmpty(img.ImageUrl))
                await _imageUploadService.DeleteImageAsync(img.ImageUrl);
            if (!string.IsNullOrEmpty(img.ThumbnailUrl))
                await _imageUploadService.DeleteImageAsync(img.ThumbnailUrl);

            _db.TreeImages.Remove(img);
            await _db.SaveChangesAsync(ct);

            _db.ActivityLogs.Add(new ActivityLog
            {
                UserId = userId,
                TreeId = treeId,
                ActivityType = "DeleteImage",
                ActivityDescription = $"Delete image {imageId}",
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync(ct);

            return true;
        }

        public async Task<IReadOnlyList<TreeImageDto>> GetGalleryAsync(int treeId, CancellationToken ct)
        {
            return await _db.TreeImages.AsNoTracking()
                .Where(i => i.TreeId == treeId)
                .OrderByDescending(i => i.UploadedAt)
                .Select(i => new TreeImageDto(
                    i.ImageId,
                    i.ImageUrl ?? string.Empty,
                    i.ThumbnailUrl,
                    i.Description,
                    i.UploadedAt,
                    i.CapturedAt))
                .ToListAsync(ct);
        }

        public async Task<IReadOnlyList<GrowthHistoryItemDto>> GetGrowthHistoryAsync(int treeId, CancellationToken ct)
        {
            // Materialize each query separately to avoid EF Core translation issues with Concat after Select
            var acts = await _db.ActivityLogs.AsNoTracking()
                .Where(a => a.TreeId == treeId)
                .Select(a => new GrowthHistoryItemDto(
                    a.CreatedAt, "Activity", a.ActivityType, a.ActivityDescription))
                .ToListAsync(ct);

            var cares = await _db.CareSchedules.AsNoTracking()
                .Where(c => c.TreeId == treeId && c.CompletedAt != null)
                .Select(c => new GrowthHistoryItemDto(
                    c.CompletedAt!.Value, "CareSchedule",
                    c.TaskName ?? c.TaskType ?? "Task",
                    c.CompletionNotes ?? c.Description))
                .ToListAsync(ct);

            var weathers = await _db.WeatherHistories.AsNoTracking()
                .Where(w => w.TreeId == treeId && w.ApirespondedAt != null)
                .Select(w => new GrowthHistoryItemDto(
                    w.ApirespondedAt!.Value,
                    "Weather",
                    w.DataSource ?? "WeatherAPI",
                    w.DataQuality))
                .ToListAsync(ct);

            var images = await _db.TreeImages.AsNoTracking()
                .Where(i => i.TreeId == treeId && i.UploadedAt != null)
                .Select(i => new GrowthHistoryItemDto(
                    i.UploadedAt!.Value, "Image", "Upload", i.Description))
                .ToListAsync(ct);

            // Concat in memory after materialization
            return acts
                .Concat(cares)
                .Concat(weathers)
                .Concat(images)
                .OrderByDescending(x => x.When)
                .ToList();
        }

        public async Task<IReadOnlyList<GrowthChartPointDto>> GetGrowthChartAsync(
    int treeId, DateTime? from, DateTime? to, CancellationToken ct)
        {
            // ---- Điểm từ ảnh (TreeImages có HealthScore) ----
            var pointsFromImages = _db.TreeImages.AsNoTracking()
                .Where(i => i.TreeId == treeId && (i.UploadedAt != null || i.CapturedAt != null));

            if (from.HasValue)
                pointsFromImages = pointsFromImages.Where(i => (i.CapturedAt ?? i.UploadedAt) >= from.Value);
            if (to.HasValue)
                pointsFromImages = pointsFromImages.Where(i => (i.CapturedAt ?? i.UploadedAt) <= to.Value);

            // Materialize images query first
            var imagesProjected = await pointsFromImages
                .Select(i => new GrowthChartPointDto(
                    (i.CapturedAt ?? i.UploadedAt)!.Value,  // thời điểm đo
                    null,                                   // HeightMeters — đã bỏ
                    i.HealthScore,                          // từ ảnh
                    null                                    // sản lượng — không còn trong Tree
                ))
                .ToListAsync(ct);

            // ---- Điểm hiện tại (chỉ thời gian) ----
            // Materialize latest point query first
            var latestPoint = await _db.Trees.AsNoTracking()
                .Where(t => t.TreeId == treeId)
                .Select(t => new GrowthChartPointDto(
                    (DateTime?)(t.UpdatedAt ?? t.CreatedAt) ?? DateTime.UtcNow,
                    null,  // HeightMeters
                    null,  // HealthScore
                    null   // sản lượng (đã bỏ)
                ))
                .ToListAsync(ct);

            // ---- Tổng hợp ----
            // Concat in memory after materialization
            return imagesProjected
                .Concat(latestPoint)
                .OrderBy(p => p.When)
                .ToList();
        }


        public async Task<IReadOnlyList<GrowthStageDto>> GetStagesForTreeAsync(int treeId, CancellationToken ct)
        {
            var ttId = await _db.Trees.AsNoTracking()
                .Where(t => t.TreeId == treeId)
                .Select(t => t.TreeTypeId)
                .FirstOrDefaultAsync(ct);

            return await _db.TreeGrowthStages.AsNoTracking()
                .Where(s => s.TreeTypeId == ttId)
                .OrderBy(s => s.StageOrder)
                .Select(s => new GrowthStageDto(
                    s.StageId, s.StageName, s.StageOrder, s.Description))
                .ToListAsync(ct);
        }

        public async Task<IReadOnlyList<GrowthStageDto>> GetStagesByTreeTypeIdAsync(int treeTypeId, CancellationToken ct)
        {
            return await _db.TreeGrowthStages.AsNoTracking()
                .Where(s => s.TreeTypeId == treeTypeId)
                .OrderBy(s => s.StageOrder)
                .Select(s => new GrowthStageDto(
                    s.StageId, s.StageName, s.StageOrder, s.Description))
                .ToListAsync(ct);
        }
    }
}
