using MamMoi.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface ITreeCommandService
    {
        Task<TreeCreatedDto> CreateAsync(int userId, CreateTreeRequest req, CancellationToken ct);
        Task<TreeSummaryDto?> UpdateAsync(int userId, int treeId, UpdateTreeRequest req, CancellationToken ct);
        Task<bool> UpdateStatusAsync(int userId, int treeId, UpdateTreeStatusRequest req, CancellationToken ct);
        Task<TreeLifecycleDto?> UpdateLifecycleAsync(int userId, int treeId, UpdateTreeLifecycleRequest req, CancellationToken ct);
        Task<bool> DeleteAsync(int userId, int treeId, CancellationToken ct);
    }

    public interface ITreeImageService
    {
        Task<TreeImageDto> AddImageAsync(int userId, int treeId, UploadTreeImageRequest req, CancellationToken ct);
        Task<bool> DeleteImageAsync(int userId, int treeId, int imageId, CancellationToken ct);
        Task<IReadOnlyList<TreeImageDto>> GetGalleryAsync(int treeId, CancellationToken ct);
        Task<IReadOnlyList<GrowthHistoryItemDto>> GetGrowthHistoryAsync(int treeId, CancellationToken ct);
        Task<IReadOnlyList<GrowthChartPointDto>> GetGrowthChartAsync(int treeId, DateTime? from, DateTime? to, CancellationToken ct);
        Task<IReadOnlyList<GrowthStageDto>> GetStagesForTreeAsync(int treeId, CancellationToken ct);
    }
}
