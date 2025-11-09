using System;
using System.Collections.Generic;
using MamMoi.Api.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.DbContexts;

public partial class MamMoiDbContext : DbContext
{
    public MamMoiDbContext()
    {
    }

    public MamMoiDbContext(DbContextOptions<MamMoiDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AIConsultations> AIConsultations { get; set; }

    public virtual DbSet<AIRecommendations> AIRecommendations { get; set; }

    public virtual DbSet<ActivityLogs> ActivityLogs { get; set; }

    public virtual DbSet<CareSchedules> CareSchedules { get; set; }

    public virtual DbSet<DiseaseLibrary> DiseaseLibrary { get; set; }

    public virtual DbSet<GardenMembers> GardenMembers { get; set; }

    public virtual DbSet<GardenSoils> GardenSoils { get; set; }

    public virtual DbSet<Gardens> Gardens { get; set; }

    public virtual DbSet<Notifications> Notifications { get; set; }

    public virtual DbSet<Payments> Payments { get; set; }

    public virtual DbSet<Roles> Roles { get; set; }

    public virtual DbSet<SoilMaster> SoilMaster { get; set; }

    public virtual DbSet<Subscriptions> Subscriptions { get; set; }

    public virtual DbSet<SupportRequests> SupportRequests { get; set; }

    public virtual DbSet<SystemSettings> SystemSettings { get; set; }

    public virtual DbSet<TreeGrowthStages> TreeGrowthStages { get; set; }

    public virtual DbSet<TreeImages> TreeImages { get; set; }

    public virtual DbSet<TreeTypes> TreeTypes { get; set; }

    public virtual DbSet<Trees> Trees { get; set; }

    public virtual DbSet<Users> Users { get; set; }

    public virtual DbSet<WeatherAlerts> WeatherAlerts { get; set; }

    public virtual DbSet<WeatherHistories> WeatherHistories { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=.;Database=MamMoi;Trusted_Connection=True;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AIConsultations>(entity =>
        {
            entity.HasKey(e => e.ConsultationID).HasName("PK__AIConsul__5D014A78865D54D2");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Tree).WithMany(p => p.AIConsultations).HasConstraintName("FK_AIConsultations_Trees");

            entity.HasOne(d => d.User).WithMany(p => p.AIConsultations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_AIConsultations_Users");
        });

        modelBuilder.Entity<AIRecommendations>(entity =>
        {
            entity.HasKey(e => e.RecommendationID).HasName("PK__AIRecomm__AA15BEC4651CB3CD");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Consultation).WithMany(p => p.AIRecommendations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_AIRecommendations_Consultations");

            entity.HasOne(d => d.Tree).WithMany(p => p.AIRecommendations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_AIRecommendations_Trees");
        });

        modelBuilder.Entity<ActivityLogs>(entity =>
        {
            entity.HasKey(e => e.LogID).HasName("PK__Activity__5E5499A8844F6C46");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Tree).WithMany(p => p.ActivityLogs).HasConstraintName("FK_ActivityLogs_Trees");

            entity.HasOne(d => d.User).WithMany(p => p.ActivityLogs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ActivityLogs_Users");
        });

        modelBuilder.Entity<CareSchedules>(entity =>
        {
            entity.HasKey(e => e.ScheduleID).HasName("PK__CareSche__9C8A5B6981E427A7");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.CompletedByUser).WithMany(p => p.CareSchedules).HasConstraintName("FK_CareSchedules_CompletedByUser");

            entity.HasOne(d => d.ParentSchedule).WithMany(p => p.InverseParentSchedule).HasConstraintName("FK_CareSchedules_Parent");

            entity.HasOne(d => d.Tree).WithMany(p => p.CareSchedules)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CareSchedules_Trees");

            entity.HasOne(d => d.Weather).WithMany(p => p.CareSchedules).HasConstraintName("FK_CareSchedules_Weather");
        });

        modelBuilder.Entity<DiseaseLibrary>(entity =>
        {
            entity.HasKey(e => e.DiseaseID).HasName("PK__DiseaseL__69B533A9EFD04879");
        });

        modelBuilder.Entity<GardenMembers>(entity =>
        {
            entity.HasKey(e => e.MemberID).HasName("PK__GardenMe__0CF04B38D01547BB");

            entity.Property(e => e.JoinedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Garden).WithMany(p => p.GardenMembers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_GardenMembers_Gardens");

            entity.HasOne(d => d.Role).WithMany(p => p.GardenMembers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_GardenMembers_Roles");

            entity.HasOne(d => d.User).WithMany(p => p.GardenMembers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_GardenMembers_Users");
        });

        modelBuilder.Entity<GardenSoils>(entity =>
        {
            entity.HasKey(e => e.GardenSoilID).HasName("PK__GardenSo__0F59789AE293318B");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Garden).WithMany(p => p.GardenSoils).HasConstraintName("FK_GardenSoils_Gardens");

            entity.HasOne(d => d.SoilMaster).WithMany(p => p.GardenSoils)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_GardenSoils_SoilMaster");
        });

        modelBuilder.Entity<Gardens>(entity =>
        {
            entity.HasKey(e => e.GardenID).HasName("PK__Gardens__0191D063D2EF08B4");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.User).WithMany(p => p.Gardens)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Gardens_Users");
        });

        modelBuilder.Entity<Notifications>(entity =>
        {
            entity.HasKey(e => e.NotificationID).HasName("PK__Notifica__20CF2E32FEAF62CB");

            entity.Property(e => e.Priority).HasDefaultValue("Normal");
            entity.Property(e => e.SentAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Sent");

            entity.HasOne(d => d.Tree).WithMany(p => p.Notifications).HasConstraintName("FK_Notifications_Trees");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notifications_Users");
        });

        modelBuilder.Entity<Payments>(entity =>
        {
            entity.HasKey(e => e.PaymentID).HasName("PK__Payments__9B556A584A0C5C18");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Currency).HasDefaultValue("VND");
            entity.Property(e => e.PaymentDate).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Subscription).WithMany(p => p.Payments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Payments_Subscriptions");

            entity.HasOne(d => d.User).WithMany(p => p.Payments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Payments_Users");
        });

        modelBuilder.Entity<Roles>(entity =>
        {
            entity.HasKey(e => e.RoleID).HasName("PK__Roles__8AFACE3A5A7A0385");
        });

        modelBuilder.Entity<SoilMaster>(entity =>
        {
            entity.HasKey(e => e.SoilMasterID).HasName("PK__SoilMast__718F92EFEE168E84");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
        });

        modelBuilder.Entity<Subscriptions>(entity =>
        {
            entity.HasKey(e => e.SubscriptionID).HasName("PK__Subscrip__9A2B24BD6045279A");

            entity.Property(e => e.Currency).HasDefaultValue("VND");
            entity.Property(e => e.Status).HasDefaultValue("Active");

            entity.HasOne(d => d.User).WithMany(p => p.Subscriptions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Subscriptions_Users");
        });

        modelBuilder.Entity<SupportRequests>(entity =>
        {
            entity.HasKey(e => e.RequestID).HasName("PK__SupportR__33A8519A16A17E07");

            entity.Property(e => e.Priority).HasDefaultValue("Normal");
            entity.Property(e => e.RequestDate).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Open");

            entity.HasOne(d => d.Tree).WithMany(p => p.SupportRequests).HasConstraintName("FK_SupportRequests_Trees");

            entity.HasOne(d => d.User).WithMany(p => p.SupportRequests)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SupportRequests_Users");
        });

        modelBuilder.Entity<SystemSettings>(entity =>
        {
            entity.HasKey(e => e.SettingID).HasName("PK__SystemSe__54372AFDCC0B0B01");

            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.User).WithMany(p => p.SystemSettings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SystemSettings_Users");
        });

        modelBuilder.Entity<TreeGrowthStages>(entity =>
        {
            entity.HasKey(e => e.StageID).HasName("PK__TreeGrow__03EB7AF811E1A760");

            entity.Property(e => e.VulnerabilityLevel).HasDefaultValue(5);

            entity.HasOne(d => d.TreeType).WithMany(p => p.TreeGrowthStages)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TreeGrowthStages_TreeTypes");
        });

        modelBuilder.Entity<TreeImages>(entity =>
        {
            entity.HasKey(e => e.ImageID).HasName("PK__TreeImag__7516F4EC4C9A676B");

            entity.HasOne(d => d.Tree).WithMany(p => p.TreeImages)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TreeImages_Trees");
        });

        modelBuilder.Entity<TreeTypes>(entity =>
        {
            entity.HasKey(e => e.TreeTypeID).HasName("PK__TreeType__7AD87BF47D585709");

            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.SoilMaster).WithMany(p => p.TreeTypes)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TreeTypes_SoilMaster");
        });

        modelBuilder.Entity<Trees>(entity =>
        {
            entity.HasKey(e => e.TreeID).HasName("PK__Trees__35F324C5FDBF8B8A");

            entity.ToTable(tb =>
                {
                    tb.HasTrigger("TR_Trees_GardenSoil_Check");
                    tb.HasTrigger("TR_Trees_StageType_Check");
                });

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.FertilizingFrequencyDays).HasDefaultValue(30);
            entity.Property(e => e.HealthStatus).HasDefaultValue("Healthy");
            entity.Property(e => e.MaxWateringIntervalDays).HasDefaultValue(21);
            entity.Property(e => e.MinWateringIntervalDays).HasDefaultValue(3);
            entity.Property(e => e.WateringFrequencyDays).HasDefaultValue(7);

            entity.HasOne(d => d.Garden).WithMany(p => p.Trees)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Trees_Gardens");

            entity.HasOne(d => d.GardenSoil).WithMany(p => p.Trees).HasConstraintName("FK_Trees_GardenSoils");

            entity.HasOne(d => d.Stage).WithMany(p => p.Trees)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Trees_Stages");

            entity.HasOne(d => d.TreeType).WithMany(p => p.Trees)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Trees_TreeTypes");

            entity.HasOne(d => d.User).WithMany(p => p.Trees)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Trees_Users");

            entity.HasMany(d => d.Disease).WithMany(p => p.Tree)
                .UsingEntity<Dictionary<string, object>>(
                    "Trees_DiseaseLibrary",
                    r => r.HasOne<DiseaseLibrary>().WithMany()
                        .HasForeignKey("DiseaseID")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_TreesDiseases_Diseases"),
                    l => l.HasOne<Trees>().WithMany()
                        .HasForeignKey("TreeID")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_TreesDiseases_Trees"),
                    j =>
                    {
                        j.HasKey("TreeID", "DiseaseID").HasName("PK__Trees_Di__B36877FFCACE859F");
                    });
        });

        modelBuilder.Entity<Users>(entity =>
        {
            entity.HasKey(e => e.UserID).HasName("PK__Users__1788CCACF717C3C6");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Users_Roles");
        });

        modelBuilder.Entity<WeatherAlerts>(entity =>
        {
            entity.HasKey(e => e.AlertID).HasName("PK__WeatherA__EBB16AEDFBB4C949");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Active");

            entity.HasOne(d => d.Tree).WithMany(p => p.WeatherAlerts)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_WeatherAlerts_Trees");

            entity.HasOne(d => d.User).WithMany(p => p.WeatherAlerts)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_WeatherAlerts_Users");
        });

        modelBuilder.Entity<WeatherHistories>(entity =>
        {
            entity.HasKey(e => e.WeatherID).HasName("PK__WeatherH__0BF97BD53E213AF8");

            entity.HasOne(d => d.Tree).WithMany(p => p.WeatherHistories)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_WeatherHistories_Trees");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
