using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class User
{
    public int UserId { get; set; }

    public int RoleId { get; set; }
    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public byte[] PasswordHash { get; set; } = null!;

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public string? ProfileImageUrl { get; set; }

    public string? ExperienceLevel { get; set; }

    public string? PreferredLanguage { get; set; }

    public string? NotificationPreferences { get; set; }

    public bool IsActive { get; set; }

    public DateTime? LastLoginAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();

    public virtual ICollection<Aiconsultation> Aiconsultations { get; set; } = new List<Aiconsultation>();

    public virtual ICollection<CareSchedule> CareSchedules { get; set; } = new List<CareSchedule>();

    public virtual ICollection<GardenMember> GardenMembers { get; set; } = new List<GardenMember>();

    public virtual ICollection<Garden> Gardens { get; set; } = new List<Garden>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Role Role { get; set; } = null!;

    public virtual ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();

    public virtual ICollection<SupportRequest> SupportRequests { get; set; } = new List<SupportRequest>();

    public virtual ICollection<SystemSetting> SystemSettings { get; set; } = new List<SystemSetting>();

    public virtual ICollection<Tree> Trees { get; set; } = new List<Tree>();

    public virtual ICollection<WeatherAlert> WeatherAlerts { get; set; } = new List<WeatherAlert>();
}
