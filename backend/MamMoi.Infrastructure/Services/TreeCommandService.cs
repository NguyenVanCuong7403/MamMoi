// Infrastructure/Services/TreeCommandService.cs
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

            // Stage phải thuộc TreeType
            bool okStage = await _db.TreeGrowthStages
                .AnyAsync(s => s.StageId == req.StageId && s.TreeTypeId == req.TreeTypeId, ct);
            if (!okStage) throw new InvalidOperationException("Stage does not belong to TreeType.");

            // GardenSoil (nếu truyền) phải thuộc đúng Garden và đúng SoilMaster của TreeType
            if (req.GardenSoilId.HasValue)
            {
                var soil = await _db.GardenSoils.FirstOrDefaultAsync(gs => gs.GardenSoilId == req.GardenSoilId, ct);
                var ttSoilId = await _db.TreeTypes.Where(t => t.TreeTypeId == req.TreeTypeId)
                                  .Select(t => t.SoilMasterId).FirstAsync(ct);
                if (soil == null || soil.GardenId != req.GardenId || soil.SoilMasterId != ttSoilId)
                    throw new InvalidOperationException("GardenSoil does not match Garden/TreeType.");
            }

            var tree = new Tree
            {
                GardenId = req.GardenId,
                UserId = userId,
                TreeTypeId = req.TreeTypeId,
                VarietyId = req.TreeVarietyId,
                StageId = req.StageId,
                TreeCode = string.IsNullOrWhiteSpace(req.TreeCode) ? null : req.TreeCode,
                TreeName = req.TreeName,
                PlantDate = req.PlantDate,
                GardenSoilId = req.GardenSoilId,
                Location = req.Location,
                Notes = req.Notes,
                // trạng thái mặc định nếu FE không gửi
                LeafStatus = string.IsNullOrWhiteSpace(req.LeafStatus) ? "Bình thường" : req.LeafStatus,
                BranchStatus = string.IsNullOrWhiteSpace(req.BranchStatus) ? "Bình thường" : req.BranchStatus,
                FlowerStatus = string.IsNullOrWhiteSpace(req.FlowerStatus) ? "Bình thường" : req.FlowerStatus,
                FruitStatus = string.IsNullOrWhiteSpace(req.FruitStatus) ? "Bình thường" : req.FruitStatus,
                IsActive = req.IsActive ?? true,
                IsFruiting = req.IsFruiting ?? false,
                CreatedAt = DateTime.UtcNow
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
                var minStageId = await _db.TreeGrowthStages
        .Where(s => s.TreeTypeId == tree.TreeTypeId)
        .MinAsync(s => (int?)s.StageId, ct);
                if (minStageId is null)
                    throw new InvalidOperationException(
                        $"TreeType {tree.TreeTypeId} does not have any stages configured."
                    );
                var realStageId = minStageId.Value + (req.StageId.Value - 1);
                if (realStageId != tree.StageId)
                {
                    // 4) Đảm bảo stage này thuộc đúng TreeType
                    bool okStage = await _db.TreeGrowthStages
                        .AnyAsync(s => s.StageId == realStageId && s.TreeTypeId == tree.TreeTypeId, ct);

                    if (!okStage)
                        throw new InvalidOperationException("Stage does not belong to TreeType.");

                    // 5) Gán StageId thực vào entity
                    tree.StageId = realStageId;
                }
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
            tree.TreeCode = req.TreeCode ?? tree.TreeCode;
            tree.PlantDate = req.PlantDate ?? tree.PlantDate;
            tree.Location = req.Location ?? tree.Location;
            tree.IsFruiting = req.IsFruiting ?? tree.IsFruiting;
            tree.IsActive = req.IsActive ?? tree.IsActive;
            tree.ExpectedHarvestDate = req.ExpectedHarvestDate ?? tree.ExpectedHarvestDate;
            tree.Notes = req.Notes ?? tree.Notes;
            tree.preMonths = req.preMonths ?? tree.preMonths;

            // cập nhật 4 trạng thái nếu FE gửi
            tree.LeafStatus = req.LeafStatus ?? tree.LeafStatus;
            tree.BranchStatus = req.BranchStatus ?? tree.BranchStatus;
            tree.FlowerStatus = req.FlowerStatus ?? tree.FlowerStatus;
            tree.FruitStatus = req.FruitStatus ?? tree.FruitStatus;

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

            // thay HealthStatus bằng 4 trạng thái chi tiết
            tree.LeafStatus = req.LeafStatus ?? tree.LeafStatus;
            tree.BranchStatus = req.BranchStatus ?? tree.BranchStatus;
            tree.FlowerStatus = req.FlowerStatus ?? tree.FlowerStatus;
            tree.FruitStatus = req.FruitStatus ?? tree.FruitStatus;

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

        public async Task<TreeLifecycleDto?> UpdateLifecycleAsync(int userId, int treeId, UpdateTreeLifecycleRequest req, CancellationToken ct)
        {
            var tree = await _db.Trees
                .Include(t => t.Stage)
                .FirstOrDefaultAsync(t => t.TreeId == treeId, ct);
            
            if (tree == null) return null;
            if (!await IsGardenOwner(userId, tree.GardenId, ct)) 
                throw new UnauthorizedAccessException("User is not garden owner.");

            // Map phaseId to stageOrder (1-5)
            // growth_development -> 1, flowering -> 2, fruiting -> 3, pre_harvest -> 4, post_harvest -> 5
            int targetStageOrder = req.PhaseId.ToLower() switch
            {
                "growth_development" => 1,
                "flowering" => 2,
                "fruiting" => 3,
                "pre_harvest" => 4,
                "post_harvest" => 5,
                _ => throw new ArgumentException($"Invalid phaseId: {req.PhaseId}. Must be one of: growth_development, flowering, fruiting, pre_harvest, post_harvest")
            };

            // Find the actual StageId for this TreeType with the target StageOrder
            var targetStage = await _db.TreeGrowthStages
                .FirstOrDefaultAsync(s => s.TreeTypeId == tree.TreeTypeId && s.StageOrder == targetStageOrder, ct);

            if (targetStage == null)
                throw new InvalidOperationException($"TreeType {tree.TreeTypeId} does not have a stage with StageOrder {targetStageOrder}.");

            // Update tree stage
            tree.StageId = targetStage.StageId;
            tree.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);

            // Log activity
            _db.ActivityLogs.Add(new ActivityLog
            {
                UserId = userId,
                TreeId = treeId,
                ActivityType = "UpdateLifecycle",
                ActivityDescription = $"Updated lifecycle phase to {req.PhaseId} (Stage: {targetStage.StageName})",
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync(ct);

            // Determine phase1Completed: true if not in growth_development
            bool phase1Completed = req.Phase1Completed ?? (targetStageOrder > 1);

            // Return DTO with lifecycle information
            return new TreeLifecycleDto(
                tree.TreeId,
                targetStage.StageId,
                targetStage.StageOrder,
                targetStage.StageName,
                req.PhaseId,
                phase1Completed,
                req.CycleCount ?? 0 // TODO: Store cycleCount in database if needed
            );
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
