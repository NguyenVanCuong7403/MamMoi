using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Infrastructure.Services
{
    public class TreeCommandService : ITreeCommandService
    {
        private readonly MamMoiDbContext _db;
        public TreeCommandService(MamMoiDbContext db) => _db = db;

        private Task<bool> IsGardenOwner(int userId, int gardenId, CancellationToken ct)
            => _db.Gardens.AnyAsync(g => g.GardenId == gardenId && g.UserId == userId, ct);

        public async Task<TreeCreatedDto> CreateAsync(int userId, CreateTreeRequest req, CancellationToken ct)
        {
            if (!await IsGardenOwner(userId, req.GardenId, ct))
                throw new UnauthorizedAccessException("User is not garden owner.");

            // Stage must belong to TreeType
            bool okStage = await _db.TreeGrowthStages
                .AnyAsync(s => s.StageId == req.StageId && s.TreeTypeId == req.TreeTypeId, ct);
            if (!okStage) throw new InvalidOperationException("Stage does not belong to TreeType.");

            // GardenSoil checks
            if (req.GardenSoilId.HasValue)
            {
                var soil = await _db.GardenSoils.FirstOrDefaultAsync(gs => gs.GardenSoilId == req.GardenSoilId, ct);
                var ttSoilId = await _db.TreeTypes.Where(t => t.TreeTypeId == req.TreeTypeId).Select(t => t.SoilMasterId).FirstAsync(ct);
                if (soil == null || soil.GardenId != req.GardenId || soil.SoilMasterId != ttSoilId)
                    throw new InvalidOperationException("GardenSoil does not match Garden/TreeType.");
            }

            var tree = new Tree
            {
                GardenId = req.GardenId,
                UserId = userId,
                TreeTypeId = req.TreeTypeId,
                StageId = req.StageId,
                TreeCode = req.TreeCode,
                TreeName = req.TreeName,
                PlantDate = req.PlantDate,
                HealthStatus = "Healthy",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                GardenSoilId = req.GardenSoilId
            };

            _db.Trees.Add(tree);
            await _db.SaveChangesAsync(ct);

            _db.ActivityLogs.Add(new ActivityLog
            {
                UserId = userId,
                TreeId = tree.TreeId,
                ActivityType = "CreateTree",
                ActivityDescription = $"Create {tree.TreeName ?? tree.TreeCode}",
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync(ct);

            return new TreeCreatedDto(tree.TreeId);
        }

        public async Task<TreeSummaryDto?> UpdateAsync(int userId, int treeId, UpdateTreeRequest req, CancellationToken ct)
        {
            var tree = await _db.Trees.FindAsync(new object?[] { treeId }, ct);
            if (tree == null) return null;
            if (!await IsGardenOwner(userId, tree.GardenId, ct)) throw new UnauthorizedAccessException();

            if (req.StageId.HasValue && req.StageId.Value != tree.StageId)
            {
                bool okStage = await _db.TreeGrowthStages
                    .AnyAsync(s => s.StageId == req.StageId && s.TreeTypeId == tree.TreeTypeId, ct);
                if (!okStage) throw new InvalidOperationException("Stage does not belong to TreeType.");
                tree.StageId = req.StageId.Value;
            }

            if (req.GardenSoilId.HasValue && req.GardenSoilId.Value != tree.GardenSoilId)
            {
                var ttSoilId = await _db.TreeTypes.Where(t => t.TreeTypeId == tree.TreeTypeId)
                    .Select(t => t.SoilMasterId).FirstAsync(ct);
                var soil = await _db.GardenSoils.FirstOrDefaultAsync(gs => gs.GardenSoilId == req.GardenSoilId, ct);
                if (soil == null || soil.GardenId != tree.GardenId || soil.SoilMasterId != ttSoilId)
                    throw new InvalidOperationException("GardenSoil does not match Garden/TreeType.");
                tree.GardenSoilId = req.GardenSoilId;
            }

            tree.TreeName = req.TreeName ?? tree.TreeName;
            tree.PlantDate = req.PlantDate ?? tree.PlantDate;
            tree.HeightMeters = req.HeightMeters ?? tree.HeightMeters;
            tree.HealthScore = req.HealthScore ?? tree.HealthScore;
            tree.HealthStatus = req.HealthStatus ?? tree.HealthStatus;
            tree.IsFruiting = req.IsFruiting ?? tree.IsFruiting;
            tree.IsActive = req.IsActive ?? tree.IsActive;
            tree.Notes = req.Notes ?? tree.Notes;
            tree.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);

            _db.ActivityLogs.Add(new ActivityLog
            {
                UserId = userId,
                TreeId = treeId,
                ActivityType = "UpdateTree",
                ActivityDescription = "Update tree information",
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync(ct);

            return new TreeSummaryDto(tree.TreeId, tree.TreeName, tree.TreeCode);
        }

        public async Task<bool> UpdateStatusAsync(int userId, int treeId, UpdateTreeStatusRequest req, CancellationToken ct)
        {
            var tree = await _db.Trees.FindAsync(new object?[] { treeId }, ct);
            if (tree == null) return false;
            if (!await IsGardenOwner(userId, tree.GardenId, ct)) throw new UnauthorizedAccessException();

            tree.HealthStatus = req.HealthStatus ?? tree.HealthStatus;
            tree.HealthScore = req.HealthScore ?? tree.HealthScore;
            tree.IsActive = req.IsActive ?? tree.IsActive;
            tree.IsFruiting = req.IsFruiting ?? tree.IsFruiting;
            tree.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);
            _db.ActivityLogs.Add(new ActivityLog
            {
                UserId = userId,
                TreeId = treeId,
                ActivityType = "UpdateStatus",
                ActivityDescription = "Status changed",
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync(ct);
            return true;
        }

        public async Task<bool> DeleteAsync(int userId, int treeId, CancellationToken ct)
        {
            var tree = await _db.Trees.FindAsync(new object?[] { treeId }, ct);
            if (tree == null) return false;
            if (!await IsGardenOwner(userId, tree.GardenId, ct)) throw new UnauthorizedAccessException();

            _db.Trees.Remove(tree);
            await _db.SaveChangesAsync(ct);
            return true;
        }
    }
}
