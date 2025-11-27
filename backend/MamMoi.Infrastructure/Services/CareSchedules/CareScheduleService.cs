using System;
using System.Text.RegularExpressions;
using MamMoi.Application.DTOs;
using MamMoi.Application.DTOs.CareSchedule;
using MamMoi.Application.Interfaces;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using CareScheduleEntity = MamMoi.Infrastructure.Models.CareSchedule;

namespace MamMoi.Infrastructure.Services.CareSchedules;

/// <summary>
/// Care Schedule service - xử lý business logic cho Care Tasks
/// </summary>
public class CareScheduleService : ICareScheduleService
{
    private readonly IUserRepository _userRepository;
    private readonly MamMoiDbContext _dbContext;

    private const int MaxTaskNameLength = 200;
    private const int MaxDescriptionLength = 1000;
    private const int MaxNotesLength = 1000;
    private const int MaxCompletionNotesLength = 1000;
    private const decimal MaxWaterAmountLiters = 9999.99m;
    private const int MaxFertilizerAmountGrams = 999999;

    private static readonly string[] ValidTaskTypes =
    {
        "Watering", "Fertilizing", "Pruning", "Pest Control",
        "Disease Treatment", "Harvesting", "Mulching", "Inspection"
    };

    private static readonly string[] ValidStatuses =
    {
        "Pending", "InProgress", "Completed", "Cancelled", "Postponed"
    };

    private static readonly string[] ValidPriorities =
    {
        "Low", "Medium", "High", "Critical"
    };

    private static readonly string[] ValidTimeOfDay =
    {
        "Morning", "Afternoon", "Evening", "Night"
    };

    private static readonly string[] ValidWaterSources =
    {
        "Tap", "Rain", "Well", "Recycled", "Other"
    };

    private static readonly string[] ValidRecurrencePatterns =
    {
        "Daily", "Weekly", "BiWeekly", "Monthly", "Quarterly", "Yearly", "None"
    };

    public CareScheduleService(
        IUserRepository userRepository,
        MamMoiDbContext dbContext)
    {
        _userRepository = userRepository;
        _dbContext = dbContext;
    }    /// <summary>
         /// Create a new care task with comprehensive validation
         /// </summary>
    public async Task<CareTaskDetailDto> CreateCareTaskAsync(CreateCareTaskDto dto)
    {
        // Validate TreeId
        if (dto.TreeId <= 0)
            throw new ArgumentException("Invalid TreeId");

        var tree = await _dbContext.Trees.FirstOrDefaultAsync(t => t.TreeId == dto.TreeId);
        if (tree == null)
            throw new InvalidOperationException("Tree not found");

        // Validate TaskType
        if (string.IsNullOrWhiteSpace(dto.TaskType))
            throw new ArgumentException("TaskType is required");

        dto.TaskType = dto.TaskType.Trim();
        if (!ValidTaskTypes.Contains(dto.TaskType))
            throw new ArgumentException($"Invalid TaskType. Valid options: {string.Join(", ", ValidTaskTypes)}");

        // Validate TaskName
        if (string.IsNullOrWhiteSpace(dto.TaskName))
            throw new ArgumentException("TaskName is required");

        dto.TaskName = dto.TaskName.Trim();
        if (dto.TaskName.Length > MaxTaskNameLength)
            throw new ArgumentException($"TaskName cannot exceed {MaxTaskNameLength} characters");

        // Validate Description
        if (!string.IsNullOrWhiteSpace(dto.Description))
        {
            dto.Description = dto.Description.Trim();
            if (dto.Description.Length > MaxDescriptionLength)
                throw new ArgumentException($"Description cannot exceed {MaxDescriptionLength} characters");
        }

        // Validate ScheduledDate
        DateOnly? scheduledDate = null;
        if (!string.IsNullOrWhiteSpace(dto.ScheduledDate))
        {
            if (!DateOnly.TryParse(dto.ScheduledDate, out var parsed))
                throw new ArgumentException("Invalid date format. Use YYYY-MM-DD");

            if (parsed < DateOnly.FromDateTime(DateTime.Now))
                throw new ArgumentException("Scheduled date cannot be in the past");

            scheduledDate = parsed;
        }

        // Validate ScheduledTimeOfDay
        if (!string.IsNullOrWhiteSpace(dto.ScheduledTimeOfDay))
        {
            dto.ScheduledTimeOfDay = dto.ScheduledTimeOfDay.Trim();
            if (!ValidTimeOfDay.Contains(dto.ScheduledTimeOfDay))
                throw new ArgumentException($"Invalid ScheduledTimeOfDay. Valid options: {string.Join(", ", ValidTimeOfDay)}");
        }

        // Validate EstimatedDurationMinutes
        if (dto.EstimatedDurationMinutes.HasValue)
        {
            if (dto.EstimatedDurationMinutes <= 0 || dto.EstimatedDurationMinutes > 1440)
                throw new ArgumentException("EstimatedDurationMinutes must be between 1 and 1440 (24 hours)");
        }

        // Validate Priority
        if (!string.IsNullOrWhiteSpace(dto.Priority))
        {
            dto.Priority = dto.Priority.Trim();
            if (!ValidPriorities.Contains(dto.Priority))
                throw new ArgumentException($"Invalid Priority. Valid options: {string.Join(", ", ValidPriorities)}");
        }

        // Validate Water parameters
        if (dto.WaterAmountLiters.HasValue)
        {
            if (dto.WaterAmountLiters <= 0 || dto.WaterAmountLiters > MaxWaterAmountLiters)
                throw new ArgumentException($"WaterAmountLiters must be between 0 and {MaxWaterAmountLiters}");
        }

        if (!string.IsNullOrWhiteSpace(dto.WaterSource))
        {
            dto.WaterSource = dto.WaterSource.Trim();
            if (!ValidWaterSources.Contains(dto.WaterSource))
                throw new ArgumentException($"Invalid WaterSource. Valid options: {string.Join(", ", ValidWaterSources)}");
        }

        // Validate Fertilizer parameters
        if (dto.FertilizerAmountGrams.HasValue)
        {
            if (dto.FertilizerAmountGrams <= 0 || dto.FertilizerAmountGrams > MaxFertilizerAmountGrams)
                throw new ArgumentException($"FertilizerAmountGrams must be between 1 and {MaxFertilizerAmountGrams}");
        }

        if (!string.IsNullOrWhiteSpace(dto.FertilizerType))
        {
            dto.FertilizerType = dto.FertilizerType.Trim();
            if (dto.FertilizerType.Length > 100)
                throw new ArgumentException("FertilizerType cannot exceed 100 characters");
        }

        if (!string.IsNullOrWhiteSpace(dto.ApplicationMethod))
        {
            dto.ApplicationMethod = dto.ApplicationMethod.Trim();
            if (dto.ApplicationMethod.Length > 100)
                throw new ArgumentException("ApplicationMethod cannot exceed 100 characters");
        }

        // Validate Pruning parameters
        if (!string.IsNullOrWhiteSpace(dto.PruningType))
        {
            dto.PruningType = dto.PruningType.Trim();
            if (dto.PruningType.Length > 50)
                throw new ArgumentException("PruningType cannot exceed 50 characters");
        }

        if (!string.IsNullOrWhiteSpace(dto.PruningNotes))
        {
            dto.PruningNotes = dto.PruningNotes.Trim();
            if (dto.PruningNotes.Length > 500)
                throw new ArgumentException("PruningNotes cannot exceed 500 characters");
        }

        // Validate Recurrence
        if (dto.IsRecurring == true && string.IsNullOrWhiteSpace(dto.RecurrencePattern))
            throw new ArgumentException("RecurrencePattern is required when IsRecurring is true");

        if (!string.IsNullOrWhiteSpace(dto.RecurrencePattern))
        {
            dto.RecurrencePattern = dto.RecurrencePattern.Trim();
            if (!ValidRecurrencePatterns.Contains(dto.RecurrencePattern))
                throw new ArgumentException($"Invalid RecurrencePattern. Valid options: {string.Join(", ", ValidRecurrencePatterns)}");
        }

        // Validate Notes
        if (!string.IsNullOrWhiteSpace(dto.Notes))
        {
            dto.Notes = dto.Notes.Trim();
            if (dto.Notes.Length > MaxNotesLength)
                throw new ArgumentException($"Notes cannot exceed {MaxNotesLength} characters");
        }

        // Create entity
        var careSchedule = new CareScheduleEntity
        {
            TreeId = dto.TreeId,
            TaskType = dto.TaskType,
            TaskName = dto.TaskName,
            Description = dto.Description,
            ScheduledDate = scheduledDate,
            ScheduledTimeOfDay = dto.ScheduledTimeOfDay,
            EstimatedDurationMinutes = dto.EstimatedDurationMinutes,
            Status = "Pending",
            Priority = dto.Priority ?? "Medium",
            WaterAmountLiters = dto.WaterAmountLiters,
            WaterSource = dto.WaterSource,
            FertilizerType = dto.FertilizerType,
            FertilizerAmountGrams = dto.FertilizerAmountGrams,
            ApplicationMethod = dto.ApplicationMethod,
            PruningType = dto.PruningType,
            PruningNotes = dto.PruningNotes,
            IsRecurring = dto.IsRecurring ?? false,
            RecurrencePattern = dto.RecurrencePattern,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.CareSchedules.AddAsync(careSchedule);
        await _dbContext.SaveChangesAsync();

        return MapToDetailDto(careSchedule);
    }

    /// <summary>
    /// Get care task detail by ID
    /// </summary>
    public async Task<CareTaskDetailDto?> GetTaskDetailAsync(int scheduleId)
    {
        if (scheduleId <= 0)
            throw new ArgumentException("Invalid ScheduleId");

        var task = await _dbContext.CareSchedules
            .Include(c => c.CompletedByUser)
            .Include(c => c.Tree)
            .FirstOrDefaultAsync(c => c.ScheduleId == scheduleId);

        return task == null ? null : MapToDetailDto(task);
    }

    /// <summary>
    /// Edit existing care task
    /// </summary>
    public async Task<bool> EditCareTaskAsync(int scheduleId, EditCareTaskDto dto)
    {
        if (scheduleId <= 0)
            throw new ArgumentException("Invalid ScheduleId");

        var careSchedule = await _dbContext.CareSchedules.FirstOrDefaultAsync(c => c.ScheduleId == scheduleId);
        if (careSchedule == null)
            throw new InvalidOperationException("Care task not found");

        /*
        if (careSchedule.CompletedAt.HasValue)
            throw new InvalidOperationException("Cannot edit completed tasks");*/

        // Validate and update fields
        if (!string.IsNullOrWhiteSpace(dto.TaskName))
        {
            dto.TaskName = dto.TaskName.Trim();
            if (dto.TaskName.Length > MaxTaskNameLength)
                throw new ArgumentException($"TaskName cannot exceed {MaxTaskNameLength} characters");
            careSchedule.TaskName = dto.TaskName;
        }

        if (!string.IsNullOrWhiteSpace(dto.Description))
        {
            dto.Description = dto.Description.Trim();
            if (dto.Description.Length > MaxDescriptionLength)
                throw new ArgumentException($"Description cannot exceed {MaxDescriptionLength} characters");
            careSchedule.Description = dto.Description;
        }

        if (!string.IsNullOrWhiteSpace(dto.ScheduledDate))
        {
            if (!DateOnly.TryParse(dto.ScheduledDate, out var parsed))
                throw new ArgumentException("Invalid date format. Use YYYY-MM-DD");
            careSchedule.ScheduledDate = parsed;
        }

        if (!string.IsNullOrWhiteSpace(dto.ScheduledTimeOfDay))
        {
            dto.ScheduledTimeOfDay = dto.ScheduledTimeOfDay.Trim();
            if (!ValidTimeOfDay.Contains(dto.ScheduledTimeOfDay))
                throw new ArgumentException($"Invalid ScheduledTimeOfDay. Valid options: {string.Join(", ", ValidTimeOfDay)}");
            careSchedule.ScheduledTimeOfDay = dto.ScheduledTimeOfDay;
        }

        if (dto.EstimatedDurationMinutes.HasValue)
        {
            if (dto.EstimatedDurationMinutes <= 0 || dto.EstimatedDurationMinutes > 1440)
                throw new ArgumentException("EstimatedDurationMinutes must be between 1 and 1440");
            careSchedule.EstimatedDurationMinutes = dto.EstimatedDurationMinutes;
        }

        if (!string.IsNullOrWhiteSpace(dto.Priority))
        {
            dto.Priority = dto.Priority.Trim();
            if (!ValidPriorities.Contains(dto.Priority))
                throw new ArgumentException($"Invalid Priority. Valid options: {string.Join(", ", ValidPriorities)}");
            careSchedule.Priority = dto.Priority;
        }

        if (dto.WaterAmountLiters.HasValue)
        {
            if (dto.WaterAmountLiters <= 0 || dto.WaterAmountLiters > MaxWaterAmountLiters)
                throw new ArgumentException($"WaterAmountLiters must be between 0 and {MaxWaterAmountLiters}");
            careSchedule.WaterAmountLiters = dto.WaterAmountLiters;
        }

        if (!string.IsNullOrWhiteSpace(dto.WaterSource))
        {
            dto.WaterSource = dto.WaterSource.Trim();
            if (!ValidWaterSources.Contains(dto.WaterSource))
                throw new ArgumentException($"Invalid WaterSource. Valid options: {string.Join(", ", ValidWaterSources)}");
            careSchedule.WaterSource = dto.WaterSource;
        }

        if (dto.FertilizerAmountGrams.HasValue)
        {
            if (dto.FertilizerAmountGrams <= 0 || dto.FertilizerAmountGrams > MaxFertilizerAmountGrams)
                throw new ArgumentException($"FertilizerAmountGrams must be between 1 and {MaxFertilizerAmountGrams}");
            careSchedule.FertilizerAmountGrams = dto.FertilizerAmountGrams;
        }

        if (!string.IsNullOrWhiteSpace(dto.FertilizerType))
        {
            dto.FertilizerType = dto.FertilizerType.Trim();
            if (dto.FertilizerType.Length > 100)
                throw new ArgumentException("FertilizerType cannot exceed 100 characters");
            careSchedule.FertilizerType = dto.FertilizerType;
        }

        if (!string.IsNullOrWhiteSpace(dto.ApplicationMethod))
        {
            dto.ApplicationMethod = dto.ApplicationMethod.Trim();
            careSchedule.ApplicationMethod = dto.ApplicationMethod;
        }

        if (!string.IsNullOrWhiteSpace(dto.PruningType))
        {
            dto.PruningType = dto.PruningType.Trim();
            careSchedule.PruningType = dto.PruningType;
        }

        if (!string.IsNullOrWhiteSpace(dto.PruningNotes))
        {
            dto.PruningNotes = dto.PruningNotes.Trim();
            if (dto.PruningNotes.Length > 500)
                throw new ArgumentException("PruningNotes cannot exceed 500 characters");
            careSchedule.PruningNotes = dto.PruningNotes;
        }

        if (!string.IsNullOrWhiteSpace(dto.RecurrencePattern))
        {
            dto.RecurrencePattern = dto.RecurrencePattern.Trim();
            if (!ValidRecurrencePatterns.Contains(dto.RecurrencePattern))
                throw new ArgumentException($"Invalid RecurrencePattern. Valid options: {string.Join(", ", ValidRecurrencePatterns)}");
            careSchedule.RecurrencePattern = dto.RecurrencePattern;
        }

        if (!string.IsNullOrWhiteSpace(dto.Notes))
        {
            dto.Notes = dto.Notes.Trim();
            if (dto.Notes.Length > MaxNotesLength)
                throw new ArgumentException($"Notes cannot exceed {MaxNotesLength} characters");
            careSchedule.Notes = dto.Notes;
        }

        if (!string.IsNullOrWhiteSpace(dto.Status))
        {
            careSchedule.Status = dto.Status.Trim();
        }

        careSchedule.UpdatedAt = DateTime.UtcNow;
        _dbContext.CareSchedules.Update(careSchedule);
        await _dbContext.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Delete care task by ID
    /// </summary>
    public async Task<bool> DeleteCareTaskAsync(int scheduleId)
    {
        if (scheduleId <= 0)
            throw new ArgumentException("Invalid ScheduleId");

        var careSchedule = await _dbContext.CareSchedules.FirstOrDefaultAsync(c => c.ScheduleId == scheduleId);
        if (careSchedule == null)
            throw new InvalidOperationException("Care task not found");

        if (careSchedule.CompletedAt.HasValue)
            throw new InvalidOperationException("Cannot delete completed tasks");

        _dbContext.CareSchedules.Remove(careSchedule);
        await _dbContext.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Mark task as complete
    /// </summary>
    public async Task<bool> MarkTaskAsCompleteAsync(int scheduleId, int userId, MarkTaskCompleteDto dto)
    {
        if (scheduleId <= 0)
            throw new ArgumentException("Invalid ScheduleId");

        if (userId <= 0)
            throw new ArgumentException("Invalid UserId");

        var careSchedule = await _dbContext.CareSchedules.FirstOrDefaultAsync(c => c.ScheduleId == scheduleId);
        if (careSchedule == null)
            throw new InvalidOperationException("Care task not found");

        if (careSchedule.CompletedAt.HasValue)
            throw new InvalidOperationException("Task already completed");

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException("User not found");

        // Validate CompletionNotes
        if (!string.IsNullOrWhiteSpace(dto.CompletionNotes))
        {
            dto.CompletionNotes = dto.CompletionNotes.Trim();
            if (dto.CompletionNotes.Length > MaxCompletionNotesLength)
                throw new ArgumentException($"CompletionNotes cannot exceed {MaxCompletionNotesLength} characters");
        }

        // Validate actual amounts
        if (dto.ActualWaterAmountLiters.HasValue)
        {
            if (dto.ActualWaterAmountLiters < 0 || dto.ActualWaterAmountLiters > MaxWaterAmountLiters)
                throw new ArgumentException($"ActualWaterAmountLiters must be between 0 and {MaxWaterAmountLiters}");
        }

        if (dto.ActualFertilizerAmountGrams.HasValue)
        {
            if (dto.ActualFertilizerAmountGrams < 0 || dto.ActualFertilizerAmountGrams > MaxFertilizerAmountGrams)
                throw new ArgumentException($"ActualFertilizerAmountGrams must be between 0 and {MaxFertilizerAmountGrams}");
        }

        // Validate PhotoUrls
        if (!string.IsNullOrWhiteSpace(dto.PhotoUrls))
        {
            dto.PhotoUrls = dto.PhotoUrls.Trim();
            if (dto.PhotoUrls.Length > 1000)
                throw new ArgumentException("PhotoUrls cannot exceed 1000 characters");
        }

        // Validate ResultRating
        if (dto.ResultRating.HasValue)
        {
            if (dto.ResultRating < 1 || dto.ResultRating > 5)
                throw new ArgumentException("ResultRating must be between 1 and 5");
        }

        careSchedule.Status = "Completed";
        careSchedule.CompletedAt = DateTime.UtcNow;
        careSchedule.CompletedByUserId = userId;
        careSchedule.CompletionNotes = dto.CompletionNotes;
        careSchedule.ActualWaterAmountLiters = dto.ActualWaterAmountLiters;
        careSchedule.ActualFertilizerAmountGrams = dto.ActualFertilizerAmountGrams;
        careSchedule.PhotoUrls = dto.PhotoUrls;
        careSchedule.ResultRating = dto.ResultRating;
        careSchedule.UpdatedAt = DateTime.UtcNow;

        _dbContext.CareSchedules.Update(careSchedule);
        await _dbContext.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Get all tasks for today
    /// </summary>
    public async Task<List<CareTaskListItemDto>> GetTodayTasksAsync(int? treeId = null)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var query = _dbContext.CareSchedules
            .Include(c => c.Tree)
            .Include(c => c.CompletedByUser)
            .Where(c => c.ScheduledDate == today);

        if (treeId.HasValue && treeId > 0)
            query = query.Where(c => c.TreeId == treeId);

        var tasks = await query
            .OrderBy(c => c.ScheduledTimeOfDay)
            .ToListAsync();

        return tasks.Select(MapToListItemDto).ToList();
    }

    /// <summary>
    /// Search care tasks with filters and pagination
    /// </summary>
    public async Task<PagedResult<CareTaskSearchResultDto>> SearchTasksAsync(
        int? treeId = null,
        int? gardenId = null,
        string? taskType = null,
        string? status = null,
        string? priority = null,
        DateOnly? dateFrom = null,
        DateOnly? dateTo = null,
        string? searchKeyword = null,
        int pageNumber = 1,
        int pageSize = 10)
    {
        // Validate pagination
        if (pageNumber < 1)
            pageNumber = 1;
        if (pageSize < 1 || pageSize > 100)
            pageSize = 10;

        var query = _dbContext.CareSchedules
            .Include(c => c.Tree)
                .ThenInclude(t => t.Garden)
            .Include(c => c.CompletedByUser)
            .AsQueryable();

        // Apply filters
        if (treeId.HasValue && treeId > 0)
            query = query.Where(c => c.TreeId == treeId);

        if (gardenId.HasValue && gardenId > 0)
            query = query.Where(c => c.Tree.GardenId == gardenId);

        if (!string.IsNullOrWhiteSpace(taskType))
        {
            taskType = taskType.Trim();
            query = query.Where(c => c.TaskType == taskType);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            status = status.Trim();
            query = query.Where(c => c.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(priority))
        {
            priority = priority.Trim();
            query = query.Where(c => c.Priority == priority);
        }

        if (dateFrom.HasValue)
            query = query.Where(c => c.ScheduledDate >= dateFrom);

        if (dateTo.HasValue)
            query = query.Where(c => c.ScheduledDate <= dateTo);

        if (!string.IsNullOrWhiteSpace(searchKeyword))
        {
            searchKeyword = searchKeyword.Trim().ToLower();
            query = query.Where(c =>
                c.TaskName.ToLower().Contains(searchKeyword) ||
                c.Description.ToLower().Contains(searchKeyword) ||
                c.TaskType.ToLower().Contains(searchKeyword));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CareTaskSearchResultDto
            {
                ScheduleId = c.ScheduleId,
                TreeId = c.TreeId,
                TreeCode = c.Tree.TreeCode,
                TreeName = c.Tree.TreeName,
                GardenId = c.Tree.GardenId,
                GardenName = c.Tree.Garden != null ? c.Tree.Garden.Name : null,
                TaskType = c.TaskType,
                TaskName = c.TaskName,
                Description = c.Description,
                ScheduledDate = c.ScheduledDate,
                ScheduledTimeOfDay = c.ScheduledTimeOfDay,
                Status = c.Status,
                Priority = c.Priority,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<CareTaskSearchResultDto>
        {
            Items = items,
            Total = totalCount,
            Page = pageNumber,
            PageSize = pageSize
        };
    }

    /// <summary>
    /// Get all tasks for a specific tree
    /// </summary>
    public async Task<List<CareTaskDetailDto>> GetTasksByTreeAsync(int treeId)
    {
        if (treeId <= 0)
            throw new ArgumentException("Invalid TreeId");

        var tree = await _dbContext.Trees.FirstOrDefaultAsync(t => t.TreeId == treeId);
        if (tree == null)
            throw new InvalidOperationException("Tree not found");

        var tasks = await _dbContext.CareSchedules
            .Include(c => c.CompletedByUser)
            .Include(c => c.Tree)
            .Where(c => c.TreeId == treeId)
            .OrderBy(c => c.ScheduledDate)
            .ToListAsync();

        return tasks.Select(MapToDetailDto).ToList();
    }

    /// <summary>
    /// Get all pending tasks
    /// </summary>
    public async Task<List<CareTaskListItemDto>> GetPendingTasksAsync()
    {
        var tasks = await _dbContext.CareSchedules
            .Include(c => c.Tree)
            .Include(c => c.CompletedByUser)
            .Where(c => c.Status == "Pending" || c.Status == "InProgress")
            .OrderBy(c => c.ScheduledDate)
            .ThenBy(c => c.ScheduledTimeOfDay)
            .ToListAsync();

        return tasks.Select(MapToListItemDto).ToList();
    }

    /// <summary>
    /// Check if task exists
    /// </summary>
    public async Task<bool> TaskExistsAsync(int scheduleId)
    {
        if (scheduleId <= 0)
            return false;

        return await _dbContext.CareSchedules.AnyAsync(c => c.ScheduleId == scheduleId);
    }

    // ===== Helper Methods =====

    private CareTaskDetailDto MapToDetailDto(CareScheduleEntity entity)
    {
        return new CareTaskDetailDto
        {
            ScheduleId = entity.ScheduleId,
            TreeId = entity.TreeId,
            TaskType = entity.TaskType,
            TaskName = entity.TaskName,
            Description = entity.Description,
            ScheduledDate = entity.ScheduledDate,
            ScheduledTimeOfDay = entity.ScheduledTimeOfDay,
            EstimatedDurationMinutes = entity.EstimatedDurationMinutes,
            Status = entity.Status,
            CompletedAt = entity.CompletedAt,
            CompletedByUserName = entity.CompletedByUser?.FullName,
            WaterAmountLiters = entity.WaterAmountLiters,
            WaterSource = entity.WaterSource,
            ActualWaterAmountLiters = entity.ActualWaterAmountLiters,
            FertilizerType = entity.FertilizerType,
            FertilizerAmountGrams = entity.FertilizerAmountGrams,
            ActualFertilizerAmountGrams = entity.ActualFertilizerAmountGrams,
            ApplicationMethod = entity.ApplicationMethod,
            PruningType = entity.PruningType,
            PruningNotes = entity.PruningNotes,
            Priority = entity.Priority,
            IsRecurring = entity.IsRecurring,
            RecurrencePattern = entity.RecurrencePattern,
            Notes = entity.Notes,
            CompletionNotes = entity.CompletionNotes,
            PhotoUrls = entity.PhotoUrls,
            ResultRating = entity.ResultRating,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    private CareTaskListItemDto MapToListItemDto(CareScheduleEntity entity)
    {
        return new CareTaskListItemDto
        {
            ScheduleId = entity.ScheduleId,
            TreeId = entity.TreeId,
            TaskType = entity.TaskType,
            TaskName = entity.TaskName,
            Description = entity.Description,
            ScheduledDate = entity.ScheduledDate,
            ScheduledTimeOfDay = entity.ScheduledTimeOfDay,
            Status = entity.Status,
            Priority = entity.Priority,
            CompletedAt = entity.CompletedAt,
            CompletedByUserName = entity.CompletedByUser?.FullName,
            CreatedAt = entity.CreatedAt
        };
    }
}
