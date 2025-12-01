using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MamMoi.Application.DTOs.Admin;
using MamMoi.Application.DTOs.SubscriptionPlan;
using MamMoi.Application.DTOs.SupportRequest;
using MamMoi.Application.Interfaces;
using MamMoi.Application.Interfaces.Admin;

namespace MamMoi.Api.Controllers;

/// <summary>
/// Admin Controller - API quản lý cho SystemAdmin và BusinessAdmin
/// Bao gồm: Quản lý User, TreeType, TreeVariety, Doanh thu, Support Requests và Subscriptions
/// </summary>
[ApiController]
[Route("api/admin")]
[Authorize(Roles = "SystemAdmin,BusinessAdmin")]
public class AdminController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;
    private readonly IAdminTreeTypeService _adminTreeTypeService;
    private readonly IAdminTreeVarietyService _adminTreeVarietyService;
    private readonly IAdminTreeGrowthStageService _adminTreeGrowthStageService;
    private readonly IAdminSoilMasterService _adminSoilMasterService;
    private readonly IAdminRevenueService _adminRevenueService;
    private readonly IAdminSupportRequestService _adminSupportRequestService;
    private readonly IAdminSubscriptionService _adminSubscriptionService;
    private readonly ISubscriptionPlanService _subscriptionPlanService;
    private readonly IImageUploadService _imageUploadService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        IAdminUserService adminUserService,
        IAdminTreeTypeService adminTreeTypeService,
        IAdminTreeVarietyService adminTreeVarietyService,
        IAdminTreeGrowthStageService adminTreeGrowthStageService,
        IAdminSoilMasterService adminSoilMasterService,
        IAdminRevenueService adminRevenueService,
        IAdminSupportRequestService adminSupportRequestService,
        IAdminSubscriptionService adminSubscriptionService,
        ISubscriptionPlanService subscriptionPlanService,
        IImageUploadService imageUploadService,
        ILogger<AdminController> logger)
    {
        _adminUserService = adminUserService;
        _adminTreeTypeService = adminTreeTypeService;
        _adminTreeVarietyService = adminTreeVarietyService;
        _adminTreeGrowthStageService = adminTreeGrowthStageService;
        _adminSoilMasterService = adminSoilMasterService;
        _adminRevenueService = adminRevenueService;
        _adminSupportRequestService = adminSupportRequestService;
        _adminSubscriptionService = adminSubscriptionService;
        _subscriptionPlanService = subscriptionPlanService;
        _imageUploadService = imageUploadService;
        _logger = logger;
    }

    #region User Management

    /// <summary>
    /// Get all users with pagination and filters
    /// GET /api/admin/users
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? roleId = null,
        [FromQuery] bool? isActive = null)
    {
        try
        {
            var (users, totalCount) = await _adminUserService.GetAllUsersAsync(
                page, pageSize, searchTerm, roleId, isActive);

            return Ok(new
            {
                success = true,
                data = users,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get user details by ID
    /// GET /api/admin/users/{id}
    /// </summary>
    [HttpGet("users/{id}")]
    [ProducesResponseType(typeof(AdminUserDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserById(int id)
    {
        try
        {
            var user = await _adminUserService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound(new { success = false, message = "User not found" });

            return Ok(new { success = true, data = user });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user: {UserId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Update user information
    /// PUT /api/admin/users/{id}
    /// </summary>
    [HttpPut("users/{id}")]
    [ProducesResponseType(typeof(AdminUserDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] AdminUpdateUserDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            var user = await _adminUserService.UpdateUserAsync(id, dto);
            if (user == null)
                return NotFound(new { success = false, message = "User not found" });

            return Ok(new { success = true, message = "User updated successfully", data = user });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user: {UserId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Activate user account
    /// POST /api/admin/users/{id}/activate
    /// </summary>
    [HttpPost("users/{id}/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ActivateUser(int id)
    {
        try
        {
            var result = await _adminUserService.ActivateUserAsync(id);
            if (!result)
                return NotFound(new { success = false, message = "User not found" });

            return Ok(new { success = true, message = "User activated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating user: {UserId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Deactivate user account
    /// POST /api/admin/users/{id}/deactivate
    /// </summary>
    [HttpPost("users/{id}/deactivate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateUser(int id)
    {
        try
        {
            var result = await _adminUserService.DeactivateUserAsync(id);
            if (!result)
                return NotFound(new { success = false, message = "User not found" });

            return Ok(new { success = true, message = "User deactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating user: {UserId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Update user's subscription plan
    /// PUT /api/admin/users/{id}/subscription-plan
    /// </summary>
    [HttpPut("users/{id}/subscription-plan")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserSubscriptionPlan(int id, [FromBody] UpdateUserSubscriptionPlanDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            DateOnly? startDate = dto.StartDate.HasValue
                ? DateOnly.FromDateTime(dto.StartDate.Value.Date)
                : null;
            DateOnly? endDate = dto.EndDate.HasValue
                ? DateOnly.FromDateTime(dto.EndDate.Value.Date)
                : null;

            var result = await _adminUserService.UpdateUserSubscriptionPlanAsync(
                id,
                dto.PlanType,
                startDate,
                endDate);
            if (!result)
                return NotFound(new { success = false, message = "User not found" });

            return Ok(new { success = true, message = "User subscription plan updated successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user subscription plan: {UserId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Reset user password (admin only)
    /// POST /api/admin/users/{id}/reset-password
    /// </summary>
    [HttpPost("users/{id}/reset-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResetUserPassword(int id, [FromBody] AdminResetPasswordDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            var result = await _adminUserService.ResetUserPasswordAsync(id, dto.NewPassword);
            if (!result)
                return NotFound(new { success = false, message = "User not found" });

            return Ok(new { success = true, message = "Password reset successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting user password: {UserId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    #endregion

    #region Image Upload

    /// <summary>
    /// Upload image for tree type
    /// POST /api/admin/tree-types/upload
    /// Accepts multipart/form-data
    /// </summary>
    [HttpPost("tree-types/upload")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> UploadTreeTypeImage([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new
            {
                success = false,
                message = "No file uploaded."
            });
        }

        try
        {
            // Use ImageUploadService to save with category "tree-types"
            var relativePath = await _imageUploadService.UploadImageAsync(
                file.OpenReadStream(),
                file.FileName,
                file.ContentType,
                "tree-types"
            );

            // Return the accessible URL
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var fileUrl = $"{baseUrl}{relativePath}";

            return Ok(new
            {
                success = true,
                url = fileUrl
            });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid file uploaded for tree type");
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading tree type image");
            return StatusCode(500, new
            {
                success = false,
                message = "Error uploading image. Please try again."
            });
        }
    }

    /// <summary>
    /// Upload image for tree growth stage
    /// POST /api/admin/tree-growth-stages/upload
    /// Accepts multipart/form-data
    /// </summary>
    [HttpPost("tree-growth-stages/upload")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> UploadGrowthStageImage([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new
            {
                success = false,
                message = "No file uploaded."
            });
        }

        try
        {
            // Use ImageUploadService to save with category "growth-stages"
            var relativePath = await _imageUploadService.UploadImageAsync(
                file.OpenReadStream(),
                file.FileName,
                file.ContentType,
                "growth-stages"
            );

            // Return the accessible URL
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var fileUrl = $"{baseUrl}{relativePath}";

            return Ok(new
            {
                success = true,
                url = fileUrl
            });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid file uploaded for growth stage");
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading growth stage image");
            return StatusCode(500, new
            {
                success = false,
                message = "Error uploading image. Please try again."
            });
        }
    }

    #endregion

    #region TreeType Management

    /// <summary>
    /// Get all tree types with pagination
    /// GET /api/admin/tree-types
    /// </summary>
    [HttpGet("tree-types")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllTreeTypes(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] bool? isActive = null)
    {
        try
        {
            var (treeTypes, totalCount) = await _adminTreeTypeService.GetAllTreeTypesAsync(
                page, pageSize, searchTerm, isActive);

            return Ok(new
            {
                success = true,
                data = treeTypes,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tree types");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get tree type by ID
    /// GET /api/admin/tree-types/{id}
    /// </summary>
    [HttpGet("tree-types/{id}")]
    [ProducesResponseType(typeof(TreeTypeDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTreeTypeById(int id)
    {
        try
        {
            var treeType = await _adminTreeTypeService.GetTreeTypeByIdAsync(id);
            if (treeType == null)
                return NotFound(new { success = false, message = "Tree type not found" });

            return Ok(new { success = true, data = treeType });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tree type: {TreeTypeId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Create a new tree type
    /// POST /api/admin/tree-types
    /// </summary>
    [HttpPost("tree-types")]
    [ProducesResponseType(typeof(TreeTypeDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTreeType([FromBody] CreateTreeTypeDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            var treeType = await _adminTreeTypeService.CreateTreeTypeAsync(dto);
            return CreatedAtAction(
                nameof(GetTreeTypeById),
                new { id = treeType.TreeTypeId },
                new { success = true, message = "Tree type created successfully", data = treeType });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tree type");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Update an existing tree type
    /// PUT /api/admin/tree-types/{id}
    /// </summary>
    [HttpPut("tree-types/{id}")]
    [ProducesResponseType(typeof(TreeTypeDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTreeType(int id, [FromBody] UpdateTreeTypeDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray()
                    );
                _logger.LogWarning("Model validation failed for TreeType {TreeTypeId}: {Errors}", id, errors);
                return BadRequest(new { success = false, message = "Invalid input", errors = errors });
            }

            var treeType = await _adminTreeTypeService.UpdateTreeTypeAsync(id, dto);
            if (treeType == null)
                return NotFound(new { success = false, message = "Tree type not found" });

            return Ok(new { success = true, message = "Tree type updated successfully", data = treeType });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when updating TreeType {TreeTypeId}", id);
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating tree type: {TreeTypeId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error", details = ex.Message });
        }
    }

    /// <summary>
    /// Delete a tree type (soft delete)
    /// DELETE /api/admin/tree-types/{id}
    /// </summary>
    [HttpDelete("tree-types/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTreeType(int id)
    {
        try
        {
            var result = await _adminTreeTypeService.DeleteTreeTypeAsync(id);
            if (!result)
                return NotFound(new { success = false, message = "Tree type not found" });

            return Ok(new { success = true, message = "Tree type deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting tree type: {TreeTypeId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Activate a tree type
    /// POST /api/admin/tree-types/{id}/activate
    /// </summary>
    [HttpPost("tree-types/{id}/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ActivateTreeType(int id)
    {
        try
        {
            var result = await _adminTreeTypeService.ActivateTreeTypeAsync(id);
            if (!result)
                return NotFound(new { success = false, message = "Tree type not found" });

            return Ok(new { success = true, message = "Tree type activated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating tree type: {TreeTypeId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    #endregion

    #region TreeVariety Management

    /// <summary>
    /// Get all tree varieties with pagination
    /// GET /api/admin/tree-varieties
    /// </summary>
    [HttpGet("tree-varieties")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllTreeVarieties(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? treeTypeId = null)
    {
        try
        {
            var (varieties, totalCount) = await _adminTreeVarietyService.GetAllTreeVarietiesAsync(
                page, pageSize, searchTerm, treeTypeId);

            return Ok(new
            {
                success = true,
                data = varieties,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tree varieties");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get tree variety by ID
    /// GET /api/admin/tree-varieties/{id}
    /// </summary>
    [HttpGet("tree-varieties/{id}")]
    [ProducesResponseType(typeof(TreeVarietyDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTreeVarietyById(int id)
    {
        try
        {
            var variety = await _adminTreeVarietyService.GetTreeVarietyByIdAsync(id);
            if (variety == null)
                return NotFound(new { success = false, message = "Tree variety not found" });

            return Ok(new { success = true, data = variety });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tree variety: {VarietyId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get varieties by tree type ID
    /// GET /api/admin/tree-varieties/by-tree-type/{treeTypeId}
    /// </summary>
    [HttpGet("tree-varieties/by-tree-type/{treeTypeId}")]
    [ProducesResponseType(typeof(List<TreeVarietyListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVarietiesByTreeTypeId(int treeTypeId)
    {
        try
        {
            var varieties = await _adminTreeVarietyService.GetVarietiesByTreeTypeIdAsync(treeTypeId);
            return Ok(new { success = true, data = varieties });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting varieties by tree type: {TreeTypeId}", treeTypeId);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Create a new tree variety
    /// POST /api/admin/tree-varieties
    /// </summary>
    [HttpPost("tree-varieties")]
    [ProducesResponseType(typeof(TreeVarietyDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTreeVariety([FromBody] CreateTreeVarietyDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            var variety = await _adminTreeVarietyService.CreateTreeVarietyAsync(dto);
            return CreatedAtAction(
                nameof(GetTreeVarietyById),
                new { id = variety.VarietyId },
                new { success = true, message = "Tree variety created successfully", data = variety });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tree variety: {Message}\n{StackTrace}", ex.Message, ex.StackTrace);
            return StatusCode(500, new { success = false, message = "Internal server error", details = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing tree variety
    /// PUT /api/admin/tree-varieties/{id}
    /// </summary>
    [HttpPut("tree-varieties/{id}")]
    [ProducesResponseType(typeof(TreeVarietyDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTreeVariety(int id, [FromBody] UpdateTreeVarietyDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            var variety = await _adminTreeVarietyService.UpdateTreeVarietyAsync(id, dto);
            if (variety == null)
                return NotFound(new { success = false, message = "Tree variety not found" });

            return Ok(new { success = true, message = "Tree variety updated successfully", data = variety });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating tree variety: {VarietyId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Delete a tree variety
    /// DELETE /api/admin/tree-varieties/{id}
    /// </summary>
    [HttpDelete("tree-varieties/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTreeVariety(int id)
    {
        try
        {
            var result = await _adminTreeVarietyService.DeleteTreeVarietyAsync(id);
            if (!result)
                return NotFound(new { success = false, message = "Tree variety not found" });

            return Ok(new { success = true, message = "Tree variety deleted successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting tree variety: {VarietyId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    #endregion

    #region Soil Master Management

    /// <summary>
    /// Get all soil masters with pagination and filters
    /// GET /api/admin/soil-masters
    /// </summary>
    [HttpGet("soil-masters")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllSoilMasters(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null)
    {
        try
        {
            var (soilMasters, totalCount) = await _adminSoilMasterService.GetAllSoilMastersAsync(
                page, pageSize, searchTerm);

            return Ok(new
            {
                success = true,
                data = soilMasters,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting soil masters");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get soil master details by ID
    /// GET /api/admin/soil-masters/{id}
    /// </summary>
    [HttpGet("soil-masters/{id}")]
    [ProducesResponseType(typeof(SoilMasterDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSoilMasterById(int id)
    {
        try
        {
            var soilMaster = await _adminSoilMasterService.GetSoilMasterByIdAsync(id);
            if (soilMaster == null)
                return NotFound(new { success = false, message = "Soil master not found" });

            return Ok(new { success = true, data = soilMaster });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting soil master: {SoilMasterId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Create a new soil master
    /// POST /api/admin/soil-masters
    /// </summary>
    [HttpPost("soil-masters")]
    [ProducesResponseType(typeof(SoilMasterDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSoilMaster([FromBody] CreateSoilMasterDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            var soilMaster = await _adminSoilMasterService.CreateSoilMasterAsync(dto);
            return CreatedAtAction(
                nameof(GetSoilMasterById),
                new { id = soilMaster.SoilMasterId },
                new { success = true, message = "Soil master created successfully", data = soilMaster });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating soil master");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Update an existing soil master
    /// PUT /api/admin/soil-masters/{id}
    /// </summary>
    [HttpPut("soil-masters/{id}")]
    [ProducesResponseType(typeof(SoilMasterDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSoilMaster(int id, [FromBody] UpdateSoilMasterDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            var soilMaster = await _adminSoilMasterService.UpdateSoilMasterAsync(id, dto);
            if (soilMaster == null)
                return NotFound(new { success = false, message = "Soil master not found" });

            return Ok(new { success = true, message = "Soil master updated successfully", data = soilMaster });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating soil master: {SoilMasterId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Delete a soil master
    /// DELETE /api/admin/soil-masters/{id}
    /// </summary>
    [HttpDelete("soil-masters/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSoilMaster(int id)
    {
        try
        {
            var result = await _adminSoilMasterService.DeleteSoilMasterAsync(id);
            if (!result)
                return NotFound(new { success = false, message = "Soil master not found" });

            return Ok(new { success = true, message = "Soil master deleted successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting soil master: {SoilMasterId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    #endregion

    #region Revenue Management

    /// <summary>
    /// Get revenue statistics
    /// GET /api/admin/revenue/statistics
    /// </summary>
    [HttpGet("revenue/statistics")]
    [ProducesResponseType(typeof(RevenueStatisticsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRevenueStatistics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var statistics = await _adminRevenueService.GetRevenueStatisticsAsync(startDate, endDate);
            return Ok(new { success = true, data = statistics });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting revenue statistics");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get revenue by period
    /// GET /api/admin/revenue/by-period
    /// </summary>
    [HttpGet("revenue/by-period")]
    [ProducesResponseType(typeof(List<RevenueByPeriodDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRevenueByPeriod(
        [FromQuery] string periodType = "monthly",
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var revenue = await _adminRevenueService.GetRevenueByPeriodAsync(periodType, startDate, endDate);
            return Ok(new { success = true, data = revenue });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting revenue by period");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get revenue by subscription plan
    /// GET /api/admin/revenue/by-plan
    /// </summary>
    [HttpGet("revenue/by-plan")]
    [ProducesResponseType(typeof(List<RevenueByPlanDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRevenueByPlan(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var revenue = await _adminRevenueService.GetRevenueByPlanAsync(startDate, endDate);
            return Ok(new { success = true, data = revenue });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting revenue by plan");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get revenue summary
    /// GET /api/admin/revenue/summary
    /// </summary>
    [HttpGet("revenue/summary")]
    [ProducesResponseType(typeof(RevenueSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRevenueSummary(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int recentPaymentsCount = 10)
    {
        try
        {
            var summary = await _adminRevenueService.GetRevenueSummaryAsync(startDate, endDate, recentPaymentsCount);
            return Ok(new { success = true, data = summary });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting revenue summary");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get payment list with pagination
    /// GET /api/admin/revenue/payments
    /// </summary>
    [HttpGet("revenue/payments")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPayments(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int? userId = null,
        [FromQuery] string? transactionStatus = null)
    {
        try
        {
            var (payments, totalCount) = await _adminRevenueService.GetPaymentsAsync(
                page, pageSize, startDate, endDate, userId, transactionStatus);

            return Ok(new
            {
                success = true,
                data = payments,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payments");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    #endregion

    #region TreeGrowthStage Management

    /// <summary>
    /// Get all tree growth stages with pagination
    /// GET /api/admin/tree-growth-stages
    /// </summary>
    [HttpGet("tree-growth-stages")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllTreeGrowthStages(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int? treeTypeId = null)
    {
        try
        {
            var (stages, totalCount) = await _adminTreeGrowthStageService.GetAllTreeGrowthStagesAsync(
                page, pageSize, searchTerm, treeTypeId);

            return Ok(new
            {
                success = true,
                data = stages,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tree growth stages");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get tree growth stage by ID
    /// GET /api/admin/tree-growth-stages/{id}
    /// </summary>
    [HttpGet("tree-growth-stages/{id}")]
    [ProducesResponseType(typeof(TreeGrowthStageDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTreeGrowthStageById(int id)
    {
        try
        {
            var stage = await _adminTreeGrowthStageService.GetTreeGrowthStageByIdAsync(id);
            if (stage == null)
                return NotFound(new { success = false, message = "Tree growth stage not found" });

            return Ok(new { success = true, data = stage });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tree growth stage: {StageId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get stages by tree type ID
    /// GET /api/admin/tree-growth-stages/by-tree-type/{treeTypeId}
    /// </summary>
    [HttpGet("tree-growth-stages/by-tree-type/{treeTypeId}")]
    [ProducesResponseType(typeof(List<TreeGrowthStageListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStagesByTreeTypeId(int treeTypeId)
    {
        try
        {
            var stages = await _adminTreeGrowthStageService.GetStagesByTreeTypeIdAsync(treeTypeId);
            return Ok(new { success = true, data = stages });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting stages by tree type: {TreeTypeId}", treeTypeId);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Create a new tree growth stage
    /// POST /api/admin/tree-growth-stages
    /// </summary>
    [HttpPost("tree-growth-stages")]
    [ProducesResponseType(typeof(TreeGrowthStageDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTreeGrowthStage([FromBody] CreateTreeGrowthStageDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            var stage = await _adminTreeGrowthStageService.CreateTreeGrowthStageAsync(dto);
            return CreatedAtAction(
                nameof(GetTreeGrowthStageById),
                new { id = stage.StageId },
                new { success = true, message = "Tree growth stage created successfully", data = stage });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tree growth stage");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Update an existing tree growth stage
    /// PUT /api/admin/tree-growth-stages/{id}
    /// </summary>
    [HttpPut("tree-growth-stages/{id}")]
    [ProducesResponseType(typeof(TreeGrowthStageDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTreeGrowthStage(int id, [FromBody] UpdateTreeGrowthStageDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            var stage = await _adminTreeGrowthStageService.UpdateTreeGrowthStageAsync(id, dto);
            if (stage == null)
                return NotFound(new { success = false, message = "Tree growth stage not found" });

            return Ok(new { success = true, message = "Tree growth stage updated successfully", data = stage });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating tree growth stage: {StageId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Delete a tree growth stage
    /// DELETE /api/admin/tree-growth-stages/{id}
    /// </summary>
    [HttpDelete("tree-growth-stages/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTreeGrowthStage(int id)
    {
        try
        {
            var result = await _adminTreeGrowthStageService.DeleteTreeGrowthStageAsync(id);
            if (!result)
                return NotFound(new { success = false, message = "Tree growth stage not found" });

            return Ok(new { success = true, message = "Tree growth stage deleted successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting tree growth stage: {StageId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Reorder stages for a tree type
    /// PUT /api/admin/tree-growth-stages/reorder/{treeTypeId}
    /// Body: { "stageId1": newOrder1, "stageId2": newOrder2, ... }
    /// </summary>
    [HttpPut("tree-growth-stages/reorder/{treeTypeId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ReorderTreeGrowthStages(int treeTypeId, [FromBody] Dictionary<int, int> stageIdToNewOrder)
    {
        try
        {
            if (stageIdToNewOrder == null || stageIdToNewOrder.Count == 0)
                return BadRequest(new { success = false, message = "Stage order mapping is required" });

            var result = await _adminTreeGrowthStageService.ReorderStagesAsync(treeTypeId, stageIdToNewOrder);
            if (!result)
                return BadRequest(new { success = false, message = "Failed to reorder stages" });

            return Ok(new { success = true, message = "Stages reordered successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reordering tree growth stages for TreeType: {TreeTypeId}", treeTypeId);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    #endregion

    #region Subscription Plans Management

    /// <summary>
    /// Get all subscription plans (admin view with pagination)
    /// GET /api/admin/subscription-plans
    /// </summary>
    [HttpGet("subscription-plans")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllSubscriptionPlans(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? searchTerm = null)
    {
        try
        {
            var plans = await _subscriptionPlanService.GetAllPlansAsync(isActive);
            
            // Apply search filter if provided
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                plans = plans.Where(p => 
                    p.PlanName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                    (p.Description != null && p.Description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)))
                    .ToList();
            }

            var totalCount = plans.Count;
            var paginatedPlans = plans
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(new
            {
                success = true,
                data = paginatedPlans,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting subscription plans");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get subscription plan by ID
    /// GET /api/admin/subscription-plans/{id}
    /// </summary>
    [HttpGet("subscription-plans/{id}")]
    [ProducesResponseType(typeof(SubscriptionPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSubscriptionPlanById(int id)
    {
        try
        {
            var plan = await _subscriptionPlanService.GetPlanByIdAsync(id);
            if (plan == null)
                return NotFound(new { success = false, message = "Subscription plan not found" });

            return Ok(new { success = true, data = plan });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting subscription plan: {PlanId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Create a new subscription plan
    /// POST /api/admin/subscription-plans
    /// </summary>
    [HttpPost("subscription-plans")]
    [ProducesResponseType(typeof(SubscriptionPlanDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSubscriptionPlan([FromBody] CreateSubscriptionPlanDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            var plan = await _subscriptionPlanService.CreatePlanAsync(dto);
            return CreatedAtAction(
                nameof(GetSubscriptionPlanById),
                new { id = plan.PlanId },
                new { success = true, message = "Subscription plan created successfully", data = plan });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating subscription plan");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Update an existing subscription plan
    /// PUT /api/admin/subscription-plans/{id}
    /// </summary>
    [HttpPut("subscription-plans/{id}")]
    [ProducesResponseType(typeof(SubscriptionPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSubscriptionPlan(int id, [FromBody] UpdateSubscriptionPlanDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            var plan = await _subscriptionPlanService.UpdatePlanAsync(id, dto);
            if (plan == null)
                return NotFound(new { success = false, message = "Subscription plan not found" });

            return Ok(new { success = true, message = "Subscription plan updated successfully", data = plan });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating subscription plan: {PlanId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Delete a subscription plan
    /// DELETE /api/admin/subscription-plans/{id}
    /// NOTE: Subscription plans are fixed and cannot be deleted. Use deactivate endpoint instead.
    /// </summary>
    [HttpDelete("subscription-plans/{id}")]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSubscriptionPlan(int id)
    {
        try
        {
            var result = await _subscriptionPlanService.DeletePlanAsync(id);
            if (!result)
                return NotFound(new { success = false, message = "Subscription plan not found" });

            return Ok(new { success = true, message = "Subscription plan deleted successfully" });
        }
        catch (InvalidOperationException ex)
        {
            // Subscription plans are fixed and cannot be deleted
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting subscription plan: {PlanId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Activate a subscription plan
    /// POST /api/admin/subscription-plans/{id}/activate
    /// </summary>
    [HttpPost("subscription-plans/{id}/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ActivateSubscriptionPlan(int id)
    {
        try
        {
            var result = await _subscriptionPlanService.ActivatePlanAsync(id);
            if (!result)
                return NotFound(new { success = false, message = "Subscription plan not found" });

            return Ok(new { success = true, message = "Subscription plan activated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating subscription plan: {PlanId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Deactivate a subscription plan
    /// POST /api/admin/subscription-plans/{id}/deactivate
    /// </summary>
    [HttpPost("subscription-plans/{id}/deactivate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateSubscriptionPlan(int id)
    {
        try
        {
            var result = await _subscriptionPlanService.DeactivatePlanAsync(id);
            if (!result)
                return NotFound(new { success = false, message = "Subscription plan not found" });

            return Ok(new { success = true, message = "Subscription plan deactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating subscription plan: {PlanId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    #endregion

    #region Support Request Management

    /// <summary>
    /// Get all support requests with filters
    /// GET /api/admin/support-requests
    /// </summary>
    [HttpGet("support-requests")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllSupportRequests(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? priority = null,
        [FromQuery] string? category = null,
        [FromQuery] int? userId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var (requests, totalCount) = await _adminSupportRequestService.GetAllRequestsAsync(
                page, pageSize, status, priority, category, userId, startDate, endDate);

            return Ok(new
            {
                success = true,
                data = requests,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting support requests");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get support request by ID
    /// GET /api/admin/support-requests/{id}
    /// </summary>
    [HttpGet("support-requests/{id}")]
    [ProducesResponseType(typeof(SupportRequestDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSupportRequestById(int id)
    {
        try
        {
            var request = await _adminSupportRequestService.GetRequestByIdAsync(id);
            if (request == null)
                return NotFound(new { success = false, message = "Support request not found" });

            return Ok(new { success = true, data = request });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting support request: {RequestId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Update support request (status, resolution, etc.)
    /// PUT /api/admin/support-requests/{id}
    /// </summary>
    [HttpPut("support-requests/{id}")]
    [ProducesResponseType(typeof(SupportRequestDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSupportRequest(int id, [FromBody] UpdateSupportRequestDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            var request = await _adminSupportRequestService.UpdateRequestAsync(id, dto);
            if (request == null)
                return NotFound(new { success = false, message = "Support request not found" });

            return Ok(new { success = true, message = "Support request updated successfully", data = request });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating support request: {RequestId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get support request statistics
    /// GET /api/admin/support-requests/statistics
    /// </summary>
    [HttpGet("support-requests/statistics")]
    [ProducesResponseType(typeof(SupportRequestStatisticsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSupportRequestStatistics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var statistics = await _adminSupportRequestService.GetStatisticsAsync(startDate, endDate);
            return Ok(new { success = true, data = statistics });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting support request statistics");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    #endregion

    #region Subscription Management

    /// <summary>
    /// Get all subscriptions with filters
    /// GET /api/admin/subscriptions
    /// </summary>
    [HttpGet("subscriptions")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllSubscriptions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] int? userId = null,
        [FromQuery] string? planName = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var (subscriptions, totalCount) = await _adminSubscriptionService.GetAllSubscriptionsAsync(
                page, pageSize, status, userId, planName, startDate, endDate);

            return Ok(new
            {
                success = true,
                data = subscriptions,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting subscriptions");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get subscription by ID
    /// GET /api/admin/subscriptions/{id}
    /// </summary>
    [HttpGet("subscriptions/{id}")]
    [ProducesResponseType(typeof(AdminSubscriptionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSubscriptionById(int id)
    {
        try
        {
            var subscription = await _adminSubscriptionService.GetSubscriptionByIdAsync(id);
            if (subscription == null)
                return NotFound(new { success = false, message = "Subscription not found" });

            return Ok(new { success = true, data = subscription });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting subscription: {SubscriptionId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Update subscription status
    /// PUT /api/admin/subscriptions/{id}
    /// </summary>
    [HttpPut("subscriptions/{id}")]
    [ProducesResponseType(typeof(AdminSubscriptionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSubscription(int id, [FromBody] AdminUpdateSubscriptionDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            var subscription = await _adminSubscriptionService.UpdateSubscriptionAsync(id, dto);
            if (subscription == null)
                return NotFound(new { success = false, message = "Subscription not found" });

            return Ok(new { success = true, message = "Subscription updated successfully", data = subscription });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating subscription: {SubscriptionId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    #endregion

    #region Report Management (Alias for Support Requests)

    /// <summary>
    /// Get all reports with filters (alias for support-requests)
    /// GET /api/admin/reports
    /// </summary>
    [HttpGet("reports")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllReports(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? priority = null,
        [FromQuery] string? category = null,
        [FromQuery] int? userId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            // Map status values from frontend to backend
            string? mappedStatus = status?.ToLower() switch
            {
                "in_progress" => "InProgress",
                "resolved" => "Resolved",
                "rejected" => "Cancelled",
                _ => status
            };

            var (requests, totalCount) = await _adminSupportRequestService.GetAllRequestsAsync(
                page, pageSize, mappedStatus, priority, category, userId, startDate, endDate);

            // Transform to report format expected by frontend
            var reports = requests.Select(r => new
            {
                id = r.TicketNumber ?? $"RP-{r.RequestId:D6}",
                requestId = r.RequestId, // Include actual request ID for API calls
                type = r.Category?.ToLower() ?? "other",
                title = r.Subject,
                summary = r.Subject, // Use subject as summary
                user = new
                {
                    id = $"USR-{r.UserId:D6}",
                    name = r.UserFullName,
                    email = r.UserEmail
                },
                createdAt = r.RequestDate,
                priority = r.Priority?.ToLower() switch
                {
                    "normal" => "medium",
                    _ => r.Priority?.ToLower() ?? "medium"
                },
                status = r.Status?.ToLower() switch
                {
                    "inprogress" => "in_progress",
                    "resolved" => "resolved",
                    "cancelled" => "rejected",
                    _ => r.Status?.ToLower() ?? "in_progress"
                },
                content = r.Subject, // Can be extended with Description
                evidence = new List<object>() // Can be populated from AttachmentUrls if needed
            }).ToList();

            return Ok(new
            {
                success = true,
                data = reports,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting reports");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get report by ID (alias for support-requests)
    /// GET /api/admin/reports/{id}
    /// </summary>
    [HttpGet("reports/{id}")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetReportById(int id)
    {
        try
        {
            var request = await _adminSupportRequestService.GetRequestByIdAsync(id);
            if (request == null)
                return NotFound(new { success = false, message = "Report not found" });

            // Transform to report format expected by frontend
            var report = new
            {
                id = request.TicketNumber ?? $"RP-{request.RequestId:D6}",
                requestId = request.RequestId, // Include actual request ID for API calls
                type = request.Category?.ToLower() ?? "other",
                title = request.Subject,
                summary = request.Subject,
                user = new
                {
                    id = $"USR-{request.UserId:D6}",
                    name = request.UserFullName,
                    email = request.UserEmail
                },
                createdAt = request.RequestDate,
                priority = request.Priority?.ToLower() switch
                {
                    "normal" => "medium",
                    _ => request.Priority?.ToLower() ?? "medium"
                },
                status = request.Status?.ToLower() switch
                {
                    "inprogress" => "in_progress",
                    "resolved" => "resolved",
                    "cancelled" => "rejected",
                    _ => request.Status?.ToLower() ?? "in_progress"
                },
                content = request.Description ?? request.Subject,
                evidence = string.IsNullOrEmpty(request.AttachmentUrls)
                    ? new List<object>()
                    : request.AttachmentUrls.Split(';', StringSplitOptions.RemoveEmptyEntries)
                        .Select(url => new { url = url.Trim() })
                        .Cast<object>()
                        .ToList(),
                resolution = request.Resolution,
                resolvedAt = request.ResolvedAt,
                closedAt = request.ClosedAt,
                satisfactionRating = request.SatisfactionRating,
                feedback = request.Feedback
            };

            return Ok(new { success = true, data = report });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting report: {ReportId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Update report (status, resolution, etc.) (alias for support-requests)
    /// PUT /api/admin/reports/{id}
    /// </summary>
    [HttpPut("reports/{id}")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateReport(int id, [FromBody] UpdateReportDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input", errors = ModelState });

            // Map frontend status to backend status
            string? mappedStatus = dto.Status?.ToLower() switch
            {
                "in_progress" => "InProgress",
                "resolved" => "Resolved",
                "rejected" => "Cancelled",
                _ => dto.Status
            };

            // Map frontend priority to backend priority
            string? mappedPriority = dto.Priority?.ToLower() switch
            {
                "low" => "Low",
                "medium" => "Normal",
                "high" => "High",
                "urgent" => "Urgent",
                _ => dto.Priority
            };

            var updateDto = new UpdateSupportRequestDto
            {
                Status = mappedStatus,
                Resolution = dto.Resolution,
                Category = dto.Category,
                Priority = mappedPriority
            };

            var request = await _adminSupportRequestService.UpdateRequestAsync(id, updateDto);
            if (request == null)
                return NotFound(new { success = false, message = "Report not found" });

            // Transform response to report format
            var report = new
            {
                id = request.TicketNumber ?? $"RP-{request.RequestId:D6}",
                requestId = request.RequestId, // Include actual request ID for API calls
                type = request.Category?.ToLower() ?? "other",
                title = request.Subject,
                summary = request.Subject,
                user = new
                {
                    id = $"USR-{request.UserId:D6}",
                    name = request.UserFullName,
                    email = request.UserEmail
                },
                createdAt = request.RequestDate,
                priority = request.Priority?.ToLower() switch
                {
                    "normal" => "medium",
                    _ => request.Priority?.ToLower() ?? "medium"
                },
                status = request.Status?.ToLower() switch
                {
                    "inprogress" => "in_progress",
                    "resolved" => "resolved",
                    "cancelled" => "rejected",
                    _ => request.Status?.ToLower() ?? "in_progress"
                },
                content = request.Description ?? request.Subject,
                resolution = request.Resolution,
                resolvedAt = request.ResolvedAt
            };

            return Ok(new { success = true, message = "Report updated successfully", data = report });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating report: {ReportId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get report statistics
    /// GET /api/admin/reports/statistics
    /// </summary>
    [HttpGet("reports/statistics")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReportStatistics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var statistics = await _adminSupportRequestService.GetStatisticsAsync(startDate, endDate);
            
            // Transform to report statistics format expected by frontend
            var reportStats = new
            {
                totalRequests = statistics.TotalRequests,
                openRequests = statistics.OpenRequests,
                inProgressRequests = statistics.InProgressRequests,
                resolvedRequests = statistics.ResolvedRequests,
                closedRequests = statistics.ClosedRequests,
                rejectedRequests = statistics.ClosedRequests, // Map closed to rejected for frontend
                urgentRequests = statistics.UrgentRequests,
                averageResolutionTimeHours = statistics.AverageResolutionTimeHours,
                averageSatisfactionRating = statistics.AverageSatisfactionRating,
                requestsByCategory = statistics.RequestsByCategory,
                requestsByPriority = statistics.RequestsByPriority,
                requestsByStatus = new Dictionary<string, int>
                {
                    { "in_progress", statistics.InProgressRequests },
                    { "resolved", statistics.ResolvedRequests },
                    { "rejected", statistics.ClosedRequests }
                }
            };

            return Ok(new { success = true, data = reportStats });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting report statistics");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    #endregion
}

