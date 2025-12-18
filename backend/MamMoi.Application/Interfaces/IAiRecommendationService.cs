using MamMoi.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces
{
    public interface IAiRecommendationService
    {
        Task<AirecommendationDto> GenerateRecommendationForTreeAsync(
            int treeId,
            DateOnly forDate,
            CancellationToken ct = default);


        /// <summary>
        /// Get or generate recommendation for a single day
        /// </summary>
        Task<AirecommendationDto> GetSingleDayRecommendationAsync(
            int treeId,
            DateOnly forDate,
            CancellationToken ct = default);

        /// <summary>
        /// Refresh recommendations for a tree (delete old ones for today+2 days and regenerate)
        /// </summary>
        Task RefreshRecommendationsAsync(int treeId, CancellationToken ct = default);

        /// <summary>
        /// Cleanup past recommendations (before today) to prevent database bloat
        /// </summary>
        Task CleanupPastRecommendationsAsync(int treeId, CancellationToken ct = default);
    }
}
