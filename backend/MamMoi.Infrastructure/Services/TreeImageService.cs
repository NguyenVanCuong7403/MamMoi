using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Infrastructure.Services
{
    public class TreeImageService : ITreeImageService
    {
        private readonly MamMoiDbContext _db;
        public TreeImageService(MamMoiDbContext db) => _db = db;

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
            var acts = _db.ActivityLogs.AsNoTracking()
                .Where(a => a.TreeId == treeId)
                .Select(a => new GrowthHistoryItemDto(
                    a.CreatedAt, "Activity", a.ActivityType, a.ActivityDescription));

            var cares = _db.CareSchedules.AsNoTracking()
                .Where(c => c.TreeId == treeId && c.CompletedAt != null)
                .Select(c => new GrowthHistoryItemDto(
                    c.CompletedAt!.Value, "CareSchedule",
                    c.TaskName ?? c.TaskType ?? "Task",
                    c.CompletionNotes ?? c.Description));

            var weathers = _db.WeatherHistories.AsNoTracking()
    .Where(w => w.TreeId == treeId && w.ApirespondedAt != null) // <-- r thường
    .Select(w => new GrowthHistoryItemDto(
        w.ApirespondedAt!.Value,                                  // <-- r thường
        "Weather",
        w.DataSource ?? "WeatherAPI",
        w.DataQuality));

            var images = _db.TreeImages.AsNoTracking()
                .Where(i => i.TreeId == treeId && i.UploadedAt != null)
                .Select(i => new GrowthHistoryItemDto(
                    i.UploadedAt!.Value, "Image", "Upload", i.Description));

            return await acts
                .Concat(cares)
                .Concat(weathers)
                .Concat(images)
                .OrderByDescending(x => x.When)
                .ToListAsync(ct);
        }

        public async Task<IReadOnlyList<GrowthChartPointDto>> GetGrowthChartAsync(
            int treeId, DateTime? from, DateTime? to, CancellationToken ct)
        {
            // Điểm từ ảnh (có HealthScore trong TreeImages)
            var pointsFromImages = _db.TreeImages.AsNoTracking()
                .Where(i => i.TreeId == treeId && i.UploadedAt != null);

            if (from.HasValue) pointsFromImages = pointsFromImages.Where(i => i.UploadedAt >= from.Value);
            if (to.HasValue) pointsFromImages = pointsFromImages.Where(i => i.UploadedAt <= to.Value);

            var imagesProjected = pointsFromImages
                .Select(i => new GrowthChartPointDto(
                    i.UploadedAt!.Value,
                    null,                  // Trees đã bỏ HeightMeters
                    i.HealthScore,         // dùng HealthScore từ ảnh (nếu có)
                    null
                ));

            // Điểm hiện tại: chỉ có TotalHarvestedKg ở Trees; Height/Health để null
            var latestPoint = _db.Trees.AsNoTracking()
                .Where(t => t.TreeId == treeId)
                .Select(t => new GrowthChartPointDto(
                    DateTime.UtcNow,
                    null,                  // HeightMeters đã bỏ
                    null,                  // HealthScore đã bỏ
                    t.TotalHarvestedKg
                ));

            return await imagesProjected
                .Concat(latestPoint)
                .OrderBy(p => p.When)
                .ToListAsync(ct);
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
    }
}
