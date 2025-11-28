using MamMoi.Application.DTOs.Admin;

namespace MamMoi.Application.Interfaces;

/// <summary>
/// Service interface for farmers to access soil masters (read-only)
/// </summary>
public interface ISoilMasterService
{
    /// <summary>
    /// Get all soil masters (for farmers to select when creating gardens)
    /// </summary>
    Task<IReadOnlyList<SoilMasterListItemDto>> GetAllAsync(CancellationToken ct = default);
}

