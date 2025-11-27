using System.Threading;
using System.Threading.Tasks;

namespace MamMoi.Application.Interfaces;

public interface ITreeLifecycleAutomationService
{
    /// <summary>
    /// Synchronize tree lifecycle stages based on configured growth windows.
    /// Returns the number of trees that were updated automatically.
    /// </summary>
    Task<int> SyncLifecycleStagesAsync(CancellationToken ct = default);
}

