using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Infrastructure.Models;

public partial class MamMoiDbContext : DbContext
{
      public MamMoiDbContext() { }

      public MamMoiDbContext(DbContextOptions<MamMoiDbContext> options)
          : base(options) { }

      public virtual DbSet<ActivityLog> ActivityLogs { get; set; }
      public virtual DbSet<Aiconsultation> Aiconsultations { get; set; }
      public virtual DbSet<Airecommendation> Airecommendations { get; set; }
      public virtual DbSet<CareSchedule> CareSchedules { get; set; }
      public virtual DbSet<DiseaseLibrary> DiseaseLibraries { get; set; }
      public virtual DbSet<Garden> Gardens { get; set; }
      public virtual DbSet<GardenMember> GardenMembers { get; set; }
      public virtual DbSet<GardenSoil> GardenSoils { get; set; }
      public virtual DbSet<Notification> Notifications { get; set; }
      public virtual DbSet<Payment> Payments { get; set; }
      public virtual DbSet<Role> Roles { get; set; }
      public virtual DbSet<SoilMaster> SoilMasters { get; set; }
      public virtual DbSet<Subscription> Subscriptions { get; set; }
      public virtual DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
      public virtual DbSet<SupportRequest> SupportRequests { get; set; }
      public virtual DbSet<SystemSetting> SystemSettings { get; set; }
      public virtual DbSet<Tree> Trees { get; set; }
      public virtual DbSet<TreeGrowthStage> TreeGrowthStages { get; set; }
      public virtual DbSet<TreeImage> TreeImages { get; set; }
      public virtual DbSet<TreeType> TreeTypes { get; set; }
      public virtual DbSet<TreeVariety> TreeVarietys { get; set; }
      public virtual DbSet<User> Users { get; set; }
      public virtual DbSet<WeatherAlert> WeatherAlerts { get; set; }
      public virtual DbSet<WeatherHistory> WeatherHistories { get; set; }

      protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) { }

      protected override void OnModelCreating(ModelBuilder modelBuilder)
      {
            // ===== ActivityLog =====
            modelBuilder.Entity<ActivityLog>(entity =>
            {
                  entity.HasKey(e => e.LogId).HasName("PK__Activity__5E5499A8EA104B36");
                  entity.Property(e => e.LogId).HasColumnName("LogID");
                  entity.Property(e => e.ActivityDescription).HasMaxLength(500);
                  entity.Property(e => e.ActivityType).HasMaxLength(50);
                  entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
                  entity.Property(e => e.EntityId).HasColumnName("EntityID");
                  entity.Property(e => e.EntityType).HasMaxLength(50);
                  entity.Property(e => e.TreeId).HasColumnName("TreeID");
                  entity.Property(e => e.UserAgent).HasMaxLength(500);
                  entity.Property(e => e.UserId).HasColumnName("UserID");

                  entity.HasOne(d => d.Tree).WithMany(p => p.ActivityLogs)
                    .HasForeignKey(d => d.TreeId)
                    .HasConstraintName("FK_ActivityLogs_Trees");

                  entity.HasOne(d => d.User).WithMany(p => p.ActivityLogs)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ActivityLogs_Users");
            });

            // ===== AIConsultations =====
            modelBuilder.Entity<Aiconsultation>(entity =>
            {
                  entity.HasKey(e => e.ConsultationId).HasName("PK__AIConsul__5D014A78AC1C9BDC");
                  entity.ToTable("AIConsultations");

                  entity.Property(e => e.ConsultationId).HasColumnName("ConsultationID");
                  entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
                  entity.Property(e => e.Model).HasMaxLength(100);
                  entity.Property(e => e.PromptInput).HasMaxLength(1000);
                  entity.Property(e => e.TreeId).HasColumnName("TreeID");
                  entity.Property(e => e.UserId).HasColumnName("UserID");

                  entity.HasOne(d => d.Tree).WithMany(p => p.Aiconsultations)
                    .HasForeignKey(d => d.TreeId)
                    .HasConstraintName("FK_AIConsultations_Trees");

                  entity.HasOne(d => d.User).WithMany(p => p.Aiconsultations)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_AIConsultations_Users");
            });

            // ===== AIRecommendations =====
            modelBuilder.Entity<Airecommendation>(entity =>
            {
                  entity.HasKey(e => e.RecommendationId).HasName("PK__AIRecomm__AA15BEC474D95980");
                  entity.ToTable("AIRecommendations");

                  entity.Property(e => e.RecommendationId).HasColumnName("RecommendationID");
                  entity.Property(e => e.Confidence).HasColumnType("decimal(4, 2)");
                  entity.Property(e => e.ConsultationId).HasColumnName("ConsultationID");
                  entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
                  entity.Property(e => e.TreeId).HasColumnName("TreeID");

                  entity.HasOne(d => d.Consultation).WithMany(p => p.Airecommendations)
                    .HasForeignKey(d => d.ConsultationId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_AIRecommendations_Consultations");

                  entity.HasOne(d => d.Tree).WithMany(p => p.Airecommendations)
                    .HasForeignKey(d => d.TreeId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_AIRecommendations_Trees");
            });

            // ===== CareSchedule =====
            modelBuilder.Entity<CareSchedule>(entity =>
            {
                  entity.HasKey(e => e.ScheduleId).HasName("PK__CareSche__9C8A5B691E493D0F");

                  entity.Property(e => e.ScheduleId).HasColumnName("ScheduleID");
                  entity.Property(e => e.ActualFertilizerAmountGrams).HasColumnType("decimal(6, 2)");
                  entity.Property(e => e.ActualWaterAmountLiters).HasColumnType("decimal(5, 2)");
                  entity.Property(e => e.AdjustmentReason).HasMaxLength(500);
                  entity.Property(e => e.AirecommendationId).HasColumnName("AIRecommendationID");
                  entity.Property(e => e.ApplicationMethod).HasMaxLength(100);
                  entity.Property(e => e.CompletedAt).HasPrecision(0);
                  entity.Property(e => e.CompletedByUserId).HasColumnName("CompletedByUserID");
                  entity.Property(e => e.CompletionNotes).HasMaxLength(1000);
                  entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
                  entity.Property(e => e.Description).HasMaxLength(1000);
                  entity.Property(e => e.FertilizerType).HasMaxLength(100);
                  entity.Property(e => e.ForecastHumidityPct).HasColumnType("decimal(5, 2)");
                  entity.Property(e => e.ForecastRainAmountMm).HasColumnType("decimal(5, 2)");
                  entity.Property(e => e.ForecastTemperatureC).HasColumnType("decimal(5, 2)");
                  entity.Property(e => e.GeneratedByAi).HasColumnName("GeneratedByAI");
                  entity.Property(e => e.GenerationReason).HasMaxLength(500);
                  entity.Property(e => e.Notes).HasMaxLength(1000);
                  entity.Property(e => e.NotificationSentAt).HasPrecision(0);
                  entity.Property(e => e.ParentScheduleId).HasColumnName("ParentScheduleID");
                  entity.Property(e => e.Priority).HasMaxLength(20);
                  entity.Property(e => e.PruningNotes).HasMaxLength(500);
                  entity.Property(e => e.PruningType).HasMaxLength(50);
                  entity.Property(e => e.RecurrencePattern).HasMaxLength(100);
                  entity.Property(e => e.ScheduledTimeOfDay).HasMaxLength(20);
                  entity.Property(e => e.Status).HasMaxLength(50);
                  entity.Property(e => e.TaskName).HasMaxLength(200);
                  entity.Property(e => e.TaskType).HasMaxLength(50);
                  entity.Property(e => e.TreeId).HasColumnName("TreeID");
                  entity.Property(e => e.UpdatedAt).HasPrecision(0);
                  entity.Property(e => e.WaterAmountLiters).HasColumnType("decimal(5, 2)");
                  entity.Property(e => e.WaterSource).HasMaxLength(50);
                  entity.Property(e => e.WeatherId).HasColumnName("WeatherID");

                  entity.HasOne(d => d.CompletedByUser).WithMany(p => p.CareSchedules)
                    .HasForeignKey(d => d.CompletedByUserId)
                    .HasConstraintName("FK_CareSchedules_CompletedByUser");

                  entity.HasOne(d => d.ParentSchedule).WithMany(p => p.InverseParentSchedule)
                    .HasForeignKey(d => d.ParentScheduleId)
                    .HasConstraintName("FK_CareSchedules_Parent");

                  entity.HasOne(d => d.Tree).WithMany(p => p.CareSchedules)
                    .HasForeignKey(d => d.TreeId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_CareSchedules_Trees");

                  entity.HasOne(d => d.Weather).WithMany(p => p.CareSchedules)
                    .HasForeignKey(d => d.WeatherId)
                    .HasConstraintName("FK_CareSchedules_Weather");
            });

            // ===== DiseaseLibrary =====
            modelBuilder.Entity<DiseaseLibrary>(entity =>
            {
                  entity.HasKey(e => e.DiseaseId).HasName("PK__DiseaseL__69B533A947E42678");
                  entity.ToTable("DiseaseLibrary");

                  entity.HasIndex(e => e.DiseaseName, "UQ__DiseaseL__5112584D63916352").IsUnique();

                  entity.Property(e => e.DiseaseId).HasColumnName("DiseaseID");
                  entity.Property(e => e.AffectedParts).HasMaxLength(200);
                  entity.Property(e => e.Category).HasMaxLength(50);
                  entity.Property(e => e.DiseaseName).HasMaxLength(100);
                  entity.Property(e => e.RecoveryTime).HasMaxLength(100);
                  entity.Property(e => e.ScientificName).HasMaxLength(150);
                  entity.Property(e => e.Severity).HasMaxLength(20);
                  entity.Property(e => e.SpreadRate).HasMaxLength(20);
            });

            // ===== Garden =====
            modelBuilder.Entity<Garden>(entity =>
            {
                  entity.HasKey(e => e.GardenId).HasName("PK__Gardens__0191D06386E37FE1");
                  entity.HasIndex(e => e.UserId, "IX_Gardens_UserID");

                  entity.Property(e => e.GardenId).HasColumnName("GardenID");
                  entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
                  entity.Property(e => e.Location).HasMaxLength(255);
                  entity.Property(e => e.Name).HasMaxLength(100);
                  entity.Property(e => e.UserId).HasColumnName("UserID");

                  entity.HasOne(d => d.User).WithMany(p => p.Gardens)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Gardens_Users");
            });

            // ===== GardenMember =====
            modelBuilder.Entity<GardenMember>(entity =>
            {
                  entity.HasKey(e => e.MemberId).HasName("PK__GardenMe__0CF04B388796EAFE");
                  entity.HasIndex(e => new { e.GardenId, e.UserId }, "UX_GardenMembers_Garden_User").IsUnique();

                  entity.Property(e => e.MemberId).HasColumnName("MemberID");
                  entity.Property(e => e.GardenId).HasColumnName("GardenID");
                  entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
                  entity.Property(e => e.RoleId).HasColumnName("RoleID");
                  entity.Property(e => e.Status).HasMaxLength(50);
                  entity.Property(e => e.UserId).HasColumnName("UserID");

                  entity.HasOne(d => d.Garden).WithMany(p => p.GardenMembers)
                    .HasForeignKey(d => d.GardenId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_GardenMembers_Gardens");

                  entity.HasOne(d => d.Role).WithMany(p => p.GardenMembers)
                    .HasForeignKey(d => d.RoleId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_GardenMembers_Roles");

                  entity.HasOne(d => d.User).WithMany(p => p.GardenMembers)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_GardenMembers_Users");
            });

            // ===== GardenSoil =====
            modelBuilder.Entity<GardenSoil>(entity =>
            {
                  entity.HasKey(e => e.GardenSoilId).HasName("PK__GardenSo__0F59789AA27099DF");
                  entity.HasIndex(e => e.GardenId, "IX_GardenSoils_GardenID");
                  entity.HasIndex(e => new { e.GardenId, e.SoilMasterId }, "UX_GardenSoils_Garden_Soil").IsUnique();

                  entity.Property(e => e.GardenSoilId).HasColumnName("GardenSoilID");
                  entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
                  entity.Property(e => e.CustomLabel).HasMaxLength(100);
                  entity.Property(e => e.GardenId).HasColumnName("GardenID");
                  entity.Property(e => e.Notes).HasMaxLength(255);
                  entity.Property(e => e.SoilMasterId).HasColumnName("SoilMasterID");

                  entity.HasOne(d => d.Garden).WithMany(p => p.GardenSoils)
                    .HasForeignKey(d => d.GardenId)
                    .HasConstraintName("FK_GardenSoils_Gardens");

                  entity.HasOne(d => d.SoilMaster).WithMany(p => p.GardenSoils)
                    .HasForeignKey(d => d.SoilMasterId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_GardenSoils_SoilMaster");
            });

            // ===== Notification =====
            modelBuilder.Entity<Notification>(entity =>
            {
                  entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E3207EAF6A7");
                  entity.HasIndex(e => e.UserId, "IX_Notifications_UserID");

                  entity.Property(e => e.NotificationId).HasColumnName("NotificationID");
                  entity.Property(e => e.ActionDeadline).HasPrecision(0);
                  entity.Property(e => e.ActionLabel).HasMaxLength(100);
                  entity.Property(e => e.ActionUrl).HasMaxLength(500);
                  entity.Property(e => e.Category).HasMaxLength(50);
                  entity.Property(e => e.DeliveredAt).HasPrecision(0);
                  entity.Property(e => e.DeliveryMethod).HasMaxLength(50);
                  entity.Property(e => e.ExpiresAt).HasPrecision(0);
                  entity.Property(e => e.GroupId).HasMaxLength(100).HasColumnName("GroupID");
                  entity.Property(e => e.IconName).HasMaxLength(50);
                  entity.Property(e => e.ImageUrl).HasMaxLength(500);
                  entity.Property(e => e.Message).HasMaxLength(1000);
                  entity.Property(e => e.NotificationType).HasMaxLength(50);
                  entity.Property(e => e.Priority).HasMaxLength(20).HasDefaultValue("Normal");
                  entity.Property(e => e.ReadAt).HasPrecision(0);
                  entity.Property(e => e.RelatedEntityId).HasColumnName("RelatedEntityID");
                  entity.Property(e => e.RelatedEntityType).HasMaxLength(50);
                  entity.Property(e => e.ReminderTime).HasPrecision(0);
                  entity.Property(e => e.SentAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
                  entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("Sent");
                  entity.Property(e => e.Title).HasMaxLength(200);
                  entity.Property(e => e.TreeId).HasColumnName("TreeID");
                  entity.Property(e => e.UserId).HasColumnName("UserID");

                  entity.HasOne(d => d.Tree).WithMany(p => p.Notifications)
                    .HasForeignKey(d => d.TreeId)
                    .HasConstraintName("FK_Notifications_Trees");

                  entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Notifications_Users");
            });

            // ===== Payment =====
            modelBuilder.Entity<Payment>(entity =>
            {
                  entity.HasKey(e => e.PaymentId).HasName("PK__Payments__9B556A58A4D73B43");
                  entity.HasIndex(e => e.UserId, "IX_Payments_UserID");

                  entity.Property(e => e.PaymentId).HasColumnName("PaymentID");
                  entity.Property(e => e.Amount).HasColumnType("decimal(10, 2)");
                  entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
                  entity.Property(e => e.Currency).HasMaxLength(10).HasDefaultValue("VND");
                  entity.Property(e => e.Description).HasMaxLength(500);
                  entity.Property(e => e.InvoiceNumber).HasMaxLength(50);
                  entity.Property(e => e.InvoiceUrl).HasMaxLength(500);
                  entity.Property(e => e.Ipaddress).HasMaxLength(50).HasColumnName("IPAddress");
                  entity.Property(e => e.PaymentDate).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
                  entity.Property(e => e.PaymentMethod).HasMaxLength(50);
                  entity.Property(e => e.PaymentProvider).HasMaxLength(50);
                  entity.Property(e => e.ProviderTransactionId).HasMaxLength(200).HasColumnName("ProviderTransactionID");
                  entity.Property(e => e.ReceiptUrl).HasMaxLength(500);
                  entity.Property(e => e.RefundAmount).HasColumnType("decimal(10, 2)");
                  entity.Property(e => e.RefundDate).HasPrecision(0);
                  entity.Property(e => e.RefundReason).HasMaxLength(500);
                  entity.Property(e => e.SubscriptionId).HasColumnName("SubscriptionID");
                  entity.Property(e => e.TransactionId).HasMaxLength(100).HasColumnName("TransactionID");
                  entity.Property(e => e.TransactionStatus).HasMaxLength(50);
                  entity.Property(e => e.UserAgent).HasMaxLength(500);
                  entity.Property(e => e.UserId).HasColumnName("UserID");

                  entity.HasOne(d => d.Subscription).WithMany(p => p.Payments)
                    .HasForeignKey(d => d.SubscriptionId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Payments_Subscriptions");

                  entity.HasOne(d => d.User).WithMany(p => p.Payments)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Payments_Users");
            });

            // ===== Role =====
            modelBuilder.Entity<Role>(entity =>
            {
                  entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE3A2CC7014C");
                  entity.Property(e => e.RoleId).HasColumnName("RoleID");
                  entity.Property(e => e.RoleName).HasMaxLength(100);
            });

            // ===== SoilMaster =====
            modelBuilder.Entity<SoilMaster>(entity =>
            {
                  entity.HasKey(e => e.SoilMasterId).HasName("PK__SoilMast__718F92EF3838A7B3");
                  entity.ToTable("SoilMaster");

                  entity.HasIndex(e => e.SoilName, "UQ_SoilMaster_SoilName").IsUnique();

                  entity.Property(e => e.SoilMasterId).HasColumnName("SoilMasterID");
                  entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
                  entity.Property(e => e.Drainage).HasMaxLength(20);
                  entity.Property(e => e.EcDSM).HasColumnType("decimal(5, 2)").HasColumnName("EC_dS_m");
                  entity.Property(e => e.Notes).HasMaxLength(255);
                  entity.Property(e => e.OrganicMatterPct).HasColumnType("decimal(4, 1)");
                  entity.Property(e => e.SoilName).HasMaxLength(100);
                  entity.Property(e => e.Texture).HasMaxLength(20);
                  entity.Property(e => e.UpdatedAt).HasPrecision(0);
            });

            // ===== Subscription =====
            modelBuilder.Entity<Subscription>(entity =>
            {
                  entity.HasKey(e => e.SubscriptionId).HasName("PK__Subscrip__9A2B24BD93D76F91");

                  entity.Property(e => e.SubscriptionId).HasColumnName("SubscriptionID");
                  entity.Property(e => e.Currency).HasMaxLength(10).HasDefaultValue("VND");
                  entity.Property(e => e.PlanName).HasMaxLength(100);
                  entity.Property(e => e.PlanType).HasMaxLength(50);
                  entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
                  entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("Active");
                  entity.Property(e => e.UserId).HasColumnName("UserID");

                  entity.HasOne(d => d.User).WithMany(p => p.Subscriptions)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Subscriptions_Users");
            });

            // ===== SubscriptionPlan =====
            modelBuilder.Entity<SubscriptionPlan>(entity =>
            {
                  entity.HasKey(e => e.PlanId).HasName("PK__Subscrip__755C22D7A1B2C3D4");
                  entity.ToTable("SubscriptionPlans");

                  entity.HasIndex(e => e.PlanName, "UQ_SubscriptionPlans_PlanName").IsUnique();

                  entity.Property(e => e.PlanId).HasColumnName("PlanID");
                  entity.Property(e => e.PlanName).HasMaxLength(100);
                  entity.Property(e => e.PlanType).HasMaxLength(50);
                  entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
                  entity.Property(e => e.Currency).HasMaxLength(10).HasDefaultValue("VND");
                  entity.Property(e => e.Description).HasMaxLength(500);
                  entity.Property(e => e.Features).HasMaxLength(int.MaxValue);
                  entity.Property(e => e.MaxGardens).HasColumnName("MaxGardens");
                  entity.Property(e => e.MaxTreesPerGarden).HasColumnName("MaxTreesPerGarden");
                  entity.Property(e => e.DurationInMonths).HasColumnName("DurationInMonths");
                  entity.Property(e => e.IsActive).HasDefaultValue(true);
            });

            // ===== SupportRequest =====
            modelBuilder.Entity<SupportRequest>(entity =>
            {
                  entity.HasKey(e => e.RequestId).HasName("PK__SupportR__33A8519A33716DDD");
                  entity.HasIndex(e => e.UserId, "IX_Support_UserID");

                  entity.Property(e => e.RequestId).HasColumnName("RequestID");
                  entity.Property(e => e.Category).HasMaxLength(50);
                  entity.Property(e => e.ClosedAt).HasPrecision(0);
                  entity.Property(e => e.Feedback).HasMaxLength(1000);
                  entity.Property(e => e.FeedbackDate).HasPrecision(0);
                  entity.Property(e => e.Priority).HasMaxLength(20).HasDefaultValue("Normal");
                  entity.Property(e => e.RequestDate).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
                  entity.Property(e => e.ResolvedAt).HasPrecision(0);
                  entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("Open");
                  entity.Property(e => e.Subject).HasMaxLength(200);
                  entity.Property(e => e.TicketNumber).HasMaxLength(50);
                  entity.Property(e => e.TreeId).HasColumnName("TreeID");
                  entity.Property(e => e.UserId).HasColumnName("UserID");

                  entity.HasOne(d => d.Tree).WithMany(p => p.SupportRequests)
                    .HasForeignKey(d => d.TreeId)
                    .HasConstraintName("FK_SupportRequests_Trees");

                  entity.HasOne(d => d.User).WithMany(p => p.SupportRequests)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SupportRequests_Users");
            });

            // ===== SystemSetting =====
            modelBuilder.Entity<SystemSetting>(entity =>
            {
                  entity.HasKey(e => e.SettingId).HasName("PK__SystemSe__54372AFD37C693D6");
                  entity.HasIndex(e => e.SettingKey, "UQ__SystemSe__01E719ADBCBA1026").IsUnique();

                  entity.Property(e => e.SettingId).HasColumnName("SettingID");
                  entity.Property(e => e.Category).HasMaxLength(50);
                  entity.Property(e => e.DataType).HasMaxLength(20);
                  entity.Property(e => e.Description).HasMaxLength(500);
                  entity.Property(e => e.SettingKey).HasMaxLength(100);
                  entity.Property(e => e.UpdatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
                  entity.Property(e => e.UserId).HasColumnName("UserID");

                  entity.HasOne(d => d.User).WithMany(p => p.SystemSettings)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SystemSettings_Users");
            });

            // ===== Tree =====
            modelBuilder.Entity<Tree>(entity =>
            {
                  entity.HasKey(e => e.TreeId).HasName("PK__Trees__35F324C5891BA846");

                  entity.ToTable(tb =>
              {
                      tb.HasTrigger("TR_Trees_GardenSoil_Check");
                      tb.HasTrigger("TR_Trees_StageType_Check");
                });

                  entity.HasIndex(e => e.GardenId, "IX_Trees_GardenID");
                  entity.HasIndex(e => e.StageId, "IX_Trees_StageID");
                  entity.HasIndex(e => e.TreeTypeId, "IX_Trees_TreeTypeID");
                  entity.HasIndex(e => e.UserId, "IX_Trees_UserID");

                  entity.Property(e => e.TreeId).HasColumnName("TreeID");
                  entity.Property(e => e.GardenId).HasColumnName("GardenID");
                  entity.Property(e => e.UserId).HasColumnName("UserID");
                  entity.Property(e => e.TreeTypeId).HasColumnName("TreeTypeID");
                  entity.Property(e => e.StageId).HasColumnName("StageID");
                  entity.Property(e => e.GardenSoilId).HasColumnName("GardenSoilID");

                  entity.Property(e => e.TreeCode).HasMaxLength(50);
                  entity.Property(e => e.TreeName).HasMaxLength(100);

                  entity.Property(e => e.PlantDate).HasColumnType("date");
                  entity.Property(e => e.ExpectedHarvestDate).HasColumnType("date");

                  entity.Property(e => e.Location).HasMaxLength(255);
                  entity.Property(e => e.QrcodeUrl).HasMaxLength(500).HasColumnName("QRCodeUrl");

                  entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
                  entity.Property(e => e.UpdatedAt).HasPrecision(0);

                  entity.HasOne(d => d.Garden).WithMany(p => p.Trees)
                    .HasForeignKey(d => d.GardenId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Trees_Gardens");

                  entity.HasOne(d => d.GardenSoil).WithMany(p => p.Trees)
                    .HasForeignKey(d => d.GardenSoilId)
                    .HasConstraintName("FK_Trees_GardenSoils");

                  entity.HasOne(d => d.Stage).WithMany(p => p.Trees)
                    .HasForeignKey(d => d.StageId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Trees_Stages");

                  entity.HasOne(d => d.TreeType).WithMany(p => p.Trees)
                    .HasForeignKey(d => d.TreeTypeId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Trees_TreeTypes");

                  entity.HasOne(d => d.User).WithMany(p => p.Trees)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Trees_Users");

                  entity.HasMany(d => d.Diseases).WithMany(p => p.Trees)
                  .UsingEntity<Dictionary<string, object>>(
                      "TreesDiseaseLibrary",
                      r => r.HasOne<DiseaseLibrary>().WithMany()
                            .HasForeignKey("DiseaseId")
                            .OnDelete(DeleteBehavior.ClientSetNull)
                            .HasConstraintName("FK_TreesDiseases_Diseases"),
                      l => l.HasOne<Tree>().WithMany()
                            .HasForeignKey("TreeId")
                            .OnDelete(DeleteBehavior.ClientSetNull)
                            .HasConstraintName("FK_TreesDiseases_Trees"),
                      j =>
                      {
                              j.HasKey("TreeId", "DiseaseId").HasName("PK__Trees_Di__B36877FFDE6E965D");
                              j.ToTable("Trees_DiseaseLibrary");
                              j.IndexerProperty<int>("TreeId").HasColumnName("TreeID");
                              j.IndexerProperty<int>("DiseaseId").HasColumnName("DiseaseID");
                        });
            });

            // ===== TreeVariety =====
            modelBuilder.Entity<TreeVariety>(entity =>
            {
                  entity.ToTable("TreeVariety");

                  entity.HasKey(e => e.VarietyId)
                    .HasName("PK_TreeVariety");

                  entity.Property(e => e.VarietyId)
                    .HasColumnName("VarietyID")
                    .ValueGeneratedOnAdd();

                  // TreeTypeId (nullable FK)
                  entity.Property(e => e.TreeTypeId)
                    .HasColumnName("TreeTypeID");

                  // VarietyName nvarchar(255) nullable
                  entity.Property(e => e.VarietyName)
                    .HasColumnName("VarietyName")
                    .HasColumnType("nvarchar(255)")
                    .HasMaxLength(255);

                  // VarietyDescription nvarchar(max) nullable
                  entity.Property(e => e.VarietyDescription)
                    .HasColumnName("VarietyDescription")
                    .HasColumnType("nvarchar(max)");

                  // Relationship: TreeVariety -> TreeTypes (optional)
                  entity.HasOne(d => d.TreeType)              // navigation property on TreeVariety
                    .WithMany(p => p.TreeVarieties)          // navigation collection on TreeType (adjust name if different)
                    .HasForeignKey(d => d.TreeTypeId)
                    .HasConstraintName("FK_TreeVariety_TreeTypes")
                    .OnDelete(DeleteBehavior.Restrict); // choose behavior you want (Restrict/SetNull/Cascade)

                  // Optional: inverse FK from Trees -> TreeVariety is typically configured on Tree entity,
                  // but you can declare the inverse here if you have navigation from TreeVariety to Trees:
                  entity.HasMany(e => e.Trees)               // navigation collection on TreeVariety
                    .WithOne(t => t.TreeVariety)             // navigation on Tree
                    .HasForeignKey(t => t.VarietyId)
                    .HasConstraintName("FK_Trees_TreeVariety")
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ===== TreeGrowthStage =====
            modelBuilder.Entity<TreeGrowthStage>(entity =>
            {
                  entity.HasKey(e => e.StageId).HasName("PK__TreeGrow__03EB7AF8C13E413E");
                  entity.HasIndex(e => e.TreeTypeId, "IX_TreeGrowth_TreeTypeID");
                  entity.HasIndex(e => new { e.TreeTypeId, e.StageOrder }, "UX_TreeGrowthStages_TreeType_StageOrder").IsUnique();

                  entity.Property(e => e.StageId).HasColumnName("StageID");
                  entity.Property(e => e.Description).HasMaxLength(500);
                  entity.Property(e => e.FertilizerAmountGrams).HasColumnType("decimal(6, 2)");
                  entity.Property(e => e.FertilizerType).HasMaxLength(50);
                  entity.Property(e => e.ImageUrl).HasMaxLength(500);
                  entity.Property(e => e.StageName).HasMaxLength(100);
                  entity.Property(e => e.TreeTypeId).HasColumnName("TreeTypeID");
                  entity.Property(e => e.VulnerabilityLevel).HasDefaultValue(5);
                  entity.Property(e => e.WateringAmountLiters).HasColumnType("decimal(5, 2)");

                  entity.HasOne(d => d.TreeType).WithMany(p => p.TreeGrowthStages)
                    .HasForeignKey(d => d.TreeTypeId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_TreeGrowthStages_TreeTypes");
            });

            // ===== TreeImage =====
            modelBuilder.Entity<TreeImage>(entity =>
            {
                  entity.HasKey(e => e.ImageId).HasName("PK__TreeImag__7516F4ECE522FC93");

                  entity.Property(e => e.ImageId).HasColumnName("ImageID");
                  entity.Property(e => e.AffectedArea).HasMaxLength(100);
                  entity.Property(e => e.AianalysisResult).HasColumnName("AIAnalysisResult");
                  entity.Property(e => e.AianalysisStatus).HasMaxLength(50).HasColumnName("AIAnalysisStatus");
                  entity.Property(e => e.AnalysisConfidence).HasColumnType("decimal(5, 2)");
                  entity.Property(e => e.CapturedAt).HasPrecision(0);
                  entity.Property(e => e.Description).HasMaxLength(500);
                  entity.Property(e => e.DetectedAt).HasPrecision(0);
                  entity.Property(e => e.DiseaseConfidence).HasColumnType("decimal(5, 2)");
                  entity.Property(e => e.DiseaseName).HasMaxLength(100);
                  entity.Property(e => e.DiseaseScientificName).HasMaxLength(150);
                  entity.Property(e => e.DiseaseSeverity).HasMaxLength(50);
                  entity.Property(e => e.HealthScore).HasColumnType("decimal(4, 1)");
                  entity.Property(e => e.HealthStatus).HasMaxLength(50);
                  entity.Property(e => e.ImageType).HasMaxLength(50);
                  entity.Property(e => e.ImageUrl).HasMaxLength(500);
                  entity.Property(e => e.ProcessedAt).HasPrecision(0);
                  entity.Property(e => e.Resolution).HasMaxLength(20);
                  entity.Property(e => e.Tags).HasMaxLength(500);
                  entity.Property(e => e.ThumbnailUrl).HasMaxLength(500);
                  entity.Property(e => e.TreatmentEndAt).HasPrecision(0);
                  entity.Property(e => e.TreatmentNotes).HasMaxLength(1000);
                  entity.Property(e => e.TreatmentPriority).HasMaxLength(20);
                  entity.Property(e => e.TreatmentStartAt).HasPrecision(0);
                  entity.Property(e => e.TreeId).HasColumnName("TreeID");
                  entity.Property(e => e.UploadedAt).HasPrecision(0);

                  entity.HasOne(d => d.Tree).WithMany(p => p.TreeImages)
                    .HasForeignKey(d => d.TreeId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_TreeImages_Trees");
            });

            // ===== TreeType =====
            modelBuilder.Entity<TreeType>(entity =>
            {
                  entity.HasKey(e => e.TreeTypeId).HasName("PK__TreeType__7AD87BF48D3F77AA");
                  entity.HasIndex(e => e.SoilMasterId, "IX_TreeTypes_SoilMasterID");

                  entity.Property(e => e.TreeTypeId).HasColumnName("TreeTypeID");
                  entity.Property(e => e.Category).HasMaxLength(100);
                  entity.Property(e => e.Description).HasMaxLength(500);
                  entity.Property(e => e.DroughtTolerance).HasMaxLength(20);
                  entity.Property(e => e.FloodTolerance).HasMaxLength(20);
                  entity.Property(e => e.FrostTolerance).HasMaxLength(20);
                  entity.Property(e => e.ImageUrl).HasMaxLength(500);
                  entity.Property(e => e.IsActive).HasDefaultValue(true);
                  entity.Property(e => e.OptimalHumidityMax).HasColumnType("decimal(5, 2)");
                  entity.Property(e => e.OptimalHumidityMin).HasColumnType("decimal(5, 2)");
                  entity.Property(e => e.OptimalTemperatureMax).HasColumnType("decimal(5, 2)");
                  entity.Property(e => e.OptimalTemperatureMin).HasColumnType("decimal(5, 2)");
                  entity.Property(e => e.ScientificName).HasMaxLength(150);
                  entity.Property(e => e.SoilMasterId).HasColumnName("SoilMasterID");
                  entity.Property(e => e.TreeTypeName).HasMaxLength(100);
                  entity.Property(e => e.WindTolerance).HasMaxLength(20);

                  entity.HasOne(d => d.SoilMaster).WithMany(p => p.TreeTypes)
                    .HasForeignKey(d => d.SoilMasterId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_TreeTypes_SoilMaster");
            });

            // ===== User =====
            modelBuilder.Entity<User>(entity =>
            {
                  entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCAC6F0B5B29");
                  entity.HasIndex(e => e.Email, "IX_Users_Email");
                  entity.HasIndex(e => e.Email, "UQ__Users__A9D10534E2041B5F").IsUnique();

                  entity.Property(e => e.UserId).HasColumnName("UserID");
                  entity.Property(e => e.Address).HasMaxLength(255);
                  entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
                  entity.Property(e => e.Email).HasMaxLength(254).IsUnicode(false);
                  entity.Property(e => e.ExperienceLevel).HasMaxLength(50);
                  entity.Property(e => e.FullName).HasMaxLength(100);
                  entity.Property(e => e.IsActive).HasDefaultValue(true);
                  entity.Property(e => e.LastLoginAt).HasPrecision(0);
                  entity.Property(e => e.PasswordHash).HasMaxLength(512);
                  entity.Property(e => e.Phone).HasMaxLength(20);
                  entity.Property(e => e.PreferredLanguage).HasMaxLength(10);
                  entity.Property(e => e.ProfileImageUrl).HasMaxLength(255);
                  entity.Property(e => e.RoleId).HasColumnName("RoleID");
                  entity.Property(e => e.UpdatedAt).HasPrecision(0);

                  entity.HasOne(d => d.Role).WithMany(p => p.Users)
                    .HasForeignKey(d => d.RoleId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Users_Roles");
            });

            // ===== WeatherAlert =====
            modelBuilder.Entity<WeatherAlert>(entity =>
            {
                  entity.HasKey(e => e.AlertId).HasName("PK__WeatherA__EBB16AEDA6382CA3");

                  entity.Property(e => e.AlertId).HasColumnName("AlertID");
                  entity.Property(e => e.AcknowledgedAt).HasPrecision(0);
                  entity.Property(e => e.ActionCompletedAt).HasPrecision(0);
                  entity.Property(e => e.ActionDeadline).HasPrecision(0);
                  entity.Property(e => e.AffectedGrowthStages).HasMaxLength(200);
                  entity.Property(e => e.AlertEndAt).HasPrecision(0);
                  entity.Property(e => e.AlertStartAt).HasPrecision(0);
                  entity.Property(e => e.AlertType).HasMaxLength(50);
                  entity.Property(e => e.ConfidenceLevel).HasColumnType("decimal(4, 2)");
                  entity.Property(e => e.CreatedAt).HasPrecision(0).HasDefaultValueSql("(sysdatetime())");
                  entity.Property(e => e.EstimatedDamageLevel).HasMaxLength(50);
                  entity.Property(e => e.ExpiresAt).HasPrecision(0);
                  entity.Property(e => e.ImpactLevel).HasMaxLength(50);
                  entity.Property(e => e.PeakTime).HasPrecision(0);
                  entity.Property(e => e.RelatedWeatherIds).HasMaxLength(500).HasColumnName("RelatedWeatherIDs");
                  entity.Property(e => e.Severity).HasMaxLength(20);
                  entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("Active");
                  entity.Property(e => e.Title).HasMaxLength(200);
                  entity.Property(e => e.TreeId).HasColumnName("TreeID");
                  entity.Property(e => e.UserAction).HasMaxLength(500);
                  entity.Property(e => e.UserId).HasColumnName("UserID");
                  entity.Property(e => e.VulnerabilityScore).HasColumnType("decimal(4, 1)");
                  entity.Property(e => e.WeatherApisource).HasMaxLength(100).HasColumnName("WeatherAPISource");

                  entity.HasOne(d => d.Tree).WithMany(p => p.WeatherAlerts)
                    .HasForeignKey(d => d.TreeId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_WeatherAlerts_Trees");

                  entity.HasOne(d => d.User).WithMany(p => p.WeatherAlerts)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_WeatherAlerts_Users");
            });

            // ===== WeatherHistory =====
            modelBuilder.Entity<WeatherHistory>(entity =>
            {
                  entity.HasKey(e => e.WeatherId).HasName("PK__WeatherH__0BF97BD51E4E0F02");
                  entity.HasIndex(e => e.TreeId, "IX_Weather_TreeID");

                  entity.Property(e => e.WeatherId).HasColumnName("WeatherID");
                  entity.Property(e => e.ApirespondedAt).HasPrecision(0).HasColumnName("APIRespondedAt");
                  entity.Property(e => e.DataQuality).HasMaxLength(20);
                  entity.Property(e => e.DataSource).HasMaxLength(50);
                  entity.Property(e => e.RawApiresponse).HasColumnName("RawAPIResponse");
                  entity.Property(e => e.TreeId).HasColumnName("TreeID");

                  entity.HasOne(d => d.Tree).WithMany(p => p.WeatherHistories)
                    .HasForeignKey(d => d.TreeId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_WeatherHistories_Trees");
            });

            OnModelCreatingPartial(modelBuilder);
      }

      partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
