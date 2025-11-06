namespace MamMoi.Application.DTOs.Invitation;

/// <summary>
/// Response khi tạo Staff thành công
/// </summary>
public class CreateStaffResponseDto
{
    /// <summary>
    /// ID của Staff vừa tạo
    /// </summary>
    public int StaffId { get; set; }

    /// <summary>
    /// Email của Staff
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Tên đầy đủ
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Password tạm thời (chỉ trả về 1 lần)
    /// </summary>
    public string TemporaryPassword { get; set; } = string.Empty;

    /// <summary>
    /// Thông báo cho Farmer
    /// </summary>
    public string Message { get; set; } = string.Empty;
}