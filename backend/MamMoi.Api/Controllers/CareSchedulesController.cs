using Microsoft.AspNetCore.Mvc;
using MamMoi.Application.DTOs;
using MamMoi.Application.DTOs.CareSchedule;
using MamMoi.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace MamMoi.Api.Controllers
{
    /// <summary>
    /// Care Schedules/Tasks management API
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class CareSchedulesController : ControllerBase
    {
        private readonly ICareScheduleService _careScheduleService;
        private readonly ILogger<CareSchedulesController> _logger;

        public CareSchedulesController(ICareScheduleService careScheduleService, ILogger<CareSchedulesController> logger)
        {
            _careScheduleService = careScheduleService;
            _logger = logger;
        }

        /// <summary>
        /// Add new care task
        /// POST: api/careschedules/add
        /// </summary>
        [HttpPost("add")]
        public async Task<IActionResult> AddNewCareTask([FromBody] CreateCareTaskDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { message = "Invalid input data", errors = ModelState.Values.SelectMany(v => v.Errors) });

                if (string.IsNullOrWhiteSpace(dto.TaskType) || string.IsNullOrWhiteSpace(dto.TaskName))
                    return BadRequest(new { message = "TaskType and TaskName are required" });

                var result = await _careScheduleService.CreateCareTaskAsync(dto);

                return CreatedAtAction(nameof(GetTaskDetail), new { scheduleId = result.ScheduleId }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding new care task");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get task detail by ID
        /// GET: api/careschedules/{scheduleId}
        /// </summary>
        [HttpGet("{scheduleId}")]
        public async Task<IActionResult> GetTaskDetail(int scheduleId)
        {
            try
            {
                if (scheduleId <= 0)
                    return BadRequest(new { message = "Invalid ScheduleId" });

                var task = await _careScheduleService.GetTaskDetailAsync(scheduleId);

                if (task == null)
                    return NotFound(new { message = "Care task not found" });

                return Ok(task);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting task detail");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// View task detail by ID (alias for GetTaskDetail)
        /// GET: api/careschedules/view/{scheduleId}
        /// </summary>
        [HttpGet("view/{scheduleId}")]
        public async Task<IActionResult> ViewTaskDetail(int scheduleId)
        {
            return await GetTaskDetail(scheduleId);
        }

        /// <summary>
        /// Edit care task
        /// PUT: api/careschedules/{scheduleId}
        /// </summary>
        [HttpPut("{scheduleId}")]
        public async Task<IActionResult> EditCareTask(int scheduleId, [FromBody] EditCareTaskDto dto)
        {
            try
            {
                if (scheduleId <= 0)
                    return BadRequest(new { message = "Invalid ScheduleId" });

                if (!ModelState.IsValid)
                    return BadRequest(new { message = "Invalid input data", errors = ModelState.Values.SelectMany(v => v.Errors) });

                var result = await _careScheduleService.EditCareTaskAsync(scheduleId, dto);

                if (!result)
                    return BadRequest(new { message = "Failed to edit care task" });

                return Ok(new { message = "Care task updated successfully", scheduleId = scheduleId });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error editing care task");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Delete care task
        /// DELETE: api/careschedules/{scheduleId}
        /// </summary>
        [HttpDelete("{scheduleId}")]
        public async Task<IActionResult> DeleteCareTask(int scheduleId)
        {
            try
            {
                if (scheduleId <= 0)
                    return BadRequest(new { message = "Invalid ScheduleId" });

                var result = await _careScheduleService.DeleteCareTaskAsync(scheduleId);

                if (!result)
                    return BadRequest(new { message = "Failed to delete care task" });

                return Ok(new { message = "Care task deleted successfully", scheduleId = scheduleId });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting care task");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Mark task as complete
        /// POST: api/careschedules/{scheduleId}/complete
        /// </summary>
        [HttpPost("{scheduleId}/complete")]
        public async Task<IActionResult> MarkTaskAsComplete(int scheduleId, [FromBody] MarkTaskCompleteDto dto)
        {
            try
            {
                if (scheduleId <= 0)
                    return BadRequest(new { message = "Invalid ScheduleId" });

                // Get userId from claims or token
                var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                    return Unauthorized(new { message = "User not authenticated" });

                if (!ModelState.IsValid)
                    return BadRequest(new { message = "Invalid input data", errors = ModelState.Values.SelectMany(v => v.Errors) });

                var result = await _careScheduleService.MarkTaskAsCompleteAsync(scheduleId, userId, dto);

                if (!result)
                    return BadRequest(new { message = "Failed to mark task as complete" });

                return Ok(new { message = "Task marked as complete successfully", scheduleId = scheduleId });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking task as complete");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get all tasks for today
        /// GET: api/careschedules/today
        /// </summary>
        [HttpGet("today")]
        public async Task<IActionResult> GetTodayTasks([FromQuery] int? treeId = null)
        {
            try
            {
                var tasks = await _careScheduleService.GetTodayTasksAsync(treeId);

                return Ok(new { data = tasks, count = tasks.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting today's tasks");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// View today's tasks (alias for GetTodayTasks)
        /// GET: api/careschedules/today/view
        /// </summary>
        [HttpGet("today/view")]
        public async Task<IActionResult> ViewTodaysTasks([FromQuery] int? treeId = null)
        {
            return await GetTodayTasks(treeId);
        }

        /// <summary>
        /// Search care tasks with filters
        /// GET: api/careschedules/search
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> SearchTasks(
            [FromQuery] int? treeId = null,
            [FromQuery] string? taskType = null,
            [FromQuery] string? status = null,
            [FromQuery] string? priority = null,
            [FromQuery] string? dateFrom = null,
            [FromQuery] string? dateTo = null,
            [FromQuery] string? searchKeyword = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                DateOnly? parsedDateFrom = null;
                DateOnly? parsedDateTo = null;

                if (!string.IsNullOrWhiteSpace(dateFrom))
                {
                    if (!DateOnly.TryParse(dateFrom, out var parsed))
                        return BadRequest(new { message = "Invalid dateFrom format. Use YYYY-MM-DD" });
                    parsedDateFrom = parsed;
                }

                if (!string.IsNullOrWhiteSpace(dateTo))
                {
                    if (!DateOnly.TryParse(dateTo, out var parsed))
                        return BadRequest(new { message = "Invalid dateTo format. Use YYYY-MM-DD" });
                    parsedDateTo = parsed;
                }

                var result = await _careScheduleService.SearchTasksAsync(
                    treeId, taskType, status, priority, parsedDateFrom, parsedDateTo, searchKeyword, pageNumber, pageSize);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching tasks");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get all tasks for a specific tree
        /// GET: api/careschedules/tree/{treeId}
        /// </summary>
        [HttpGet("tree/{treeId}")]
        public async Task<IActionResult> GetTasksByTree(int treeId)
        {
            try
            {
                if (treeId <= 0)
                    return BadRequest(new { message = "Invalid TreeId" });

                var tasks = await _careScheduleService.GetTasksByTreeAsync(treeId);

                return Ok(new { data = tasks, count = tasks.Count });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tasks for tree");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get all pending tasks
        /// GET: api/careschedules/pending
        /// </summary>
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingTasks()
        {
            try
            {
                var tasks = await _careScheduleService.GetPendingTasksAsync();

                return Ok(new { data = tasks, count = tasks.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending tasks");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}
