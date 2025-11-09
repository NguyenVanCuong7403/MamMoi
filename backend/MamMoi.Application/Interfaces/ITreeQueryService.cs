using MamMoi.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;              // 👈 thêm dòng này


namespace MamMoi.Application.Interfaces
{
    public interface ITreeQueryService
    {
        Task<PagedResult<TreeListItemDto>> GetMyTreesAsync(
            int currentUserId,
            int page = 1,
            int pageSize = 20,
            string? sort = "createdAt_desc",
            int? gardenId = null,
            int? treeTypeId = null,
            bool? isActive = null,
            CancellationToken ct = default);

        Task<PagedResult<TreeListItemDto>> SearchAsync(
            string query,
            int? gardenId,
            int? treeTypeId,
            int page = 1,
            int pageSize = 20,
            CancellationToken ct = default);

        Task<TreeDetailDto?> GetDetailAsync(int treeId, int? currentUserId, CancellationToken ct = default);
    }
}
