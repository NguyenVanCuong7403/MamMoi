-- ===== MamMoi Payment & Revenue Data Script =====
-- This script inserts payment and revenue related data only
-- Run this script after schema.sql has been executed successfully
-- Note: Passwords are hashed using SHA256. Original passwords are shown in comments.

USE [MamMoi]
GO

PRINT '========================================'
PRINT 'Inserting Payment & Revenue Data...'
PRINT '========================================'
GO

-- ===== 1. ROLES =====
PRINT ''
PRINT '1. Inserting Roles...'
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [RoleName] = N'SystemAdmin')
BEGIN
    INSERT INTO [dbo].[Roles] ([RoleName]) VALUES (N'SystemAdmin');
    PRINT '  ✓ Inserted: SystemAdmin'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [RoleName] = N'BusinessAdmin')
BEGIN
    INSERT INTO [dbo].[Roles] ([RoleName]) VALUES (N'BusinessAdmin');
    PRINT '  ✓ Inserted: BusinessAdmin'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [RoleName] = N'Farmer')
BEGIN
    INSERT INTO [dbo].[Roles] ([RoleName]) VALUES (N'Farmer');
    PRINT '  ✓ Inserted: Farmer'
END
GO

-- ===== 2. USERS =====
PRINT ''
PRINT '2. Inserting Users...'
GO

-- User 1: SystemAdmin
-- Password: SystemAdmin@123
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = 'systemadmin@mammoi.com')
BEGIN
    INSERT INTO [dbo].[Users] ([RoleID], [FullName], [Email], [PasswordHash], [Phone], [Address], [ExperienceLevel], [PreferredLanguage], [IsActive])
    VALUES (1, N'Nguyễn Văn System Admin', 'systemadmin@mammoi.com', 
            HASHBYTES('SHA2_256', 'SystemAdmin@123'), 
            '0901234567', N'123 Đường ABC, Quận 1, TP.HCM', N'Expert', N'vi', 1);
    PRINT '  ✓ Inserted: systemadmin@mammoi.com (Password: SystemAdmin@123)'
END
GO

-- User 2: BusinessAdmin
-- Password: BusinessAdmin@123
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = 'businessadmin@mammoi.com')
BEGIN
    INSERT INTO [dbo].[Users] ([RoleID], [FullName], [Email], [PasswordHash], [Phone], [Address], [ExperienceLevel], [PreferredLanguage], [IsActive])
    VALUES (2, N'Trần Thị Business Admin', 'businessadmin@mammoi.com', 
            HASHBYTES('SHA2_256', 'BusinessAdmin@123'), 
            '0902345678', N'456 Đường XYZ, Quận 2, TP.HCM', N'Advanced', N'vi', 1);
    PRINT '  ✓ Inserted: businessadmin@mammoi.com (Password: BusinessAdmin@123)'
END
GO

-- User 3: Farmer 1
-- Password: Farmer@123
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com')
BEGIN
    INSERT INTO [dbo].[Users] ([RoleID], [FullName], [Email], [PasswordHash], [Phone], [Address], [ExperienceLevel], [PreferredLanguage], [IsActive])
    VALUES (3, N'Phạm Văn Nông Dân', 'farmer1@mammoi.com', 
            HASHBYTES('SHA2_256', 'Farmer@123'), 
            '0903456789', N'789 Đường DEF, Quận 3, TP.HCM', N'Intermediate', N'vi', 1);
    PRINT '  ✓ Inserted: farmer1@mammoi.com (Password: Farmer@123)'
END
GO

-- User 4: Farmer 2
-- Password: Farmer2@123
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com')
BEGIN
    INSERT INTO [dbo].[Users] ([RoleID], [FullName], [Email], [PasswordHash], [Phone], [Address], [ExperienceLevel], [PreferredLanguage], [IsActive])
    VALUES (3, N'Lê Thị Nông Dân', 'farmer2@mammoi.com', 
            HASHBYTES('SHA2_256', 'Farmer2@123'), 
            '0904567890', N'321 Đường GHI, Quận 4, TP.HCM', N'Beginner', N'vi', 1);
    PRINT '  ✓ Inserted: farmer2@mammoi.com (Password: Farmer2@123)'
END
GO

-- User 5: Farmer 3
-- Password: Farmer3@123
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = 'farmer3@mammoi.com')
BEGIN
    INSERT INTO [dbo].[Users] ([RoleID], [FullName], [Email], [PasswordHash], [Phone], [Address], [ExperienceLevel], [PreferredLanguage], [IsActive])
    VALUES (3, N'Võ Văn Nông Dân', 'farmer3@mammoi.com', 
            HASHBYTES('SHA2_256', 'Farmer3@123'), 
            '0905678901', N'654 Đường JKL, Quận 5, TP.HCM', N'Beginner', N'vi', 1);
    PRINT '  ✓ Inserted: farmer3@mammoi.com (Password: Farmer3@123)'
END
GO

-- Additional farmers for more revenue data
-- User 6: Farmer 4
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = 'farmer4@mammoi.com')
BEGIN
    INSERT INTO [dbo].[Users] ([RoleID], [FullName], [Email], [PasswordHash], [Phone], [Address], [ExperienceLevel], [PreferredLanguage], [IsActive])
    VALUES (3, N'Trương Văn Nông Dân', 'farmer4@mammoi.com', 
            HASHBYTES('SHA2_256', 'Farmer4@123'), 
            '0906789012', N'987 Đường MNO, Quận 6, TP.HCM', N'Intermediate', N'vi', 1);
    PRINT '  ✓ Inserted: farmer4@mammoi.com (Password: Farmer4@123)'
END
GO

-- User 7: Farmer 5
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = 'farmer5@mammoi.com')
BEGIN
    INSERT INTO [dbo].[Users] ([RoleID], [FullName], [Email], [PasswordHash], [Phone], [Address], [ExperienceLevel], [PreferredLanguage], [IsActive])
    VALUES (3, N'Đinh Thị Nông Dân', 'farmer5@mammoi.com', 
            HASHBYTES('SHA2_256', 'Farmer5@123'), 
            '0907890123', N'147 Đường PQR, Quận 7, TP.HCM', N'Advanced', N'vi', 1);
    PRINT '  ✓ Inserted: farmer5@mammoi.com (Password: Farmer5@123)'
END
GO

-- User 8: Farmer 6
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = 'farmer6@mammoi.com')
BEGIN
    INSERT INTO [dbo].[Users] ([RoleID], [FullName], [Email], [PasswordHash], [Phone], [Address], [ExperienceLevel], [PreferredLanguage], [IsActive])
    VALUES (3, N'Hoàng Văn Nông Dân', 'farmer6@mammoi.com', 
            HASHBYTES('SHA2_256', 'Farmer6@123'), 
            '0908901234', N'258 Đường STU, Quận 8, TP.HCM', N'Beginner', N'vi', 1);
    PRINT '  ✓ Inserted: farmer6@mammoi.com (Password: Farmer6@123)'
END
GO

-- User 9: Farmer 7
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = 'farmer7@mammoi.com')
BEGIN
    INSERT INTO [dbo].[Users] ([RoleID], [FullName], [Email], [PasswordHash], [Phone], [Address], [ExperienceLevel], [PreferredLanguage], [IsActive])
    VALUES (3, N'Bùi Thị Nông Dân', 'farmer7@mammoi.com', 
            HASHBYTES('SHA2_256', 'Farmer7@123'), 
            '0909012345', N'369 Đường VWX, Quận 9, TP.HCM', N'Intermediate', N'vi', 1);
    PRINT '  ✓ Inserted: farmer7@mammoi.com (Password: Farmer7@123)'
END
GO

-- User 10: Farmer 8
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = 'farmer8@mammoi.com')
BEGIN
    INSERT INTO [dbo].[Users] ([RoleID], [FullName], [Email], [PasswordHash], [Phone], [Address], [ExperienceLevel], [PreferredLanguage], [IsActive])
    VALUES (3, N'Ngô Văn Nông Dân', 'farmer8@mammoi.com', 
            HASHBYTES('SHA2_256', 'Farmer8@123'), 
            '0910123456', N'741 Đường YZA, Quận 10, TP.HCM', N'Advanced', N'vi', 1);
    PRINT '  ✓ Inserted: farmer8@mammoi.com (Password: Farmer8@123)'
END
GO

-- ===== 3. SUBSCRIPTION PLANS =====
PRINT ''
PRINT '3. Inserting SubscriptionPlans...'
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[SubscriptionPlans] WHERE [PlanName] = N'Gói Ươm Mầm')
BEGIN
    INSERT INTO [dbo].[SubscriptionPlans] ([PlanName], [PlanType], [Price], [Currency], [Description], [Features], [IsActive])
    VALUES (N'Gói Ươm Mầm', N'seedling', 490000.00, N'VND', 
            N'Gói dịch vụ cơ bản dành cho người mới bắt đầu trồng cây', 
            N'["Quản lý tối đa 10 cây", "Nhắc nhở chăm sóc cơ bản", "Theo dõi tăng trưởng", "Hỗ trợ qua email"]', 
            1);
    PRINT '  ✓ Inserted: Gói Ươm Mầm (490,000 VND)'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[SubscriptionPlans] WHERE [PlanName] = N'Gói Vườn Xanh')
BEGIN
    INSERT INTO [dbo].[SubscriptionPlans] ([PlanName], [PlanType], [Price], [Currency], [Description], [Features], [IsActive])
    VALUES (N'Gói Vườn Xanh', N'orchard', 1290000.00, N'VND', 
            N'Gói dịch vụ nâng cao cho người có kinh nghiệm trồng cây', 
            N'["Quản lý tối đa 50 cây", "Nhắc nhở chăm sóc thông minh", "Phân tích tăng trưởng chi tiết", "Tư vấn AI về chăm sóc cây", "Hỗ trợ 24/7", "Báo cáo thời tiết chi tiết"]', 
            1);
    PRINT '  ✓ Inserted: Gói Vườn Xanh (1,290,000 VND)'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[SubscriptionPlans] WHERE [PlanName] = N'Gói Thu Hoạch')
BEGIN
    INSERT INTO [dbo].[SubscriptionPlans] ([PlanName], [PlanType], [Price], [Currency], [Description], [Features], [IsActive])
    VALUES (N'Gói Thu Hoạch', N'harvest', 3890000.00, N'VND', 
            N'Gói dịch vụ cao cấp dành cho nông trại và vườn cây quy mô lớn', 
            N'["Quản lý không giới hạn số cây", "Nhắc nhở chăm sóc thông minh với AI", "Phân tích tăng trưởng nâng cao", "Tư vấn AI chuyên sâu", "Hỗ trợ 24/7 ưu tiên", "Báo cáo thời tiết và cảnh báo chi tiết", "Quản lý nhân viên và phân quyền", "Xuất báo cáo chuyên nghiệp", "Tích hợp API"]', 
            1);
    PRINT '  ✓ Inserted: Gói Thu Hoạch (3,890,000 VND)'
END
GO

-- ===== 4. SUBSCRIPTIONS =====
PRINT ''
PRINT '4. Inserting Subscriptions...'
GO

DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Farmer2ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');
DECLARE @Farmer3ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer3@mammoi.com');
DECLARE @Farmer4ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer4@mammoi.com');
DECLARE @Farmer5ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer5@mammoi.com');
DECLARE @Farmer6ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer6@mammoi.com');
DECLARE @Farmer7ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer7@mammoi.com');
DECLARE @Farmer8ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer8@mammoi.com');

-- Subscriptions cho Farmer 1
IF @Farmer1ID IS NOT NULL
BEGIN
    -- Active subscription
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'orchard' AND [Status] = N'Active' AND [StartDate] = '2024-01-01')
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer1ID, N'Gói Vườn Xanh', N'orchard', '2024-01-01', '2025-01-01', N'Active', 1290000.00, N'VND');
        PRINT '  ✓ Inserted: Subscription for farmer1@mammoi.com (Gói Vườn Xanh - Active)'
    END
    
    -- Expired subscription
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'seedling' AND [Status] = N'Expired')
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer1ID, N'Gói Ươm Mầm', N'seedling', '2023-01-01', '2023-12-31', N'Expired', 490000.00, N'VND');
        PRINT '  ✓ Inserted: Previous subscription for farmer1@mammoi.com (Expired)'
    END
END

-- Subscriptions cho Farmer 2
IF @Farmer2ID IS NOT NULL
BEGIN
    -- Active subscription
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'seedling' AND [Status] = N'Active')
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer2ID, N'Gói Ươm Mầm', N'seedling', '2024-03-15', '2025-03-15', N'Active', 490000.00, N'VND');
        PRINT '  ✓ Inserted: Subscription for farmer2@mammoi.com (Gói Ươm Mầm - Active)'
    END
    
    -- Expired subscription
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'orchard' AND [Status] = N'Expired')
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer2ID, N'Gói Vườn Xanh', N'orchard', '2023-12-01', '2024-11-30', N'Expired', 1290000.00, N'VND');
        PRINT '  ✓ Inserted: Previous subscription for farmer2@mammoi.com (Expired)'
    END
END

-- Subscriptions cho Farmer 3
IF @Farmer3ID IS NOT NULL
BEGIN
    -- Active subscription - Harvest
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer3ID AND [PlanType] = N'harvest' AND [Status] = N'Active')
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer3ID, N'Gói Thu Hoạch', N'harvest', '2024-06-01', '2025-06-01', N'Active', 3890000.00, N'VND');
        PRINT '  ✓ Inserted: Subscription for farmer3@mammoi.com (Gói Thu Hoạch - Active)'
    END
    
    -- Additional subscription - Orchard
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer3ID AND [PlanType] = N'orchard' AND [StartDate] = '2024-03-01')
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer3ID, N'Gói Vườn Xanh', N'orchard', '2024-03-01', '2025-03-01', N'Active', 1290000.00, N'VND');
        PRINT '  ✓ Inserted: Additional subscription for farmer3@mammoi.com (Gói Vườn Xanh)'
    END
END

-- Subscriptions cho Farmer 4
IF @Farmer4ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer4ID AND [PlanType] = N'orchard' AND [Status] = N'Active')
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer4ID, N'Gói Vườn Xanh', N'orchard', '2024-02-01', '2025-02-01', N'Active', 1290000.00, N'VND');
        PRINT '  ✓ Inserted: Subscription for farmer4@mammoi.com'
    END
END

-- Subscriptions cho Farmer 5
IF @Farmer5ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer5ID AND [PlanType] = N'harvest' AND [Status] = N'Active')
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer5ID, N'Gói Thu Hoạch', N'harvest', '2024-04-01', '2025-04-01', N'Active', 3890000.00, N'VND');
        PRINT '  ✓ Inserted: Subscription for farmer5@mammoi.com'
    END
END

-- Subscriptions cho Farmer 6
IF @Farmer6ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer6ID AND [PlanType] = N'seedling' AND [Status] = N'Active')
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer6ID, N'Gói Ươm Mầm', N'seedling', '2024-05-01', '2025-05-01', N'Active', 490000.00, N'VND');
        PRINT '  ✓ Inserted: Subscription for farmer6@mammoi.com'
    END
END

-- Subscriptions cho Farmer 7
IF @Farmer7ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer7ID AND [PlanType] = N'orchard' AND [Status] = N'Active')
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer7ID, N'Gói Vườn Xanh', N'orchard', '2024-07-01', '2025-07-01', N'Active', 1290000.00, N'VND');
        PRINT '  ✓ Inserted: Subscription for farmer7@mammoi.com'
    END
END

-- Subscriptions cho Farmer 8
IF @Farmer8ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer8ID AND [PlanType] = N'harvest' AND [Status] = N'Active')
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer8ID, N'Gói Thu Hoạch', N'harvest', '2024-08-01', '2025-08-01', N'Active', 3890000.00, N'VND');
        PRINT '  ✓ Inserted: Subscription for farmer8@mammoi.com'
    END
END
GO

-- ===== 5. PAYMENTS =====
PRINT ''
PRINT '5. Inserting Payments...'
GO

-- Declare variables for all farmers
DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Farmer2ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');
DECLARE @Farmer3ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer3@mammoi.com');
DECLARE @Farmer4ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer4@mammoi.com');
DECLARE @Farmer5ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer5@mammoi.com');
DECLARE @Farmer6ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer6@mammoi.com');
DECLARE @Farmer7ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer7@mammoi.com');
DECLARE @Farmer8ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer8@mammoi.com');

-- Get Subscription IDs
DECLARE @Sub1_Orchard INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'orchard' AND [Status] = N'Active');
DECLARE @Sub1_Seedling INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'seedling' AND [Status] = N'Expired');
DECLARE @Sub2_Seedling INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'seedling' AND [Status] = N'Active');
DECLARE @Sub2_Orchard INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'orchard' AND [Status] = N'Expired');
DECLARE @Sub3_Harvest INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer3ID AND [PlanType] = N'harvest' AND [Status] = N'Active');
DECLARE @Sub3_Orchard INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer3ID AND [PlanType] = N'orchard' AND [StartDate] = '2024-03-01');
DECLARE @Sub4_Orchard INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer4ID AND [PlanType] = N'orchard');
DECLARE @Sub5_Harvest INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer5ID AND [PlanType] = N'harvest');
DECLARE @Sub6_Seedling INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer6ID AND [PlanType] = N'seedling');
DECLARE @Sub7_Orchard INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer7ID AND [PlanType] = N'orchard');
DECLARE @Sub8_Harvest INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer8ID AND [PlanType] = N'harvest');

-- ===== PAYMENTS - 2023 =====
PRINT ''
PRINT '  Inserting 2023 payments...'

-- Payment 1: Farmer 1 - 2023 expired subscription
IF @Sub1_Seedling IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub1_Seedling AND [PaymentDate] = '2023-01-01')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub1_Seedling, @Farmer1ID, '2023-01-01', 490000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20230101-001', 
                N'Thanh toán gói dịch vụ Gói Ươm Mầm (2023)', N'INV-2023-001', 0, '2023-01-01 11:00:00');
        PRINT '    ✓ Payment for farmer1@mammoi.com (2023-01-01)'
    END
END

-- Payment 2: Farmer 2 - 2023 expired subscription
IF @Sub2_Orchard IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub2_Orchard AND [PaymentDate] = '2023-12-01')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub2_Orchard, @Farmer2ID, '2023-12-01', 1290000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20231201-001', 
                N'Thanh toán gói dịch vụ Gói Vườn Xanh (2023)', N'INV-2023-120', 0, '2023-12-01 16:45:00');
        PRINT '    ✓ Payment for farmer2@mammoi.com (2023-12-01)'
    END
END

-- ===== PAYMENTS - JANUARY 2024 =====
PRINT ''
PRINT '  Inserting January 2024 payments...'

-- Payment 3: Farmer 1 - Success payment
IF @Sub1_Orchard IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub1_Orchard AND [PaymentDate] = '2024-01-01' AND [TransactionStatus] = N'Success')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub1_Orchard, @Farmer1ID, '2024-01-01', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240101-001', 
                N'Thanh toán gói dịch vụ Gói Vườn Xanh', N'INV-2024-001', 0, '2024-01-01 10:30:00');
        PRINT '    ✓ Payment for farmer1@mammoi.com (Success - 1,290,000 VND)'
    END
END

-- Payment 4: Farmer 1 - Failed payment
IF @Sub1_Orchard IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer1ID AND [TransactionStatus] = N'Failed' AND [PaymentDate] = '2024-01-01')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub1_Orchard, @Farmer1ID, '2024-01-01', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Failed', N'TXN-20240101-FAIL', 
                N'Thanh toán thất bại - Gói Vườn Xanh', N'INV-2024-001-FAIL', 0, '2024-01-01 09:15:00');
        PRINT '    ✓ Payment for farmer1@mammoi.com (Failed)'
    END
END

-- Payment 5: Farmer 4 - Success payment
IF @Sub4_Orchard IS NOT NULL AND @Farmer4ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub4_Orchard AND [PaymentDate] = '2024-01-15')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub4_Orchard, @Farmer4ID, '2024-01-15', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240115-001', 
                N'Thanh toán gói dịch vụ Gói Vườn Xanh', N'INV-2024-015', 0, '2024-01-15 14:20:00');
        PRINT '    ✓ Payment for farmer4@mammoi.com (1,290,000 VND)'
    END
END

-- ===== PAYMENTS - FEBRUARY 2024 =====
PRINT ''
PRINT '  Inserting February 2024 payments...'

-- Payment 6: Farmer 1 - Renewal
IF @Sub1_Orchard IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer1ID AND [PaymentDate] = '2024-02-15')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub1_Orchard, @Farmer1ID, '2024-02-15', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240215-001', 
                N'Gia hạn gói dịch vụ Gói Vườn Xanh', N'INV-2024-045', 0, '2024-02-15 10:00:00');
        PRINT '    ✓ Payment for farmer1@mammoi.com (Renewal)'
    END
END

-- Payment 7: Farmer 4 - Additional payment
IF @Sub4_Orchard IS NOT NULL AND @Farmer4ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer4ID AND [PaymentDate] = '2024-02-20')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub4_Orchard, @Farmer4ID, '2024-02-20', 1290000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20240220-001', 
                N'Thanh toán bổ sung dịch vụ', N'INV-2024-050', 0, '2024-02-20 11:30:00');
        PRINT '    ✓ Payment for farmer4@mammoi.com'
    END
END

-- ===== PAYMENTS - MARCH 2024 =====
PRINT ''
PRINT '  Inserting March 2024 payments...'

-- Payment 8: Farmer 2 - Success payment
IF @Sub2_Seedling IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub2_Seedling AND [PaymentDate] = '2024-03-15')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub2_Seedling, @Farmer2ID, '2024-03-15', 490000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20240315-001', 
                N'Thanh toán gói dịch vụ Gói Ươm Mầm', N'INV-2024-075', 0, '2024-03-15 14:20:00');
        PRINT '    ✓ Payment for farmer2@mammoi.com (490,000 VND)'
    END
END

-- Payment 9: Farmer 2 - Pending payment
IF @Sub2_Seedling IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer2ID AND [TransactionStatus] = N'Pending')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub2_Seedling, @Farmer2ID, '2024-03-14', 490000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Pending', N'TXN-20240314-PEND', 
                N'Thanh toán đang xử lý - Gói Ươm Mầm', N'INV-2024-074-PEND', 0, '2024-03-14 20:30:00');
        PRINT '    ✓ Payment for farmer2@mammoi.com (Pending)'
    END
END

-- Payment 10: Farmer 3 - Orchard subscription
IF @Sub3_Orchard IS NOT NULL AND @Farmer3ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub3_Orchard AND [PaymentDate] = '2024-03-01')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub3_Orchard, @Farmer3ID, '2024-03-01', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240301-001', 
                N'Thanh toán gói dịch vụ Gói Vườn Xanh', N'INV-2024-060', 0, '2024-03-01 15:30:00');
        PRINT '    ✓ Payment for farmer3@mammoi.com (1,290,000 VND)'
    END
END

-- ===== PAYMENTS - APRIL 2024 =====
PRINT ''
PRINT '  Inserting April 2024 payments...'

-- Payment 11: Farmer 2 - Additional payment
IF @Sub2_Seedling IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer2ID AND [PaymentDate] = '2024-04-10')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub2_Seedling, @Farmer2ID, '2024-04-10', 490000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20240410-001', 
                N'Thanh toán bổ sung dịch vụ', N'INV-2024-100', 0, '2024-04-10 11:20:00');
        PRINT '    ✓ Payment for farmer2@mammoi.com'
    END
END

-- Payment 12: Farmer 5 - Harvest subscription
IF @Sub5_Harvest IS NOT NULL AND @Farmer5ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub5_Harvest AND [PaymentDate] = '2024-04-01')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub5_Harvest, @Farmer5ID, '2024-04-01', 3890000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240401-001', 
                N'Thanh toán gói dịch vụ Gói Thu Hoạch', N'INV-2024-090', 0, '2024-04-01 09:00:00');
        PRINT '    ✓ Payment for farmer5@mammoi.com (3,890,000 VND)'
    END
END

-- Payment 13: Farmer 5 - Additional payment
IF @Sub5_Harvest IS NOT NULL AND @Farmer5ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer5ID AND [PaymentDate] = '2024-04-25')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub5_Harvest, @Farmer5ID, '2024-04-25', 3890000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240425-001', 
                N'Thanh toán bổ sung dịch vụ', N'INV-2024-115', 0, '2024-04-25 16:45:00');
        PRINT '    ✓ Payment for farmer5@mammoi.com'
    END
END

-- ===== PAYMENTS - MAY 2024 =====
PRINT ''
PRINT '  Inserting May 2024 payments...'

-- Payment 14: Farmer 1 - Renewal
IF @Sub1_Orchard IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer1ID AND [PaymentDate] = '2024-05-20')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub1_Orchard, @Farmer1ID, '2024-05-20', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240520-001', 
                N'Thanh toán gia hạn gói dịch vụ', N'INV-2024-140', 0, '2024-05-20 09:45:00');
        PRINT '    ✓ Payment for farmer1@mammoi.com'
    END
END

-- Payment 15: Farmer 6 - Seedling subscription
IF @Sub6_Seedling IS NOT NULL AND @Farmer6ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub6_Seedling AND [PaymentDate] = '2024-05-01')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub6_Seedling, @Farmer6ID, '2024-05-01', 490000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20240501-001', 
                N'Thanh toán gói dịch vụ Gói Ươm Mầm', N'INV-2024-121', 0, '2024-05-01 10:15:00');
        PRINT '    ✓ Payment for farmer6@mammoi.com (490,000 VND)'
    END
END

-- ===== PAYMENTS - JUNE 2024 =====
PRINT ''
PRINT '  Inserting June 2024 payments...'

-- Payment 16: Farmer 3 - Harvest subscription
IF @Sub3_Harvest IS NOT NULL AND @Farmer3ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub3_Harvest AND [PaymentDate] = '2024-06-01')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub3_Harvest, @Farmer3ID, '2024-06-01', 3890000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240601-001', 
                N'Thanh toán gói dịch vụ Gói Thu Hoạch', N'INV-2024-152', 0, '2024-06-01 09:15:00');
        PRINT '    ✓ Payment for farmer3@mammoi.com (3,890,000 VND)'
    END
END

-- Payment 17: Farmer 3 - Additional payment
IF @Sub3_Harvest IS NOT NULL AND @Farmer3ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer3ID AND [PaymentDate] = '2024-06-15')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub3_Harvest, @Farmer3ID, '2024-06-15', 3890000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240615-001', 
                N'Thanh toán bổ sung dịch vụ Gói Thu Hoạch', N'INV-2024-167', 0, '2024-06-15 14:00:00');
        PRINT '    ✓ Payment for farmer3@mammoi.com'
    END
END

-- Payment 18: Farmer 6 - Additional payment
IF @Sub6_Seedling IS NOT NULL AND @Farmer6ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer6ID AND [PaymentDate] = '2024-06-10')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub6_Seedling, @Farmer6ID, '2024-06-10', 490000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20240610-001', 
                N'Thanh toán bổ sung dịch vụ', N'INV-2024-162', 0, '2024-06-10 11:30:00');
        PRINT '    ✓ Payment for farmer6@mammoi.com'
    END
END

-- ===== PAYMENTS - JULY 2024 =====
PRINT ''
PRINT '  Inserting July 2024 payments...'

-- Payment 19: Farmer 1 - Refunded payment
IF @Sub1_Orchard IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer1ID AND [IsRefunded] = 1)
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], 
                                     [IsRefunded], [RefundAmount], [RefundDate], [RefundReason], [CreatedAt])
        VALUES (@Sub1_Orchard, @Farmer1ID, '2024-07-01', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240701-REFUND', 
                N'Thanh toán đã được hoàn tiền', N'INV-2024-182', 
                1, 1290000.00, '2024-07-05', N'Yêu cầu hoàn tiền từ khách hàng', '2024-07-01 10:00:00');
        PRINT '    ✓ Payment for farmer1@mammoi.com (Refunded)'
    END
END

-- Payment 20: Farmer 7 - Orchard subscription
IF @Sub7_Orchard IS NOT NULL AND @Farmer7ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub7_Orchard AND [PaymentDate] = '2024-07-01')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub7_Orchard, @Farmer7ID, '2024-07-01', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240701-002', 
                N'Thanh toán gói dịch vụ Gói Vườn Xanh', N'INV-2024-183', 0, '2024-07-01 13:20:00');
        PRINT '    ✓ Payment for farmer7@mammoi.com (1,290,000 VND)'
    END
END

-- Payment 21: Farmer 4 - Additional payment
IF @Sub4_Orchard IS NOT NULL AND @Farmer4ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer4ID AND [PaymentDate] = '2024-07-15')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub4_Orchard, @Farmer4ID, '2024-07-15', 1290000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20240715-001', 
                N'Gia hạn gói dịch vụ', N'INV-2024-195', 0, '2024-07-15 09:30:00');
        PRINT '    ✓ Payment for farmer4@mammoi.com'
    END
END

-- ===== PAYMENTS - AUGUST 2024 =====
PRINT ''
PRINT '  Inserting August 2024 payments...'

-- Payment 22: Farmer 8 - Harvest subscription
IF @Sub8_Harvest IS NOT NULL AND @Farmer8ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub8_Harvest AND [PaymentDate] = '2024-08-01')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub8_Harvest, @Farmer8ID, '2024-08-01', 3890000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240801-001', 
                N'Thanh toán gói dịch vụ Gói Thu Hoạch', N'INV-2024-213', 0, '2024-08-01 10:00:00');
        PRINT '    ✓ Payment for farmer8@mammoi.com (3,890,000 VND)'
    END
END

-- Payment 23: Farmer 5 - Renewal
IF @Sub5_Harvest IS NOT NULL AND @Farmer5ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer5ID AND [PaymentDate] = '2024-08-10')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub5_Harvest, @Farmer5ID, '2024-08-10', 3890000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240810-001', 
                N'Gia hạn gói dịch vụ Gói Thu Hoạch', N'INV-2024-222', 0, '2024-08-10 11:45:00');
        PRINT '    ✓ Payment for farmer5@mammoi.com'
    END
END

-- Payment 24: Farmer 7 - Additional payment
IF @Sub7_Orchard IS NOT NULL AND @Farmer7ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer7ID AND [PaymentDate] = '2024-08-20')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub7_Orchard, @Farmer7ID, '2024-08-20', 1290000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20240820-001', 
                N'Thanh toán bổ sung dịch vụ', N'INV-2024-232', 0, '2024-08-20 14:20:00');
        PRINT '    ✓ Payment for farmer7@mammoi.com'
    END
END

-- ===== PAYMENTS - SEPTEMBER 2024 =====
PRINT ''
PRINT '  Inserting September 2024 payments...'

-- Payment 25: Farmer 1 - Additional payment
IF @Sub1_Orchard IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer1ID AND [PaymentDate] = '2024-09-05')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub1_Orchard, @Farmer1ID, '2024-09-05', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240905-001', 
                N'Thanh toán bổ sung dịch vụ', N'INV-2024-248', 0, '2024-09-05 10:15:00');
        PRINT '    ✓ Payment for farmer1@mammoi.com'
    END
END

-- Payment 26: Farmer 3 - Renewal Orchard
IF @Sub3_Orchard IS NOT NULL AND @Farmer3ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub3_Orchard AND [PaymentDate] = '2024-09-01')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub3_Orchard, @Farmer3ID, '2024-09-01', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240901-001', 
                N'Gia hạn gói dịch vụ Gói Vườn Xanh', N'INV-2024-244', 0, '2024-09-01 09:30:00');
        PRINT '    ✓ Payment for farmer3@mammoi.com'
    END
END

-- Payment 27: Farmer 8 - Additional payment
IF @Sub8_Harvest IS NOT NULL AND @Farmer8ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer8ID AND [PaymentDate] = '2024-09-15')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub8_Harvest, @Farmer8ID, '2024-09-15', 3890000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240915-001', 
                N'Thanh toán bổ sung dịch vụ', N'INV-2024-258', 0, '2024-09-15 15:00:00');
        PRINT '    ✓ Payment for farmer8@mammoi.com'
    END
END

-- ===== PAYMENTS - OCTOBER 2024 =====
PRINT ''
PRINT '  Inserting October 2024 payments...'

-- Payment 28: Farmer 2 - Renewal
IF @Sub2_Seedling IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer2ID AND [PaymentDate] = '2024-10-01')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub2_Seedling, @Farmer2ID, '2024-10-01', 490000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20241001-001', 
                N'Gia hạn gói dịch vụ Gói Ươm Mầm', N'INV-2024-274', 0, '2024-10-01 11:00:00');
        PRINT '    ✓ Payment for farmer2@mammoi.com'
    END
END

-- Payment 29: Farmer 4 - Renewal
IF @Sub4_Orchard IS NOT NULL AND @Farmer4ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer4ID AND [PaymentDate] = '2024-10-15')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub4_Orchard, @Farmer4ID, '2024-10-15', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20241015-001', 
                N'Gia hạn gói dịch vụ', N'INV-2024-288', 0, '2024-10-15 10:30:00');
        PRINT '    ✓ Payment for farmer4@mammoi.com'
    END
END

-- Payment 30: Farmer 6 - Renewal
IF @Sub6_Seedling IS NOT NULL AND @Farmer6ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer6ID AND [PaymentDate] = '2024-10-20')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub6_Seedling, @Farmer6ID, '2024-10-20', 490000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20241020-001', 
                N'Gia hạn gói dịch vụ', N'INV-2024-293', 0, '2024-10-20 14:15:00');
        PRINT '    ✓ Payment for farmer6@mammoi.com'
    END
END

-- ===== PAYMENTS - NOVEMBER 2024 =====
PRINT ''
PRINT '  Inserting November 2024 payments...'

-- Payment 31: Farmer 1 - Renewal
IF @Sub1_Orchard IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer1ID AND [PaymentDate] = '2024-11-01')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub1_Orchard, @Farmer1ID, '2024-11-01', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20241101-001', 
                N'Gia hạn gói dịch vụ', N'INV-2024-305', 0, '2024-11-01 09:00:00');
        PRINT '    ✓ Payment for farmer1@mammoi.com'
    END
END

-- Payment 32: Farmer 5 - Additional payment
IF @Sub5_Harvest IS NOT NULL AND @Farmer5ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer5ID AND [PaymentDate] = '2024-11-10')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub5_Harvest, @Farmer5ID, '2024-11-10', 3890000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20241110-001', 
                N'Thanh toán bổ sung dịch vụ', N'INV-2024-315', 0, '2024-11-10 11:30:00');
        PRINT '    ✓ Payment for farmer5@mammoi.com'
    END
END

-- Payment 33: Farmer 7 - Renewal
IF @Sub7_Orchard IS NOT NULL AND @Farmer7ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer7ID AND [PaymentDate] = '2024-11-20')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub7_Orchard, @Farmer7ID, '2024-11-20', 1290000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20241120-001', 
                N'Gia hạn gói dịch vụ', N'INV-2024-325', 0, '2024-11-20 15:45:00');
        PRINT '    ✓ Payment for farmer7@mammoi.com'
    END
END

-- ===== PAYMENTS - DECEMBER 2024 =====
PRINT ''
PRINT '  Inserting December 2024 payments...'

-- Payment 34: Farmer 3 - Renewal Harvest
IF @Sub3_Harvest IS NOT NULL AND @Farmer3ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub3_Harvest AND [PaymentDate] = '2024-12-01')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub3_Harvest, @Farmer3ID, '2024-12-01', 3890000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20241201-001', 
                N'Gia hạn gói dịch vụ Gói Thu Hoạch', N'INV-2024-335', 0, '2024-12-01 10:00:00');
        PRINT '    ✓ Payment for farmer3@mammoi.com'
    END
END

-- Payment 35: Farmer 8 - Renewal
IF @Sub8_Harvest IS NOT NULL AND @Farmer8ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer8ID AND [PaymentDate] = '2024-12-10')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub8_Harvest, @Farmer8ID, '2024-12-10', 3890000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20241210-001', 
                N'Gia hạn gói dịch vụ', N'INV-2024-345', 0, '2024-12-10 11:20:00');
        PRINT '    ✓ Payment for farmer8@mammoi.com'
    END
END

-- Payment 36: Farmer 2 - Additional payment
IF @Sub2_Seedling IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer2ID AND [PaymentDate] = '2024-12-15')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub2_Seedling, @Farmer2ID, '2024-12-15', 490000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20241215-001', 
                N'Thanh toán bổ sung dịch vụ', N'INV-2024-350', 0, '2024-12-15 13:00:00');
        PRINT '    ✓ Payment for farmer2@mammoi.com'
    END
END

-- Payment 37: Farmer 4 - Additional payment
IF @Sub4_Orchard IS NOT NULL AND @Farmer4ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer4ID AND [PaymentDate] = '2024-12-20')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub4_Orchard, @Farmer4ID, '2024-12-20', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20241220-001', 
                N'Thanh toán bổ sung dịch vụ', N'INV-2024-355', 0, '2024-12-20 09:30:00');
        PRINT '    ✓ Payment for farmer4@mammoi.com'
    END
END
GO

PRINT ''
PRINT '========================================'
PRINT 'Payment & Revenue Data Insertion Completed!'
PRINT '========================================'
PRINT ''
PRINT 'Summary:'
PRINT '  ✓ Roles: 3 records'
PRINT '  ✓ Users: 10 records (2 admins + 8 farmers)'
PRINT '  ✓ SubscriptionPlans: 3 records'
PRINT '  ✓ Subscriptions: 8+ records'
PRINT '  ✓ Payments: 37+ records'
PRINT ''
PRINT 'Payment Distribution:'
PRINT '  • 2023: 2 payments'
PRINT '  • January 2024: 3 payments'
PRINT '  • February 2024: 2 payments'
PRINT '  • March 2024: 3 payments'
PRINT '  • April 2024: 3 payments'
PRINT '  • May 2024: 2 payments'
PRINT '  • June 2024: 3 payments'
PRINT '  • July 2024: 3 payments'
PRINT '  • August 2024: 3 payments'
PRINT '  • September 2024: 3 payments'
PRINT '  • October 2024: 3 payments'
PRINT '  • November 2024: 3 payments'
PRINT '  • December 2024: 4 payments'
PRINT ''
PRINT 'Transaction Statuses:'
PRINT '  • Success: 35+ payments'
PRINT '  • Failed: 1 payment'
PRINT '  • Pending: 1 payment'
PRINT '  • Refunded: 1 payment'
PRINT ''
PRINT 'Test Accounts:'
PRINT '  • SystemAdmin: systemadmin@mammoi.com / SystemAdmin@123'
PRINT '  • BusinessAdmin: businessadmin@mammoi.com / BusinessAdmin@123'
PRINT '  • Farmer 1-8: farmer[1-8]@mammoi.com / Farmer[1-8]@123'
PRINT ''
PRINT 'Data is ready for revenue analysis and charts!'
PRINT ''
GO

