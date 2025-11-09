using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

[Index("Email", Name = "IX_Users_Email")]
[Index("Email", Name = "UQ__Users__A9D10534DFFADDE2", IsUnique = true)]
public partial class Users
{
    [Key]
    public int UserID { get; set; }

    public int RoleID { get; set; }

    [StringLength(100)]
    public string FullName { get; set; } = null!;

    [StringLength(254)]
    [Unicode(false)]
    public string Email { get; set; } = null!;

    [MaxLength(512)]
    public byte[] PasswordHash { get; set; } = null!;

    [StringLength(20)]
    public string? Phone { get; set; }

    [StringLength(255)]
    public string? Address { get; set; }

    [StringLength(255)]
    public string? ProfileImageUrl { get; set; }

    [StringLength(50)]
    public string? ExperienceLevel { get; set; }

    [StringLength(10)]
    public string? PreferredLanguage { get; set; }

    public string? NotificationPreferences { get; set; }

    public bool IsActive { get; set; }

    [Precision(0)]
    public DateTime? LastLoginAt { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [Precision(0)]
    public DateTime? UpdatedAt { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<AIConsultations> AIConsultations { get; set; } = new List<AIConsultations>();

    [InverseProperty("User")]
    public virtual ICollection<ActivityLogs> ActivityLogs { get; set; } = new List<ActivityLogs>();

    [InverseProperty("CompletedByUser")]
    public virtual ICollection<CareSchedules> CareSchedules { get; set; } = new List<CareSchedules>();

    [InverseProperty("User")]
    public virtual ICollection<GardenMembers> GardenMembers { get; set; } = new List<GardenMembers>();

    [InverseProperty("User")]
    public virtual ICollection<Gardens> Gardens { get; set; } = new List<Gardens>();

    [InverseProperty("User")]
    public virtual ICollection<Notifications> Notifications { get; set; } = new List<Notifications>();

    [InverseProperty("User")]
    public virtual ICollection<Payments> Payments { get; set; } = new List<Payments>();

    [ForeignKey("RoleID")]
    [InverseProperty("Users")]
    public virtual Roles Role { get; set; } = null!;

    [InverseProperty("User")]
    public virtual ICollection<Subscriptions> Subscriptions { get; set; } = new List<Subscriptions>();

    [InverseProperty("User")]
    public virtual ICollection<SupportRequests> SupportRequests { get; set; } = new List<SupportRequests>();

    [InverseProperty("User")]
    public virtual ICollection<SystemSettings> SystemSettings { get; set; } = new List<SystemSettings>();

    [InverseProperty("User")]
    public virtual ICollection<Trees> Trees { get; set; } = new List<Trees>();

    [InverseProperty("User")]
    public virtual ICollection<WeatherAlerts> WeatherAlerts { get; set; } = new List<WeatherAlerts>();
}
