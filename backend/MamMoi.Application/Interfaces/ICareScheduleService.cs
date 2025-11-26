using MamMoi.Application.DTOs;
using MamMoi.Application.DTOs.CareSchedule;

namespace MamMoi.Application.Interfaces;

/// <summary>
/// Interface for Care Schedule/Task service
/// </summary>
public interface ICareScheduleService
{
    /// <summary>
    /// Create a new care task
    /// </summary>
    Task<CareTaskDetailDto> CreateCareTaskAsync(CreateCareTaskDto dto);

    /// <summary>
    /// Get care task detail by ID
    /// </summary>
    Task<CareTaskDetailDto?> GetTaskDetailAsync(int scheduleId);

    /// <summary>
    /// Edit existing care task
    /// </summary>
    Task<bool> EditCareTaskAsync(int scheduleId, EditCareTaskDto dto);

    /// <summary>
    /// Delete care task by ID
    /// </summary>
    Task<bool> DeleteCareTaskAsync(int scheduleId);

    /// <summary>
    /// Mark task as complete
    /// </summary>
    Task<bool> MarkTaskAsCompleteAsync(int scheduleId, int userId, MarkTaskCompleteDto dto);

    /// <summary>
    /// Get all tasks for today
    /// </summary>
    Task<List<CareTaskListItemDto>> GetTodayTasksAsync(int? treeId = null);

    /// <summary>
    /// Search care tasks with filters and pagination
    /// </summary>
    Task<PagedResult<CareTaskSearchResultDto>> SearchTasksAsync(
        int? treeId = null,
        int? gardenId = null,
        string? taskType = null,
        string? status = null,
        string? priority = null,
        DateOnly? dateFrom = null,
        DateOnly? dateTo = null,
        string? searchKeyword = null,
        int pageNumber = 1,
        int pageSize = 10);

    /// <summary>
    /// Get all tasks for a specific tree
    /// </summary>
    Task<List<CareTaskDetailDto>> GetTasksByTreeAsync(int treeId);

    /// <summary>
    /// Get all pending tasks
    /// </summary>
    Task<List<CareTaskListItemDto>> GetPendingTasksAsync();

    /// <summary>
    /// Check if task exists
    /// </summary>
    Task<bool> TaskExistsAsync(int scheduleId);
}
