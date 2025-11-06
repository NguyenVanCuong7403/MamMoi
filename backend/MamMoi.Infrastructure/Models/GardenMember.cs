using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class GardenMember
{
    public int MemberId { get; set; }

    public int GardenId { get; set; }

    public int? UserId { get; set; } // Nullable - NULL khi mới mời (chưa accept)

    public int RoleId { get; set; }

    public DateTime? JoinedAt { get; set; } // Nullable - Set khi accept invitation

    /// <summary>
    /// Trạng thái: Active (đã join), Pending (đang chờ accept), Declined (từ chối)
    /// </summary>
    public string Status { get; set; } = "Active";

    /// <summary>
    /// Token bảo mật để accept invitation (32 bytes base64, URL-safe)
    /// </summary>
    public string? InvitationToken { get; set; }

    /// <summary>
    /// User nào gửi lời mời (Farmer owner hoặc Admin)
    /// </summary>
    public int? InvitedByUserId { get; set; }

    /// <summary>
    /// Thời điểm gửi lời mời
    /// </summary>
    public DateTime? InvitedAt { get; set; }

    /// <summary>
    /// Token hết hạn khi nào (mặc định 7 ngày sau InvitedAt)
    /// </summary>
    public DateTime? TokenExpiresAt { get; set; }

    public virtual Garden Garden { get; set; } = null!;

    public virtual Role Role { get; set; } = null!;

    public virtual User? User { get; set; } // Nullable navigation

    public virtual User? InvitedByUser { get; set; } // Người mời
}
