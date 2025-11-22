-- ===== Seed Data Script =====
-- This script inserts sample data into the database
-- Run this script after schema.sql has been executed
-- Note: Passwords are hashed using SHA256. Original passwords are shown in comments.

USE [MamMoi]
GO

PRINT 'Starting seed data insertion...'
GO

-- ===== 1. ROLES =====
PRINT 'Inserting Roles...'
GO

-- Role 1: SystemAdmin
IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [RoleName] = N'SystemAdmin')
BEGIN
    INSERT INTO [dbo].[Roles] ([RoleName]) VALUES (N'SystemAdmin');
    PRINT '  - Inserted: SystemAdmin'
END
GO

-- Role 2: BusinessAdmin
IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [RoleName] = N'BusinessAdmin')
BEGIN
    INSERT INTO [dbo].[Roles] ([RoleName]) VALUES (N'BusinessAdmin');
    PRINT '  - Inserted: BusinessAdmin'
END
GO

-- Role 3: Farmer (user)
IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [RoleName] = N'Farmer')
BEGIN
    INSERT INTO [dbo].[Roles] ([RoleName]) VALUES (N'Farmer');
    PRINT '  - Inserted: Farmer'
END
GO

-- ===== 2. SOIL MASTER =====
PRINT 'Inserting SoilMaster...'
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[SoilMaster] WHERE [SoilName] = N'Đất thịt pha cát')
BEGIN
    INSERT INTO [dbo].[SoilMaster] ([SoilName], [Texture], [Drainage], [OrganicMatterPct], [EC_dS_m], [Notes])
    VALUES (N'Đất thịt pha cát', N'Loamy', N'Good', 3.5, 0.8, N'Đất phù hợp cho nhiều loại cây trồng');
    PRINT '  - Inserted: Đất thịt pha cát'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[SoilMaster] WHERE [SoilName] = N'Đất sét')
BEGIN
    INSERT INTO [dbo].[SoilMaster] ([SoilName], [Texture], [Drainage], [OrganicMatterPct], [EC_dS_m], [Notes])
    VALUES (N'Đất sét', N'Clay', N'Poor', 2.0, 1.2, N'Đất giữ nước tốt nhưng thoát nước kém');
    PRINT '  - Inserted: Đất sét'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[SoilMaster] WHERE [SoilName] = N'Đất cát')
BEGIN
    INSERT INTO [dbo].[SoilMaster] ([SoilName], [Texture], [Drainage], [OrganicMatterPct], [EC_dS_m], [Notes])
    VALUES (N'Đất cát', N'Sandy', N'Excellent', 1.5, 0.5, N'Đất thoát nước tốt, cần bổ sung dinh dưỡng thường xuyên');
    PRINT '  - Inserted: Đất cát'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[SoilMaster] WHERE [SoilName] = N'Đất phù sa')
BEGIN
    INSERT INTO [dbo].[SoilMaster] ([SoilName], [Texture], [Drainage], [OrganicMatterPct], [EC_dS_m], [Notes])
    VALUES (N'Đất phù sa', N'Alluvial', N'Good', 4.5, 0.9, N'Đất màu mỡ, giàu dinh dưỡng tự nhiên');
    PRINT '  - Inserted: Đất phù sa'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[SoilMaster] WHERE [SoilName] = N'Đất đỏ bazan')
BEGIN
    INSERT INTO [dbo].[SoilMaster] ([SoilName], [Texture], [Drainage], [OrganicMatterPct], [EC_dS_m], [Notes])
    VALUES (N'Đất đỏ bazan', N'Volcanic', N'Good', 3.0, 0.7, N'Đất giàu khoáng chất, phù hợp cây công nghiệp');
    PRINT '  - Inserted: Đất đỏ bazan'
END
GO

-- ===== 3. USERS =====
PRINT 'Inserting Users...'
GO

-- User 1: SystemAdmin
-- Original password: SystemAdmin@123
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = 'systemadmin@mammoi.com')
BEGIN
    INSERT INTO [dbo].[Users] ([RoleID], [FullName], [Email], [PasswordHash], [Phone], [Address], [ExperienceLevel], [PreferredLanguage], [IsActive])
    VALUES (1, N'Nguyễn Văn System Admin', 'systemadmin@mammoi.com', 
            HASHBYTES('SHA2_256', 'SystemAdmin@123'), 
            '0901234567', N'123 Đường ABC, Quận 1, TP.HCM', N'Expert', N'vi', 1);
    PRINT '  - Inserted: systemadmin@mammoi.com (Password: SystemAdmin@123)'
END
GO

-- User 2: BusinessAdmin
-- Original password: BusinessAdmin@123
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = 'businessadmin@mammoi.com')
BEGIN
    INSERT INTO [dbo].[Users] ([RoleID], [FullName], [Email], [PasswordHash], [Phone], [Address], [ExperienceLevel], [PreferredLanguage], [IsActive])
    VALUES (2, N'Trần Thị Business Admin', 'businessadmin@mammoi.com', 
            HASHBYTES('SHA2_256', 'BusinessAdmin@123'), 
            '0902345678', N'456 Đường XYZ, Quận 2, TP.HCM', N'Advanced', N'vi', 1);
    PRINT '  - Inserted: businessadmin@mammoi.com (Password: BusinessAdmin@123)'
END
GO

-- User 3: Farmer
-- Original password: Farmer@123
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com')
BEGIN
    INSERT INTO [dbo].[Users] ([RoleID], [FullName], [Email], [PasswordHash], [Phone], [Address], [ExperienceLevel], [PreferredLanguage], [IsActive])
    VALUES (3, N'Phạm Văn Nông Dân', 'farmer1@mammoi.com', 
            HASHBYTES('SHA2_256', 'Farmer@123'), 
            '0903456789', N'789 Đường DEF, Quận 3, TP.HCM', N'Intermediate', N'vi', 1);
    PRINT '  - Inserted: farmer1@mammoi.com (Password: Farmer@123)'
END
GO

-- User 4: Farmer
-- Original password: Farmer2@123
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com')
BEGIN
    INSERT INTO [dbo].[Users] ([RoleID], [FullName], [Email], [PasswordHash], [Phone], [Address], [ExperienceLevel], [PreferredLanguage], [IsActive])
    VALUES (3, N'Lê Thị Nông Dân', 'farmer2@mammoi.com', 
            HASHBYTES('SHA2_256', 'Farmer2@123'), 
            '0904567890', N'321 Đường GHI, Quận 4, TP.HCM', N'Beginner', N'vi', 1);
    PRINT '  - Inserted: farmer2@mammoi.com (Password: Farmer2@123)'
END
GO

-- User 5: Farmer
-- Original password: Farmer3@123
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = 'farmer3@mammoi.com')
BEGIN
    INSERT INTO [dbo].[Users] ([RoleID], [FullName], [Email], [PasswordHash], [Phone], [Address], [ExperienceLevel], [PreferredLanguage], [IsActive])
    VALUES (3, N'Võ Văn Nông Dân', 'farmer3@mammoi.com', 
            HASHBYTES('SHA2_256', 'Farmer3@123'), 
            '0905678901', N'654 Đường JKL, Quận 5, TP.HCM', N'Beginner', N'vi', 1);
    PRINT '  - Inserted: farmer3@mammoi.com (Password: Farmer3@123)'
END
GO

-- ===== 4. TREE TYPES =====
PRINT 'Inserting TreeTypes...'
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Cây ăn quả')
BEGIN
    INSERT INTO [dbo].[TreeTypes] ([SoilMasterID], [TreeTypeName], [ScientificName], [Description], [Category], [AverageLifespanYears], 
                                   [OptimalTemperatureMin], [OptimalTemperatureMax], [OptimalHumidityMin], [OptimalHumidityMax],
                                   [DroughtTolerance], [FloodTolerance], [FrostTolerance], [WindTolerance], [IsActive])
    VALUES (1, N'Cây ăn quả', N'Fruit Trees', N'Các loại cây cho quả ăn được', N'Fruit', 20, 18.0, 35.0, 50.0, 80.0, 
            N'Medium', N'Low', N'Low', N'Medium', 1);
    PRINT '  - Inserted: Cây ăn quả'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Cây công nghiệp')
BEGIN
    INSERT INTO [dbo].[TreeTypes] ([SoilMasterID], [TreeTypeName], [ScientificName], [Description], [Category], [AverageLifespanYears],
                                   [OptimalTemperatureMin], [OptimalTemperatureMax], [OptimalHumidityMin], [OptimalHumidityMax],
                                   [DroughtTolerance], [FloodTolerance], [FrostTolerance], [WindTolerance], [IsActive])
    VALUES (5, N'Cây công nghiệp', N'Industrial Trees', N'Các loại cây trồng để sản xuất công nghiệp', N'Industrial', 30, 20.0, 32.0, 60.0, 85.0,
            N'High', N'Medium', N'Low', N'High', 1);
    PRINT '  - Inserted: Cây công nghiệp'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Cây cảnh')
BEGIN
    INSERT INTO [dbo].[TreeTypes] ([SoilMasterID], [TreeTypeName], [ScientificName], [Description], [Category], [AverageLifespanYears],
                                   [OptimalTemperatureMin], [OptimalTemperatureMax], [OptimalHumidityMin], [OptimalHumidityMax],
                                   [DroughtTolerance], [FloodTolerance], [FrostTolerance], [WindTolerance], [IsActive])
    VALUES (1, N'Cây cảnh', N'Ornamental Trees', N'Các loại cây trồng để trang trí', N'Ornamental', 15, 15.0, 30.0, 40.0, 70.0,
            N'Low', N'Low', N'Low', N'Low', 1);
    PRINT '  - Inserted: Cây cảnh'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Cây lấy gỗ')
BEGIN
    INSERT INTO [dbo].[TreeTypes] ([SoilMasterID], [TreeTypeName], [ScientificName], [Description], [Category], [AverageLifespanYears],
                                   [OptimalTemperatureMin], [OptimalTemperatureMax], [OptimalHumidityMin], [OptimalHumidityMax],
                                   [DroughtTolerance], [FloodTolerance], [FrostTolerance], [WindTolerance], [IsActive])
    VALUES (4, N'Cây lấy gỗ', N'Timber Trees', N'Các loại cây trồng để lấy gỗ', N'Timber', 50, 10.0, 28.0, 55.0, 90.0,
            N'High', N'High', N'Medium', N'High', 1);
    PRINT '  - Inserted: Cây lấy gỗ'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Cây dược liệu')
BEGIN
    INSERT INTO [dbo].[TreeTypes] ([SoilMasterID], [TreeTypeName], [ScientificName], [Description], [Category], [AverageLifespanYears],
                                   [OptimalTemperatureMin], [OptimalTemperatureMax], [OptimalHumidityMin], [OptimalHumidityMax],
                                   [DroughtTolerance], [FloodTolerance], [FrostTolerance], [WindTolerance], [IsActive])
    VALUES (1, N'Cây dược liệu', N'Medicinal Trees', N'Các loại cây có giá trị dược liệu', N'Medicinal', 25, 18.0, 30.0, 50.0, 75.0,
            N'Medium', N'Low', N'Low', N'Medium', 1);
    PRINT '  - Inserted: Cây dược liệu'
END
GO

-- ===== 5. TREE GROWTH STAGES =====
PRINT 'Inserting TreeGrowthStages...'
GO

DECLARE @TreeTypeFruitID INT = (SELECT TOP 1 [TreeTypeID] FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Cây ăn quả');
DECLARE @TreeTypeIndustrialID INT = (SELECT TOP 1 [TreeTypeID] FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Cây công nghiệp');

IF @TreeTypeFruitID IS NOT NULL
BEGIN
    -- Stage 1: Giai đoạn ươm mầm
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeGrowthStages] WHERE [TreeTypeID] = @TreeTypeFruitID AND [StageOrder] = 1)
    BEGIN
        INSERT INTO [dbo].[TreeGrowthStages] ([TreeTypeID], [StageName], [StageOrder], [Description], [MinAgeInMonths], [MaxAgeInMonths],
                                              [WateringFrequencyDays], [WateringAmountLiters], [FertilizingFrequencyDays], 
                                              [FertilizerType], [FertilizerAmountGrams], [VulnerabilityLevel])
        VALUES (@TreeTypeFruitID, N'Giai đoạn ươm mầm', 1, N'Cây mới trồng, cần chăm sóc đặc biệt', 0, 3, 1, 0.5, 30, N'Phân hữu cơ', 50.0, 8);
        PRINT '  - Inserted: Giai đoạn ươm mầm (Cây ăn quả)'
    END
    
    -- Stage 2: Giai đoạn phát triển
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeGrowthStages] WHERE [TreeTypeID] = @TreeTypeFruitID AND [StageOrder] = 2)
    BEGIN
        INSERT INTO [dbo].[TreeGrowthStages] ([TreeTypeID], [StageName], [StageOrder], [Description], [MinAgeInMonths], [MaxAgeInMonths],
                                              [WateringFrequencyDays], [WateringAmountLiters], [FertilizingFrequencyDays],
                                              [FertilizerType], [FertilizerAmountGrams], [VulnerabilityLevel])
        VALUES (@TreeTypeFruitID, N'Giai đoạn phát triển', 2, N'Cây đang phát triển mạnh', 3, 12, 2, 1.0, 60, N'NPK 16-16-8', 100.0, 5);
        PRINT '  - Inserted: Giai đoạn phát triển (Cây ăn quả)'
    END
    
    -- Stage 3: Giai đoạn ra hoa
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeGrowthStages] WHERE [TreeTypeID] = @TreeTypeFruitID AND [StageOrder] = 3)
    BEGIN
        INSERT INTO [dbo].[TreeGrowthStages] ([TreeTypeID], [StageName], [StageOrder], [Description], [MinAgeInMonths], [MaxAgeInMonths],
                                              [WateringFrequencyDays], [WateringAmountLiters], [FertilizingFrequencyDays],
                                              [FertilizerType], [FertilizerAmountGrams], [VulnerabilityLevel])
        VALUES (@TreeTypeFruitID, N'Giai đoạn ra hoa', 3, N'Cây bắt đầu ra hoa', 12, 24, 3, 1.5, 45, N'NPK 12-12-17', 150.0, 6);
        PRINT '  - Inserted: Giai đoạn ra hoa (Cây ăn quả)'
    END
    
    -- Stage 4: Giai đoạn đậu quả
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeGrowthStages] WHERE [TreeTypeID] = @TreeTypeFruitID AND [StageOrder] = 4)
    BEGIN
        INSERT INTO [dbo].[TreeGrowthStages] ([TreeTypeID], [StageName], [StageOrder], [Description], [MinAgeInMonths], [MaxAgeInMonths],
                                              [WateringFrequencyDays], [WateringAmountLiters], [FertilizingFrequencyDays],
                                              [FertilizerType], [FertilizerAmountGrams], [VulnerabilityLevel])
        VALUES (@TreeTypeFruitID, N'Giai đoạn đậu quả', 4, N'Cây đang đậu quả, cần nhiều nước và dinh dưỡng', 24, 36, 2, 2.0, 30, N'NPK 15-15-15', 200.0, 7);
        PRINT '  - Inserted: Giai đoạn đậu quả (Cây ăn quả)'
    END
    
    -- Stage 5: Giai đoạn trưởng thành
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeGrowthStages] WHERE [TreeTypeID] = @TreeTypeFruitID AND [StageOrder] = 5)
    BEGIN
        INSERT INTO [dbo].[TreeGrowthStages] ([TreeTypeID], [StageName], [StageOrder], [Description], [MinAgeInMonths], [MaxAgeInMonths],
                                              [WateringFrequencyDays], [WateringAmountLiters], [FertilizingFrequencyDays],
                                              [FertilizerType], [FertilizerAmountGrams], [VulnerabilityLevel])
        VALUES (@TreeTypeFruitID, N'Giai đoạn trưởng thành', 5, N'Cây đã trưởng thành, cho quả ổn định', 36, NULL, 4, 2.5, 90, N'NPK 16-16-8', 250.0, 4);
        PRINT '  - Inserted: Giai đoạn trưởng thành (Cây ăn quả)'
    END
END
GO

-- ===== 6. GARDENS =====
PRINT 'Inserting Gardens...'
GO

DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Farmer2ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');

IF @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Gardens] WHERE [Name] = N'Vườn Cây Ăn Quả Nhà Tôi' AND [UserID] = @Farmer1ID)
    BEGIN
        INSERT INTO [dbo].[Gardens] ([UserID], [Name], [Location], [TimeZone], [ClimateZone], [status], [coverUrl])
        VALUES (@Farmer1ID, N'Vườn Cây Ăn Quả Nhà Tôi', N'123 Đường ABC, Quận 1, TP.HCM', N'Asia/Ho_Chi_Minh', N'Tropical', N'Đang hoạt động', NULL);
        PRINT '  - Inserted: Vườn Cây Ăn Quả Nhà Tôi'
    END
    
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Gardens] WHERE [Name] = N'Vườn Rau Sạch Gia Đình' AND [UserID] = @Farmer1ID)
    BEGIN
        INSERT INTO [dbo].[Gardens] ([UserID], [Name], [Location], [TimeZone], [ClimateZone], [status], [coverUrl])
        VALUES (@Farmer1ID, N'Vườn Rau Sạch Gia Đình', N'456 Đường XYZ, Quận 2, TP.HCM', N'Asia/Ho_Chi_Minh', N'Tropical', N'Đang hoạt động', NULL);
        PRINT '  - Inserted: Vườn Rau Sạch Gia Đình'
    END
END

IF @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Gardens] WHERE [Name] = N'Trang Trại Cây Công Nghiệp' AND [UserID] = @Farmer2ID)
    BEGIN
        INSERT INTO [dbo].[Gardens] ([UserID], [Name], [Location], [TimeZone], [ClimateZone], [status], [coverUrl])
        VALUES (@Farmer2ID, N'Trang Trại Cây Công Nghiệp', N'789 Đường DEF, Quận 3, TP.HCM', N'Asia/Ho_Chi_Minh', N'Tropical', N'Đang hoạt động', NULL);
        PRINT '  - Inserted: Trang Trại Cây Công Nghiệp'
    END
    
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Gardens] WHERE [Name] = N'Vườn Cây Cảnh Mini' AND [UserID] = @Farmer2ID)
    BEGIN
        INSERT INTO [dbo].[Gardens] ([UserID], [Name], [Location], [TimeZone], [ClimateZone], [status], [coverUrl])
        VALUES (@Farmer2ID, N'Vườn Cây Cảnh Mini', N'321 Đường GHI, Quận 4, TP.HCM', N'Asia/Ho_Chi_Minh', N'Tropical', N'Đang hoạt động', NULL);
        PRINT '  - Inserted: Vườn Cây Cảnh Mini'
    END
END

IF @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Gardens] WHERE [Name] = N'Vườn Dược Liệu' AND [UserID] = @Farmer1ID)
    BEGIN
        INSERT INTO [dbo].[Gardens] ([UserID], [Name], [Location], [TimeZone], [ClimateZone], [status], [coverUrl])
        VALUES (@Farmer1ID, N'Vườn Dược Liệu', N'654 Đường JKL, Quận 5, TP.HCM', N'Asia/Ho_Chi_Minh', N'Tropical', N'Đang hoạt động', NULL);
        PRINT '  - Inserted: Vườn Dược Liệu'
    END
END
GO

-- ===== 7. GARDEN SOILS =====
PRINT 'Inserting GardenSoils...'
GO

DECLARE @Garden1ID INT = (SELECT TOP 1 [GardenID] FROM [dbo].[Gardens] WHERE [Name] = N'Vườn Cây Ăn Quả Nhà Tôi');
DECLARE @Soil1ID INT = (SELECT TOP 1 [SoilMasterID] FROM [dbo].[SoilMaster] WHERE [SoilName] = N'Đất thịt pha cát');
DECLARE @Soil2ID INT = (SELECT TOP 1 [SoilMasterID] FROM [dbo].[SoilMaster] WHERE [SoilName] = N'Đất phù sa');

IF @Garden1ID IS NOT NULL AND @Soil1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[GardenSoils] WHERE [GardenID] = @Garden1ID AND [SoilMasterID] = @Soil1ID)
    BEGIN
        INSERT INTO [dbo].[GardenSoils] ([GardenID], [SoilMasterID], [CustomLabel], [Notes])
        VALUES (@Garden1ID, @Soil1ID, N'Khu vực A', N'Đất tốt, phù hợp trồng cây ăn quả');
        PRINT '  - Inserted: GardenSoil for Vườn Cây Ăn Quả Nhà Tôi'
    END
END
GO

-- ===== 8. TREES =====
PRINT 'Inserting Trees...'
GO

DECLARE @Garden1IDForTrees INT = (SELECT TOP 1 [GardenID] FROM [dbo].[Gardens] WHERE [Name] = N'Vườn Cây Ăn Quả Nhà Tôi');
DECLARE @Farmer1IDForTrees INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @TreeTypeFruitIDForTrees INT = (SELECT TOP 1 [TreeTypeID] FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Cây ăn quả');
DECLARE @Stage1ID INT = (SELECT TOP 1 [StageID] FROM [dbo].[TreeGrowthStages] WHERE [StageOrder] = 1);
DECLARE @Stage2ID INT = (SELECT TOP 1 [StageID] FROM [dbo].[TreeGrowthStages] WHERE [StageOrder] = 2);
DECLARE @GardenSoil1ID INT = (SELECT TOP 1 [GardenSoilID] FROM [dbo].[GardenSoils]);

IF @Garden1IDForTrees IS NOT NULL AND @Farmer1IDForTrees IS NOT NULL AND @TreeTypeFruitIDForTrees IS NOT NULL AND @Stage1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Xoài 1' AND [GardenID] = @Garden1IDForTrees)
    BEGIN
        INSERT INTO [dbo].[Trees] ([GardenID], [UserID], [TreeTypeID], [StageID], [TreeCode], [TreeName], [PlantDate], [Location],
                                   [GardenSoilID], [IsActive], [IsFruiting], [ExpectedHarvestDate], [Notes])
        VALUES (@Garden1IDForTrees, @Farmer1IDForTrees, @TreeTypeFruitIDForTrees, @Stage1ID, N'TREE001', N'Cây Xoài 1', '2024-01-15', N'Góc trái vườn',
                @GardenSoil1ID, 1, 0, '2025-06-15', N'Cây mới trồng, cần chăm sóc kỹ');
        PRINT '  - Inserted: Cây Xoài 1'
    END
    
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Cam 1' AND [GardenID] = @Garden1IDForTrees)
    BEGIN
        INSERT INTO [dbo].[Trees] ([GardenID], [UserID], [TreeTypeID], [StageID], [TreeCode], [TreeName], [PlantDate], [Location],
                                   [GardenSoilID], [IsActive], [IsFruiting], [ExpectedHarvestDate], [Notes])
        VALUES (@Garden1IDForTrees, @Farmer1IDForTrees, @TreeTypeFruitIDForTrees, @Stage2ID, N'TREE002', N'Cây Cam 1', '2023-06-20', N'Góc phải vườn',
                @GardenSoil1ID, 1, 0, '2024-12-20', N'Cây đang phát triển tốt');
        PRINT '  - Inserted: Cây Cam 1'
    END
END
GO

DECLARE @Garden2ID INT = (SELECT TOP 1 [GardenID] FROM [dbo].[Gardens] WHERE [Name] = N'Vườn Rau Sạch Gia Đình');
DECLARE @Farmer1IDForTrees2 INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @TreeTypeFruitIDForTrees2 INT = (SELECT TOP 1 [TreeTypeID] FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Cây ăn quả');
DECLARE @Stage2IDForTrees INT = (SELECT TOP 1 [StageID] FROM [dbo].[TreeGrowthStages] WHERE [StageOrder] = 2);

IF @Garden2ID IS NOT NULL AND @Farmer1IDForTrees2 IS NOT NULL AND @TreeTypeFruitIDForTrees2 IS NOT NULL AND @Stage2IDForTrees IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Ổi 1' AND [GardenID] = @Garden2ID)
    BEGIN
        INSERT INTO [dbo].[Trees] ([GardenID], [UserID], [TreeTypeID], [StageID], [TreeCode], [TreeName], [PlantDate], [Location],
                                   [GardenSoilID], [IsActive], [IsFruiting], [ExpectedHarvestDate], [Notes])
        VALUES (@Garden2ID, @Farmer1IDForTrees2, @TreeTypeFruitIDForTrees2, @Stage2IDForTrees, N'TREE003', N'Cây Ổi 1', '2023-09-10', N'Giữa vườn',
                NULL, 1, 1, '2024-09-10', N'Cây đã bắt đầu ra quả');
        PRINT '  - Inserted: Cây Ổi 1'
    END
END
GO

DECLARE @Garden3ID INT = (SELECT TOP 1 [GardenID] FROM [dbo].[Gardens] WHERE [Name] = N'Trang Trại Cây Công Nghiệp');
DECLARE @Farmer2IDForTrees INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');
DECLARE @TreeTypeIndustrialIDForTrees INT = (SELECT TOP 1 [TreeTypeID] FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Cây công nghiệp');
DECLARE @Stage2IDForTrees2 INT = (SELECT TOP 1 [StageID] FROM [dbo].[TreeGrowthStages] WHERE [StageOrder] = 2);

IF @Garden3ID IS NOT NULL AND @Farmer2IDForTrees IS NOT NULL AND @TreeTypeIndustrialIDForTrees IS NOT NULL AND @Stage2IDForTrees2 IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Cao Su 1' AND [GardenID] = @Garden3ID)
    BEGIN
        INSERT INTO [dbo].[Trees] ([GardenID], [UserID], [TreeTypeID], [StageID], [TreeCode], [TreeName], [PlantDate], [Location],
                                   [GardenSoilID], [IsActive], [IsFruiting], [ExpectedHarvestDate], [Notes])
        VALUES (@Garden3ID, @Farmer2IDForTrees, @TreeTypeIndustrialIDForTrees, @Stage2IDForTrees2, N'TREE004', N'Cây Cao Su 1', '2022-05-15', N'Khu A1',
                NULL, 1, 0, NULL, N'Cây cao su đang phát triển tốt');
        PRINT '  - Inserted: Cây Cao Su 1'
    END
    
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Cà Phê 1' AND [GardenID] = @Garden3ID)
    BEGIN
        INSERT INTO [dbo].[Trees] ([GardenID], [UserID], [TreeTypeID], [StageID], [TreeCode], [TreeName], [PlantDate], [Location],
                                   [GardenSoilID], [IsActive], [IsFruiting], [ExpectedHarvestDate], [Notes])
        VALUES (@Garden3ID, @Farmer2IDForTrees, @TreeTypeIndustrialIDForTrees, @Stage2IDForTrees2, N'TREE005', N'Cây Cà Phê 1', '2023-03-20', N'Khu B2',
                NULL, 1, 0, '2025-03-20', N'Cây cà phê mới trồng');
        PRINT '  - Inserted: Cây Cà Phê 1'
    END
END
GO

-- ===== 9. SUBSCRIPTION PLANS =====
PRINT 'Inserting SubscriptionPlans...'
GO

-- Insert default subscription plans
IF NOT EXISTS (SELECT 1 FROM [dbo].[SubscriptionPlans] WHERE [PlanName] = N'Gói Ươm Mầm')
BEGIN
    INSERT INTO [dbo].[SubscriptionPlans] ([PlanName], [PlanType], [Price], [Currency], [Description], [Features], [IsActive])
    VALUES (N'Gói Ươm Mầm', N'seedling', 490000.00, N'VND', 
            N'Gói dịch vụ cơ bản dành cho người mới bắt đầu trồng cây', 
            N'["Quản lý tối đa 10 cây", "Nhắc nhở chăm sóc cơ bản", "Theo dõi tăng trưởng", "Hỗ trợ qua email"]', 
            1);
    PRINT 'Inserted: Gói Ươm Mầm'
END
ELSE
BEGIN
    PRINT 'Gói Ươm Mầm already exists, skipping...'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[SubscriptionPlans] WHERE [PlanName] = N'Gói Vườn Xanh')
BEGIN
    INSERT INTO [dbo].[SubscriptionPlans] ([PlanName], [PlanType], [Price], [Currency], [Description], [Features], [IsActive])
    VALUES (N'Gói Vườn Xanh', N'orchard', 1290000.00, N'VND', 
            N'Gói dịch vụ nâng cao cho người có kinh nghiệm trồng cây', 
            N'["Quản lý tối đa 50 cây", "Nhắc nhở chăm sóc thông minh", "Phân tích tăng trưởng chi tiết", "Tư vấn AI về chăm sóc cây", "Hỗ trợ 24/7", "Báo cáo thời tiết chi tiết"]', 
            1);
    PRINT 'Inserted: Gói Vườn Xanh'
END
ELSE
BEGIN
    PRINT 'Gói Vườn Xanh already exists, skipping...'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[SubscriptionPlans] WHERE [PlanName] = N'Gói Thu Hoạch')
BEGIN
    INSERT INTO [dbo].[SubscriptionPlans] ([PlanName], [PlanType], [Price], [Currency], [Description], [Features], [IsActive])
    VALUES (N'Gói Thu Hoạch', N'harvest', 3890000.00, N'VND', 
            N'Gói dịch vụ cao cấp dành cho nông trại và vườn cây quy mô lớn', 
            N'["Quản lý không giới hạn số cây", "Nhắc nhở chăm sóc thông minh với AI", "Phân tích tăng trưởng nâng cao", "Tư vấn AI chuyên sâu", "Hỗ trợ 24/7 ưu tiên", "Báo cáo thời tiết và cảnh báo chi tiết", "Quản lý nhân viên và phân quyền", "Xuất báo cáo chuyên nghiệp", "Tích hợp API"]', 
            1);
    PRINT 'Inserted: Gói Thu Hoạch'
END
ELSE
BEGIN
    PRINT 'Gói Thu Hoạch already exists, skipping...'
END
GO

-- ===== 10. SUBSCRIPTIONS =====
PRINT 'Inserting Subscriptions...'
GO

DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Farmer2ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');
DECLARE @Farmer3ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer3@mammoi.com');

-- Subscription 1: Farmer 1 - Gói Vườn Xanh (Active)
IF @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'orchard')
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer1ID, N'Gói Vườn Xanh', N'orchard', '2024-01-01', '2025-01-01', N'Active', 1290000.00, N'VND');
        PRINT '  - Inserted: Subscription for farmer1@mammoi.com (Gói Vườn Xanh)'
    END
END

-- Subscription 2: Farmer 2 - Gói Ươm Mầm (Active)
IF @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'seedling')
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer2ID, N'Gói Ươm Mầm', N'seedling', '2024-03-15', '2025-03-15', N'Active', 490000.00, N'VND');
        PRINT '  - Inserted: Subscription for farmer2@mammoi.com (Gói Ươm Mầm)'
    END
END

-- Subscription 3: Farmer 3 - Gói Thu Hoạch (Active)
IF @Farmer3ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer3ID AND [PlanType] = N'harvest')
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer3ID, N'Gói Thu Hoạch', N'harvest', '2024-06-01', '2025-06-01', N'Active', 3890000.00, N'VND');
        PRINT '  - Inserted: Subscription for farmer3@mammoi.com (Gói Thu Hoạch)'
    END
END

-- Subscription 4: Farmer 1 - Previous subscription (Expired)
IF @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'seedling')
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer1ID, N'Gói Ươm Mầm', N'seedling', '2023-01-01', '2023-12-31', N'Expired', 490000.00, N'VND');
        PRINT '  - Inserted: Previous subscription for farmer1@mammoi.com (Expired)'
    END
END

-- Subscription 5: Farmer 2 - Another subscription (Active - Gói Vườn Xanh)
IF @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'orchard' AND [StartDate] < '2024-03-15')
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer2ID, N'Gói Vườn Xanh', N'orchard', '2023-12-01', '2024-11-30', N'Expired', 1290000.00, N'VND');
        PRINT '  - Inserted: Previous subscription for farmer2@mammoi.com (Expired - Gói Vườn Xanh)'
    END
END
GO

-- ===== 11. PAYMENTS =====
PRINT 'Inserting Payments...'
GO

DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Farmer2ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');
DECLARE @Farmer3ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer3@mammoi.com');

-- Payment 1: Farmer 1 - Success payment for Gói Vườn Xanh
DECLARE @Sub1ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'orchard' AND [Status] = N'Active');
IF @Sub1ID IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub1ID AND [PaymentDate] = '2024-01-01')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub1ID, @Farmer1ID, '2024-01-01', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-' + CAST(@Sub1ID AS NVARCHAR(10)) + '-001', 
                N'Thanh toán gói dịch vụ Gói Vườn Xanh', N'INV-2024-001', 0, '2024-01-01 10:30:00');
        PRINT '  - Inserted: Payment for farmer1@mammoi.com (Success - Gói Vườn Xanh)'
    END
END

-- Payment 2: Farmer 2 - Success payment for Gói Ươm Mầm
DECLARE @Sub2ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'seedling' AND [Status] = N'Active');
IF @Sub2ID IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub2ID AND [PaymentDate] = '2024-03-15')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub2ID, @Farmer2ID, '2024-03-15', 490000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-' + CAST(@Sub2ID AS NVARCHAR(10)) + '-001', 
                N'Thanh toán gói dịch vụ Gói Ươm Mầm', N'INV-2024-015', 0, '2024-03-15 14:20:00');
        PRINT '  - Inserted: Payment for farmer2@mammoi.com (Success - Gói Ươm Mầm)'
    END
END

-- Payment 3: Farmer 3 - Success payment for Gói Thu Hoạch
DECLARE @Sub3ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer3ID AND [PlanType] = N'harvest' AND [Status] = N'Active');
IF @Sub3ID IS NOT NULL AND @Farmer3ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub3ID AND [PaymentDate] = '2024-06-01')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub3ID, @Farmer3ID, '2024-06-01', 3890000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-' + CAST(@Sub3ID AS NVARCHAR(10)) + '-001', 
                N'Thanh toán gói dịch vụ Gói Thu Hoạch', N'INV-2024-061', 0, '2024-06-01 09:15:00');
        PRINT '  - Inserted: Payment for farmer3@mammoi.com (Success - Gói Thu Hoạch)'
    END
END

-- Payment 4: Farmer 1 - Previous expired subscription payment
DECLARE @Sub4ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'seedling' AND [Status] = N'Expired');
IF @Sub4ID IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub4ID)
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub4ID, @Farmer1ID, '2023-01-01', 490000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-' + CAST(@Sub4ID AS NVARCHAR(10)) + '-001', 
                N'Thanh toán gói dịch vụ Gói Ươm Mầm (2023)', N'INV-2023-001', 0, '2023-01-01 11:00:00');
        PRINT '  - Inserted: Previous payment for farmer1@mammoi.com (2023)'
    END
END

-- Payment 5: Farmer 2 - Previous expired subscription payment
DECLARE @Sub5ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'orchard' AND [Status] = N'Expired');
IF @Sub5ID IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub5ID)
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub5ID, @Farmer2ID, '2023-12-01', 1290000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-' + CAST(@Sub5ID AS NVARCHAR(10)) + '-001', 
                N'Thanh toán gói dịch vụ Gói Vườn Xanh (2023)', N'INV-2023-120', 0, '2023-12-01 16:45:00');
        PRINT '  - Inserted: Previous payment for farmer2@mammoi.com (2023)'
    END
END

-- Payment 6: Failed payment attempt
DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Sub1ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'orchard' AND [Status] = N'Active');
IF @Farmer1ID IS NOT NULL AND @Sub1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer1ID AND [TransactionStatus] = N'Failed')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub1ID, @Farmer1ID, '2024-01-01', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Failed', N'TXN-' + CAST(@Sub1ID AS NVARCHAR(10)) + '-FAIL', 
                N'Thanh toán thất bại - Gói Vườn Xanh', N'INV-2024-001-FAIL', 0, '2024-01-01 09:15:00');
        PRINT '  - Inserted: Failed payment for farmer1@mammoi.com'
    END
END
GO

-- Payment 7: Pending payment
DECLARE @Farmer2ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');
DECLARE @Sub2ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'seedling' AND [Status] = N'Active');
IF @Farmer2ID IS NOT NULL AND @Sub2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer2ID AND [TransactionStatus] = N'Pending')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub2ID, @Farmer2ID, '2024-03-14', 490000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Pending', N'TXN-' + CAST(@Sub2ID AS NVARCHAR(10)) + '-PEND', 
                N'Thanh toán đang xử lý - Gói Ươm Mầm', N'INV-2024-014-PEND', 0, '2024-03-14 20:30:00');
        PRINT '  - Inserted: Pending payment for farmer2@mammoi.com'
    END
END
GO

-- Payment 8-15: Additional payments for different months (for revenue statistics)
-- Generate payments from different months in 2024
DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Sub1ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'orchard' AND [Status] = N'Active');
IF @Farmer1ID IS NOT NULL AND @Sub1ID IS NOT NULL
BEGIN
    -- February 2024
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer1ID AND [PaymentDate] = '2024-02-15')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub1ID, @Farmer1ID, '2024-02-15', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240215-001', 
                N'Gia hạn gói dịch vụ Gói Vườn Xanh', N'INV-2024-045', 0, '2024-02-15 10:00:00');
    END
END
GO

-- March 2024 - Additional farmer
DECLARE @Farmer3ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer3@mammoi.com');
IF @Farmer3ID IS NOT NULL
BEGIN
    DECLARE @TempSubID INT;
    SELECT @TempSubID = [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer3ID AND [PlanType] = N'orchard';
    IF @TempSubID IS NULL
    BEGIN
        INSERT INTO [dbo].[Subscriptions] ([UserID], [PlanName], [PlanType], [StartDate], [EndDate], [Status], [Price], [Currency])
        VALUES (@Farmer3ID, N'Gói Vườn Xanh', N'orchard', '2024-03-01', '2025-03-01', N'Active', 1290000.00, N'VND');
        SET @TempSubID = SCOPE_IDENTITY();
    END
    
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer3ID AND [PaymentDate] = '2024-03-01')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@TempSubID, @Farmer3ID, '2024-03-01', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240301-001', 
                N'Thanh toán gói dịch vụ Gói Vườn Xanh', N'INV-2024-060', 0, '2024-03-01 15:30:00');
    END
END
GO

-- April 2024
DECLARE @Farmer2ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');
DECLARE @Sub2ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'seedling' AND [Status] = N'Active');
IF @Farmer2ID IS NOT NULL AND @Sub2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer2ID AND [PaymentDate] BETWEEN '2024-04-01' AND '2024-04-30')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub2ID, @Farmer2ID, '2024-04-10', 490000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20240410-001', 
                N'Thanh toán bổ sung dịch vụ', N'INV-2024-100', 0, '2024-04-10 11:20:00');
    END
END
GO

-- May 2024
DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Sub1ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'orchard' AND [Status] = N'Active');
IF @Farmer1ID IS NOT NULL AND @Sub1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer1ID AND [PaymentDate] BETWEEN '2024-05-01' AND '2024-05-31')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub1ID, @Farmer1ID, '2024-05-20', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240520-001', 
                N'Thanh toán gia hạn gói dịch vụ', N'INV-2024-140', 0, '2024-05-20 09:45:00');
    END
END
GO

-- June 2024 - Multiple payments
DECLARE @Farmer3ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer3@mammoi.com');
DECLARE @Sub3ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer3ID AND [PlanType] = N'harvest' AND [Status] = N'Active');
IF @Farmer3ID IS NOT NULL AND @Sub3ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer3ID AND [PaymentDate] = '2024-06-15')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], [IsRefunded], [CreatedAt])
        VALUES (@Sub3ID, @Farmer3ID, '2024-06-15', 3890000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240615-001', 
                N'Thanh toán bổ sung dịch vụ Gói Thu Hoạch', N'INV-2024-165', 0, '2024-06-15 14:00:00');
    END
END
GO

-- Refunded payment example
DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Sub1ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'orchard' AND [Status] = N'Active');
IF @Farmer1ID IS NOT NULL AND @Sub1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [UserID] = @Farmer1ID AND [IsRefunded] = 1)
    BEGIN
        DECLARE @RefundPaymentID INT;
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [Description], [InvoiceNumber], 
                                     [IsRefunded], [RefundAmount], [RefundDate], [RefundReason], [CreatedAt])
        VALUES (@Sub1ID, @Farmer1ID, '2024-07-01', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240701-REFUND', 
                N'Thanh toán đã được hoàn tiền', N'INV-2024-182', 
                1, 1290000.00, '2024-07-05', N'Yêu cầu hoàn tiền từ khách hàng', '2024-07-01 10:00:00');
        PRINT '  - Inserted: Refunded payment for farmer1@mammoi.com'
    END
END
GO

PRINT ''
PRINT '========================================'
PRINT 'Seed data insertion completed!'
PRINT '========================================'
PRINT ''
PRINT 'Summary:'
PRINT '  - Roles: 3 records (SystemAdmin, BusinessAdmin, Farmer)'
PRINT '  - SoilMaster: 5 records'
PRINT '  - Users: 5 records (passwords shown in comments)'
PRINT '  - TreeTypes: 5 records'
PRINT '  - TreeGrowthStages: 5 records'
PRINT '  - Gardens: 5 records'
PRINT '  - GardenSoils: 1 record'
PRINT '  - Trees: 5 records'
PRINT '  - SubscriptionPlans: 3 records'
PRINT '  - Subscriptions: 5+ records'
PRINT '  - Payments: 15+ records'
PRINT ''
PRINT 'Test Accounts:'
PRINT '  - SystemAdmin: systemadmin@mammoi.com / SystemAdmin@123'
PRINT '  - BusinessAdmin: businessadmin@mammoi.com / BusinessAdmin@123'
PRINT '  - Farmer 1: farmer1@mammoi.com / Farmer@123'
PRINT '  - Farmer 2: farmer2@mammoi.com / Farmer2@123'
PRINT '  - Farmer 3: farmer3@mammoi.com / Farmer3@123'
PRINT ''
GO

-- {
--   "email": "systemadmin@mammoi.com",
--   "password": "SystemAdmin@123"
-- }