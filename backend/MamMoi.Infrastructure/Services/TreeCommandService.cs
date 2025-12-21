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
        private readonly ISubscriptionPlanService _subscriptionPlanService;

        public TreeCommandService(MamMoiDbContext db, ISubscriptionPlanService subscriptionPlanService)
        {
            _db = db;
            _subscriptionPlanService = subscriptionPlanService;
        }

        private Task<bool> IsGardenOwner(int userId, int gardenId, CancellationToken ct)
            => _db.Gardens.AnyAsync(g => g.GardenId == gardenId && g.UserId == userId, ct);

        public async Task<TreeCreatedDto> CreateAsync(int userId, CreateTreeRequest req, CancellationToken ct)
        {
            if (!await IsGardenOwner(userId, req.GardenId, ct))
                throw new UnauthorizedAccessException("User is not garden owner.");

            // DEBUG: Log preMonths value received from request
            Console.WriteLine($"CreateAsync - req.preMonths = {req.preMonths}");

            // Kiểm tra giới hạn số cây mỗi vườn từ subscription plan
            var subscriptionPlan = await _subscriptionPlanService.GetCurrentUserSubscriptionAsync(userId);
            if (subscriptionPlan != null && subscriptionPlan.MaxTreesPerGarden.HasValue)
            {
                // Đếm số cây hiện tại trong vườn này
                var currentTreeCount = await _db.Trees
                    .CountAsync(t => t.GardenId == req.GardenId, ct);

                if (currentTreeCount >= subscriptionPlan.MaxTreesPerGarden.Value)
                {
                    throw new InvalidOperationException(
                        $"Bạn đã đạt giới hạn số cây cho phép mỗi vườn ({subscriptionPlan.MaxTreesPerGarden.Value} cây) theo gói đăng ký của bạn. " +
                        "Vui lòng nâng cấp gói để thêm cây vào vườn này.");
                }
            }

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
                if (soil == null || soil.GardenId != req.GardenId)
                    throw new InvalidOperationException("GardenSoil does not match Garden/TreeType.");
            }

            // Calculate tree's actual age from plantDate + preMonths
            int? virtualAgeForMismatch = null;
            if (req.PlantDate.HasValue)
            {
                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                var plantedAt = req.PlantDate.Value;
                var ageMonths = CalculateAgeInMonths(plantedAt, today);
                var preMonths = Math.Max(0, req.preMonths ?? 0);
                var totalRealAge = ageMonths + preMonths;

                // Get all stages for this tree type to determine expected stage
                var stages = await _db.TreeGrowthStages
                    .Where(s => s.TreeTypeId == req.TreeTypeId)
                    .OrderBy(s => s.StageOrder)
                    .ToListAsync(ct);

                if (stages.Count > 0)
                {
                    // Find the expected stage based on actual age
                    var expectedStage = ResolveStageForAge(stages, totalRealAge);

                    // Get the selected stage details
                    var selectedStage = stages.FirstOrDefault(s => s.StageId == req.StageId);

                    // If selected stage doesn't match expected stage, set VirtualAgeMonths
                    if (expectedStage != null && selectedStage != null && expectedStage.StageId != selectedStage.StageId)
                    {
                        // Calculate VirtualAgeMonths considering cycles
                        // Get stage 2 min age and last stage max age for cycle calculation
                        var secondStage = stages.Skip(1).FirstOrDefault();
                        var lastStage = stages.LastOrDefault();
                        var minCycleAge = secondStage?.MinAgeInMonths ?? 0;
                        var maxCycleAge = lastStage?.MaxAgeInMonths;
                        var selectedMinAge = selectedStage.MinAgeInMonths ?? 0;

                        // If total age exceeds the cycle range, account for completed cycles
                        if (maxCycleAge.HasValue && totalRealAge > maxCycleAge.Value && minCycleAge > 0)
                        {
                            int cycleLength = maxCycleAge.Value - minCycleAge;
                            if (cycleLength > 0)
                            {
                                // Calculate completed cycles
                                int ageAboveCycleStart = totalRealAge - minCycleAge;
                                int completedCycles = ageAboveCycleStart / cycleLength;

                                // Virtual age = selected stage min + (cycles * cycle length)
                                virtualAgeForMismatch = selectedMinAge + (completedCycles * cycleLength);
                            }
                            else
                            {
                                virtualAgeForMismatch = selectedMinAge;
                            }
                        }
                        else
                        {
                            // No cycling needed, just use the stage's min age
                            virtualAgeForMismatch = selectedMinAge;
                        }
                    }
                }
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
                preMonths = req.preMonths,
                VirtualAgeMonths = virtualAgeForMismatch, // Set virtual age if stage doesn't match real age
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

            // Kiểm tra khóa chỉnh sửa sau 14 ngày kể từ ngày tạo cây
            const int LOCK_DAYS = 14;
            var daysSinceCreated = (DateTime.UtcNow - tree.CreatedAt).TotalDays;
            var isLocked = daysSinceCreated >= LOCK_DAYS;

            // Các trường cơ bản không được chỉnh sửa sau 14 ngày
            if (isLocked)
            {
                if (req.TreeName != null && req.TreeName != tree.TreeName)
                    throw new InvalidOperationException($"Không thể chỉnh sửa tên cây sau {LOCK_DAYS} ngày kể từ ngày tạo cây.");

                if (req.TreeCode != null && req.TreeCode != tree.TreeCode)
                    throw new InvalidOperationException($"Không thể chỉnh sửa mã cây sau {LOCK_DAYS} ngày kể từ ngày tạo cây.");

                if (req.PlantDate.HasValue && req.PlantDate != tree.PlantDate)
                    throw new InvalidOperationException($"Không thể chỉnh sửa ngày trồng sau {LOCK_DAYS} ngày kể từ ngày tạo cây.");

                if (req.preMonths.HasValue && req.preMonths != tree.preMonths)
                    throw new InvalidOperationException($"Không thể chỉnh sửa tuổi trước khi trồng sau {LOCK_DAYS} ngày kể từ ngày tạo cây.");
            }

            // Track if age-related fields changed (for auto lifecycle sync)
            bool ageChanged = false;
            var oldPlantDate = tree.PlantDate;
            var oldPreMonths = tree.preMonths;

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

                    // Khi cập nhật stage thủ công, đặt VirtualAgeMonths = MinAgeInMonths của stage (nếu có)
                    var targetStage = await _db.TreeGrowthStages
                        .FirstOrDefaultAsync(s => s.StageId == realStageId && s.TreeTypeId == tree.TreeTypeId, ct);
                    if (targetStage != null)
                    {
                        int? minAge = targetStage.MinAgeInMonths;
                        // If the specific stage has no MinAge, try to find the minimum MinAge among stages
                        if (!minAge.HasValue)
                        {
                            minAge = await _db.TreeGrowthStages
                                .Where(s => s.TreeTypeId == tree.TreeTypeId && s.StageOrder == targetStage.StageOrder && s.MinAgeInMonths.HasValue)
                                .MinAsync(s => (int?)s.MinAgeInMonths, ct);
                        }

                        if (minAge.HasValue)
                        {
                            // Calculate tree's total real age to determine which cycle it's in
                            int totalRealAge = 0;
                            if (tree.PlantDate.HasValue)
                            {
                                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                                var plantAgeMonths = CalculateAgeInMonths(tree.PlantDate.Value, today);
                                var preMonths = Math.Max(0, tree.preMonths ?? 0);
                                totalRealAge = plantAgeMonths + preMonths;
                            }

                            // Get cycle info
                            var allStages = await _db.TreeGrowthStages
                                .Where(s => s.TreeTypeId == tree.TreeTypeId)
                                .OrderBy(s => s.StageOrder)
                                .ToListAsync(ct);

                            var secondStage = allStages.Skip(1).FirstOrDefault();
                            var lastStage = allStages.LastOrDefault();
                            var minCycleAge = secondStage?.MinAgeInMonths ?? 0;
                            var maxCycleAge = lastStage?.MaxAgeInMonths;

                            // If tree age exceeds cycle range, account for completed cycles
                            if (maxCycleAge.HasValue && totalRealAge > maxCycleAge.Value && minCycleAge > 0)
                            {
                                int cycleLength = maxCycleAge.Value - minCycleAge;
                                if (cycleLength > 0)
                                {
                                    int ageAboveCycleStart = totalRealAge - minCycleAge;
                                    int completedCycles = ageAboveCycleStart / cycleLength;

                                    // Virtual age = stage min + (cycles * cycle length)
                                    tree.VirtualAgeMonths = minAge.Value + (completedCycles * cycleLength);
                                }
                                else
                                {
                                    tree.VirtualAgeMonths = minAge.Value;
                                }
                            }
                            else
                            {
                                tree.VirtualAgeMonths = minAge.Value;
                            }
                            // Đánh dấu ageChanged để trigger auto-sync lifecycle ở phần sau
                            ageChanged = true;
                        }
                    }
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

            // Check if age-related fields changed
            if (req.PlantDate.HasValue && req.PlantDate != oldPlantDate)
            {
                ageChanged = true;
                // Clear VirtualAgeMonths when user changes plant date (real age takes priority)
                if (tree.VirtualAgeMonths.HasValue)
                {
                    tree.VirtualAgeMonths = null;
                }
            }
            if (req.preMonths.HasValue && req.preMonths != oldPreMonths)
            {
                ageChanged = true;
                // Clear VirtualAgeMonths when user changes pre-nursery age (real age takes priority)
                if (tree.VirtualAgeMonths.HasValue)
                {
                    tree.VirtualAgeMonths = null;
                }
            }

            // cập nhật 4 trạng thái nếu FE gửi và lưu lịch sử thay đổi
            if (req.LeafStatus != null && req.LeafStatus != tree.LeafStatus)
            {
                _db.TreeStatusHistories.Add(new TreeStatusHistory
                {
                    TreeId = tree.TreeId,
                    UserId = userId,
                    StatusField = "LeafStatus",
                    OldValue = tree.LeafStatus,
                    NewValue = req.LeafStatus,
                    ChangedAt = DateTime.UtcNow
                });
                tree.LeafStatus = req.LeafStatus;
            }

            if (req.BranchStatus != null && req.BranchStatus != tree.BranchStatus)
            {
                _db.TreeStatusHistories.Add(new TreeStatusHistory
                {
                    TreeId = tree.TreeId,
                    UserId = userId,
                    StatusField = "BranchStatus",
                    OldValue = tree.BranchStatus,
                    NewValue = req.BranchStatus,
                    ChangedAt = DateTime.UtcNow
                });
                tree.BranchStatus = req.BranchStatus;
            }

            if (req.FlowerStatus != null && req.FlowerStatus != tree.FlowerStatus)
            {
                _db.TreeStatusHistories.Add(new TreeStatusHistory
                {
                    TreeId = tree.TreeId,
                    UserId = userId,
                    StatusField = "FlowerStatus",
                    OldValue = tree.FlowerStatus,
                    NewValue = req.FlowerStatus,
                    ChangedAt = DateTime.UtcNow
                });
                tree.FlowerStatus = req.FlowerStatus;
            }

            if (req.FruitStatus != null && req.FruitStatus != tree.FruitStatus)
            {
                _db.TreeStatusHistories.Add(new TreeStatusHistory
                {
                    TreeId = tree.TreeId,
                    UserId = userId,
                    StatusField = "FruitStatus",
                    OldValue = tree.FruitStatus,
                    NewValue = req.FruitStatus,
                    ChangedAt = DateTime.UtcNow
                });
                tree.FruitStatus = req.FruitStatus;
            }

            tree.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);

            // Auto-sync lifecycle if age changed and auto lifecycle is enabled
            if (ageChanged && tree.LifecycleAutoEnabled && tree.PlantDate.HasValue)
            {
                try
                {
                    await SyncLifecycleForTreeAsync(tree, ct);
                }
                catch (Exception ex)
                {
                    // Log but don't fail the update
                    Console.WriteLine($"Failed to auto-sync lifecycle for tree {treeId}: {ex.Message}");
                }
            }

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

        // Helper method to sync lifecycle for a single tree
        private async Task SyncLifecycleForTreeAsync(Tree tree, CancellationToken ct)
        {
            if (!tree.PlantDate.HasValue) return;

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var stages = await _db.TreeGrowthStages
                .Where(s => s.TreeTypeId == tree.TreeTypeId)
                .OrderBy(s => s.StageOrder)
                .ToListAsync(ct);

            if (stages.Count == 0) return;

            // Calculate total age
            var ageMonths = CalculateAgeInMonths(tree.PlantDate.Value, today);
            var extraMonths = Math.Max(0, tree.preMonths ?? 0);
            var realAge = ageMonths + extraMonths;
            var virtualAge = Math.Max(0, tree.VirtualAgeMonths ?? 0);
            var totalAge = Math.Max(realAge, virtualAge);

            // Find the appropriate stage based on age
            var expectedStage = ResolveStageForAge(stages, totalAge);
            if (expectedStage != null && expectedStage.StageId != tree.StageId)
            {
                tree.StageId = expectedStage.StageId;
                tree.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync(ct);
            }
        }

        private static int CalculateAgeInMonths(DateOnly plantedAt, DateOnly today)
        {
            var months = (today.Year - plantedAt.Year) * 12 + (today.Month - plantedAt.Month);
            if (today.Day < plantedAt.Day)
            {
                months--;
            }
            return Math.Max(0, months);
        }

        private static TreeGrowthStage? ResolveStageForAge(IReadOnlyList<TreeGrowthStage> stages, int totalAgeMonths)
        {
            if (stages == null || stages.Count == 0) return null;

            var sortedStages = stages.OrderBy(s => s.StageOrder).ToList();
            
            // Get the second stage (flowering) min age for cycling - stage 1 (growth_development) only happens once
            // Cycling happens between stage 2 and last stage
            var secondStage = sortedStages.Skip(1).FirstOrDefault();
            var minCycleAge = secondStage?.MinAgeInMonths ?? (sortedStages.FirstOrDefault()?.MinAgeInMonths ?? 0);
            
            // Get the last stage max age for cycling calculation
            var lastStage = sortedStages.LastOrDefault();
            var maxCycleAge = lastStage?.MaxAgeInMonths;
            
            // Apply cycling logic if totalAge exceeds the last stage's max age
            int effectiveAge = totalAgeMonths;
            if (maxCycleAge.HasValue && totalAgeMonths > maxCycleAge.Value)
            {
                // Calculate cycle length (from stage 2 min to last stage max)
                // Stage 1 is excluded from cycling as it only happens once
                int cycleLength = maxCycleAge.Value - minCycleAge;
                if (cycleLength > 0)
                {
                    // Calculate how many complete cycles have passed since entering stage 2
                    int ageAboveCycleStart = totalAgeMonths - minCycleAge;
                    int completeCycles = ageAboveCycleStart / cycleLength;
                    
                    // Calculate the effective age within the current cycle
                    // Formula: totalAge - (cycleLength * multiplier)
                    effectiveAge = totalAgeMonths - (cycleLength * completeCycles);
                    
                    // Ensure effectiveAge is at least minCycleAge (stage 2 min)
                    if (effectiveAge < minCycleAge)
                    {
                        effectiveAge = minCycleAge;
                    }
                }
            }

            // Find the appropriate stage for the effective age
            foreach (var stage in sortedStages)
            {
                var min = stage.MinAgeInMonths ?? int.MinValue;
                var max = stage.MaxAgeInMonths ?? int.MaxValue;

                // For inclusive ranges: age >= min AND age <= max
                if (effectiveAge >= min && (max == int.MaxValue || effectiveAge <= max))
                {
                    return stage;
                }
            }

            // Fallback to last stage if no match found
            return sortedStages.LastOrDefault();
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

            // Logging chi tiết để debug việc cập nhật lifecycle
            Console.WriteLine(
                $"[UpdateLifecycleAsync] START userId={userId}, treeId={treeId}, " +
                $"req.PhaseId={req.PhaseId}, req.StageId={req.StageId}, req.CycleCount={req.CycleCount}, " +
                $"req.Phase1Completed={req.Phase1Completed}, req.AutoSyncEnabled={req.AutoSyncEnabled}, " +
                $"current StageId={tree.StageId}, current CycleCount={tree.CycleCount}, " +
                $"LifecycleAutoEnabled={tree.LifecycleAutoEnabled}, LifecycleAutoDisabledAt={tree.LifecycleAutoDisabledAt}"
            );

            string normalizedPhaseId = NormalizePhaseKey(req.PhaseId);
            TreeGrowthStage? targetStage;
            int targetStageOrder;

            if (req.StageId.HasValue)
            {
                targetStage = await _db.TreeGrowthStages
                    .FirstOrDefaultAsync(s => s.StageId == req.StageId.Value, ct);

                if (targetStage == null)
                    throw new InvalidOperationException($"Stage {req.StageId.Value} not found.");
                if (targetStage.TreeTypeId != tree.TreeTypeId)
                    throw new InvalidOperationException("Stage does not belong to TreeType.");

                targetStageOrder = targetStage.StageOrder;
                if (string.IsNullOrWhiteSpace(normalizedPhaseId))
                {
                    normalizedPhaseId = StageOrderToPhaseId(targetStageOrder);
                }
            }
            else
            {
                if (string.IsNullOrWhiteSpace(normalizedPhaseId))
                    throw new ArgumentException("Either PhaseId or StageId must be provided.");

                targetStageOrder = PhaseIdToStageOrder(normalizedPhaseId);
                targetStage = await _db.TreeGrowthStages
                    .FirstOrDefaultAsync(s => s.TreeTypeId == tree.TreeTypeId && s.StageOrder == targetStageOrder, ct);
            }

            if (targetStage == null)
                throw new InvalidOperationException($"TreeType {tree.TreeTypeId} does not have a stage with StageOrder {targetStageOrder}.");

            // Update tree stage
            tree.StageId = targetStage.StageId;
            var now = DateTime.UtcNow;
            tree.UpdatedAt = now;

            if (req.AutoSyncEnabled.HasValue)
            {
                tree.LifecycleAutoEnabled = req.AutoSyncEnabled.Value;
                tree.LifecycleAutoDisabledAt = req.AutoSyncEnabled.Value ? null : now;
            }

            // Manage VirtualAgeMonths: when auto-sync is re-enabled, clear manual virtual age.
            // When user manually updates stage (via StageId or PhaseId) and auto-sync remains disabled,
            // set VirtualAgeMonths to the stage's minimum age (if available) or to explicitly provided value.
            if (req.AutoSyncEnabled.HasValue && req.AutoSyncEnabled.Value)
            {
                // Auto-sync enabled -> remove any manual virtual age overrides
                tree.VirtualAgeMonths = null;
            }
            else
            {
                // If user provided a stage/phase explicitly, update the virtual age accordingly
                if (req.StageId.HasValue || !string.IsNullOrWhiteSpace(req.PhaseId))
                {
                    int? minAge = targetStage.MinAgeInMonths;
                    if (!minAge.HasValue)
                    {
                        minAge = await _db.TreeGrowthStages
                            .Where(s => s.TreeTypeId == tree.TreeTypeId && s.StageOrder == targetStage.StageOrder && s.MinAgeInMonths.HasValue)
                            .MinAsync(s => (int?)s.MinAgeInMonths, ct);
                    }

                    if (minAge.HasValue)
                    {
                        // Calculate tree's total real age to determine which cycle it's in
                        int totalRealAge = 0;
                        if (tree.PlantDate.HasValue)
                        {
                            var today = DateOnly.FromDateTime(DateTime.UtcNow);
                            var ageMonths = CalculateAgeInMonths(tree.PlantDate.Value, today);
                            var preMonths = Math.Max(0, tree.preMonths ?? 0);
                            totalRealAge = ageMonths + preMonths;
                        }

                        // Get cycle info
                        var stages = await _db.TreeGrowthStages
                            .Where(s => s.TreeTypeId == tree.TreeTypeId)
                            .OrderBy(s => s.StageOrder)
                            .ToListAsync(ct);

                        var secondStage = stages.Skip(1).FirstOrDefault();
                        var lastStage = stages.LastOrDefault();
                        var minCycleAge = secondStage?.MinAgeInMonths ?? 0;
                        var maxCycleAge = lastStage?.MaxAgeInMonths;

                        // If tree age exceeds cycle range, account for completed cycles
                        if (maxCycleAge.HasValue && totalRealAge > maxCycleAge.Value && minCycleAge > 0)
                        {
                            int cycleLength = maxCycleAge.Value - minCycleAge;
                            if (cycleLength > 0)
                            {
                                int ageAboveCycleStart = totalRealAge - minCycleAge;
                                int completedCycles = ageAboveCycleStart / cycleLength;

                                // Virtual age = stage min + (cycles * cycle length)
                                tree.VirtualAgeMonths = minAge.Value + (completedCycles * cycleLength);
                            }
                            else
                            {
                                tree.VirtualAgeMonths = minAge.Value;
                            }
                        }
                        else
                        {
                            tree.VirtualAgeMonths = minAge.Value;
                        }
                    }
                    else if (req is { } && ((dynamic)req).VirtualAgeMonths is int v)
                    {
                        tree.VirtualAgeMonths = v;
                    }
                }
                else if (req is { } && ((dynamic)req).VirtualAgeMonths is int provided)
                {
                    // User explicitly provided VirtualAgeMonths without changing stage
                    tree.VirtualAgeMonths = provided;
                }
            }

            // Update CycleCount BEFORE SaveChangesAsync so it persists to database
            if (req.CycleCount.HasValue)
            {
                tree.CycleCount = req.CycleCount.Value;
            }

            await _db.SaveChangesAsync(ct);

            // Log activity
            _db.ActivityLogs.Add(new ActivityLog
            {
                UserId = userId,
                TreeId = treeId,
                ActivityType = "UpdateLifecycle",
                ActivityDescription = BuildLifecycleActivityDescription(req, targetStage.StageName),
                CreatedAt = now
            });
            await _db.SaveChangesAsync(ct);

            // Determine phase1Completed: true if not in growth_development
            bool phase1Completed = req.Phase1Completed ?? (targetStageOrder > 1);

            var finalCycleCount = tree.CycleCount;

            Console.WriteLine(
                $"[UpdateLifecycleAsync] AFTER APPLY treeId={treeId}, " +
                $"new StageId={tree.StageId}, targetStageOrder={targetStageOrder}, " +
                $"phaseId={normalizedPhaseId}, phase1Completed={phase1Completed}, " +
                $"finalCycleCount={finalCycleCount}, " +
                $"LifecycleAutoEnabled={tree.LifecycleAutoEnabled}, LifecycleAutoDisabledAt={tree.LifecycleAutoDisabledAt}"
            );

            // Return DTO with lifecycle information
            return new TreeLifecycleDto(
                tree.TreeId,
                targetStage.StageId,
                targetStage.StageOrder,
                targetStage.StageName,
                normalizedPhaseId,
                phase1Completed,
                finalCycleCount,
                tree.LifecycleAutoEnabled,
                tree.LifecycleAutoDisabledAt,
                tree.VirtualAgeMonths
            );
        }

        private static string NormalizePhaseKey(string? phaseId)
            => string.IsNullOrWhiteSpace(phaseId)
                ? string.Empty
                : phaseId.Trim().ToLowerInvariant();

        private static int PhaseIdToStageOrder(string phaseId) => phaseId switch
        {
            "growth_development" => 1,
            "flowering" => 2,
            "fruiting" => 3,
            "pre_harvest" => 4,
            "post_harvest" => 5,
            _ => throw new ArgumentException($"Invalid phaseId: {phaseId}. Must be one of: growth_development, flowering, fruiting, pre_harvest, post_harvest")
        };

        private static string StageOrderToPhaseId(int stageOrder) => stageOrder switch
        {
            1 => "growth_development",
            2 => "flowering",
            3 => "fruiting",
            4 => "pre_harvest",
            5 => "post_harvest",
            _ => "growth_development"
        };

        private static string BuildLifecycleActivityDescription(UpdateTreeLifecycleRequest req, string stageName)
        {
            var baseMessage = $"Updated lifecycle phase to {req.PhaseId} (Stage: {stageName})";

            if (req.AutoSyncEnabled.HasValue)
            {
                var togglePart = req.AutoSyncEnabled.Value ? "Auto-sync enabled" : "Auto-sync disabled";
                if (!string.IsNullOrWhiteSpace(req.OverrideReason))
                {
                    return $"{baseMessage}. {togglePart}. Reason: {req.OverrideReason}";
                }
                return $"{baseMessage}. {togglePart}.";
            }

            return baseMessage;
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
