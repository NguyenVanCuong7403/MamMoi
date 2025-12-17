-- ===== Seed Data Script =====
-- This script inserts sample data into the database
-- Run this script after schema.sql has been executed
-- Note: Passwords are hashed using SHA256. Original passwords are shown in comments.

USE [MamMoi]
GO

-- Check if required tables exist before proceeding
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Roles' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    PRINT 'ERROR: Table [dbo].[Roles] does not exist. Please run schema.sql first!'
    RAISERROR('Required table [dbo].[Roles] does not exist. Please run schema.sql first!', 16, 1)
    RETURN
END
GO

PRINT 'Starting seed data insertion...'
PRINT 'Note: Make sure schema.sql has been executed first.'
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
                                   [DroughtTolerance], [FloodTolerance], [FrostTolerance], [WindTolerance], [IsActive],
                                   [CareGuide], [LightRequirement], [WaterRequirement], [Pests], [SeasonalRoadmap])
    VALUES (1, N'Cây ăn quả', N'Fruit Trees', N'Các loại cây cho quả ăn được', N'Fruit', 20, 18.0, 35.0, 50.0, 80.0, 
            N'Medium', N'Low', N'Low', N'Medium', 1,
            N'["Bón phân định kỳ theo hướng dẫn","Tưới nước đều đặn, tránh úng nước","Cắt tỉa cành sâu bệnh thường xuyên","Phòng trừ sâu bệnh định kỳ","Bón phân hữu cơ để cải thiện đất","Theo dõi và chăm sóc cây thường xuyên"]',
            N'Ánh sáng đầy đủ (6-8 giờ/ngày)',
            N'Tưới đều đặn, 2-3 lần/tuần',
            N'[{"name":"Sâu bệnh thường gặp","description":"Theo dõi và phòng trừ sâu bệnh định kỳ. Sử dụng thuốc trừ sâu sinh học khi có thể.","severity":"Medium"}]',
            N'[{"stage":"Trồng cây","timing":"Mùa mưa","action":"Chuẩn bị đất và trồng cây con"},{"stage":"Chăm sóc","timing":"Quanh năm","action":"Tưới nước, bón phân, làm cỏ"},{"stage":"Thu hoạch","timing":"Theo mùa","action":"Thu hoạch khi cây đạt độ chín"}]');
    PRINT '  - Inserted: Cây ăn quả'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Cây công nghiệp')
BEGIN
    INSERT INTO [dbo].[TreeTypes] ([SoilMasterID], [TreeTypeName], [ScientificName], [Description], [Category], [AverageLifespanYears],
                                   [OptimalTemperatureMin], [OptimalTemperatureMax], [OptimalHumidityMin], [OptimalHumidityMax],
                                   [DroughtTolerance], [FloodTolerance], [FrostTolerance], [WindTolerance], [IsActive],
                                   [CareGuide], [LightRequirement], [WaterRequirement], [Pests], [SeasonalRoadmap])
    VALUES (5, N'Cây công nghiệp', N'Industrial Trees', N'Các loại cây trồng để sản xuất công nghiệp', N'Industrial', 30, 20.0, 32.0, 60.0, 85.0,
            N'High', N'Medium', N'Low', N'High', 1,
            N'["Bón phân định kỳ theo hướng dẫn","Tưới nước đều đặn, tránh úng nước","Cắt tỉa cành sâu bệnh thường xuyên","Phòng trừ sâu bệnh định kỳ","Bón phân hữu cơ để cải thiện đất","Theo dõi và chăm sóc cây thường xuyên"]',
            N'Ánh sáng đầy đủ (6-8 giờ/ngày)',
            N'Tưới đều đặn, 2-3 lần/tuần',
            N'[{"name":"Sâu bệnh thường gặp","description":"Theo dõi và phòng trừ sâu bệnh định kỳ. Sử dụng thuốc trừ sâu sinh học khi có thể.","severity":"Medium"}]',
            N'[{"stage":"Trồng cây","timing":"Mùa mưa","action":"Chuẩn bị đất và trồng cây con"},{"stage":"Chăm sóc","timing":"Quanh năm","action":"Tưới nước, bón phân, làm cỏ"},{"stage":"Thu hoạch","timing":"Theo mùa","action":"Thu hoạch khi cây đạt độ chín"}]');
    PRINT '  - Inserted: Cây công nghiệp'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Cây cảnh')
BEGIN
    INSERT INTO [dbo].[TreeTypes] ([SoilMasterID], [TreeTypeName], [ScientificName], [Description], [Category], [AverageLifespanYears],
                                   [OptimalTemperatureMin], [OptimalTemperatureMax], [OptimalHumidityMin], [OptimalHumidityMax],
                                   [DroughtTolerance], [FloodTolerance], [FrostTolerance], [WindTolerance], [IsActive],
                                   [CareGuide], [LightRequirement], [WaterRequirement], [Pests], [SeasonalRoadmap])
    VALUES (1, N'Cây cảnh', N'Ornamental Trees', N'Các loại cây trồng để trang trí', N'Ornamental', 15, 15.0, 30.0, 40.0, 70.0,
            N'Low', N'Low', N'Low', N'Low', 1,
            N'["Bón phân định kỳ theo hướng dẫn","Tưới nước đều đặn, tránh úng nước","Cắt tỉa cành sâu bệnh thường xuyên","Phòng trừ sâu bệnh định kỳ","Bón phân hữu cơ để cải thiện đất","Theo dõi và chăm sóc cây thường xuyên"]',
            N'Ánh sáng đầy đủ (6-8 giờ/ngày)',
            N'Tưới đều đặn, 2-3 lần/tuần',
            N'[{"name":"Sâu bệnh thường gặp","description":"Theo dõi và phòng trừ sâu bệnh định kỳ. Sử dụng thuốc trừ sâu sinh học khi có thể.","severity":"Medium"}]',
            N'[{"stage":"Trồng cây","timing":"Mùa mưa","action":"Chuẩn bị đất và trồng cây con"},{"stage":"Chăm sóc","timing":"Quanh năm","action":"Tưới nước, bón phân, làm cỏ"},{"stage":"Thu hoạch","timing":"Theo mùa","action":"Thu hoạch khi cây đạt độ chín"}]');
    PRINT '  - Inserted: Cây cảnh'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Cây lấy gỗ')
BEGIN
    INSERT INTO [dbo].[TreeTypes] ([SoilMasterID], [TreeTypeName], [ScientificName], [Description], [Category], [AverageLifespanYears],
                                   [OptimalTemperatureMin], [OptimalTemperatureMax], [OptimalHumidityMin], [OptimalHumidityMax],
                                   [DroughtTolerance], [FloodTolerance], [FrostTolerance], [WindTolerance], [IsActive],
                                   [CareGuide], [LightRequirement], [WaterRequirement], [Pests], [SeasonalRoadmap])
    VALUES (4, N'Cây lấy gỗ', N'Timber Trees', N'Các loại cây trồng để lấy gỗ', N'Timber', 50, 10.0, 28.0, 55.0, 90.0,
            N'High', N'High', N'Medium', N'High', 1,
            N'["Bón phân định kỳ theo hướng dẫn","Tưới nước đều đặn, tránh úng nước","Cắt tỉa cành sâu bệnh thường xuyên","Phòng trừ sâu bệnh định kỳ","Bón phân hữu cơ để cải thiện đất","Theo dõi và chăm sóc cây thường xuyên"]',
            N'Ánh sáng đầy đủ (6-8 giờ/ngày)',
            N'Tưới đều đặn, 2-3 lần/tuần',
            N'[{"name":"Sâu bệnh thường gặp","description":"Theo dõi và phòng trừ sâu bệnh định kỳ. Sử dụng thuốc trừ sâu sinh học khi có thể.","severity":"Medium"}]',
            N'[{"stage":"Trồng cây","timing":"Mùa mưa","action":"Chuẩn bị đất và trồng cây con"},{"stage":"Chăm sóc","timing":"Quanh năm","action":"Tưới nước, bón phân, làm cỏ"},{"stage":"Thu hoạch","timing":"Theo mùa","action":"Thu hoạch khi cây đạt độ chín"}]');
    PRINT '  - Inserted: Cây lấy gỗ'
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Cây dược liệu')
BEGIN
    INSERT INTO [dbo].[TreeTypes] ([SoilMasterID], [TreeTypeName], [ScientificName], [Description], [Category], [AverageLifespanYears],
                                   [OptimalTemperatureMin], [OptimalTemperatureMax], [OptimalHumidityMin], [OptimalHumidityMax],
                                   [DroughtTolerance], [FloodTolerance], [FrostTolerance], [WindTolerance], [IsActive],
                                   [CareGuide], [LightRequirement], [WaterRequirement], [Pests], [SeasonalRoadmap])
    VALUES (1, N'Cây dược liệu', N'Medicinal Trees', N'Các loại cây có giá trị dược liệu', N'Medicinal', 25, 18.0, 30.0, 50.0, 75.0,
            N'Medium', N'Low', N'Low', N'Medium', 1,
            N'["Bón phân định kỳ theo hướng dẫn","Tưới nước đều đặn, tránh úng nước","Cắt tỉa cành sâu bệnh thường xuyên","Phòng trừ sâu bệnh định kỳ","Bón phân hữu cơ để cải thiện đất","Theo dõi và chăm sóc cây thường xuyên"]',
            N'Ánh sáng đầy đủ (6-8 giờ/ngày)',
            N'Tưới đều đặn, 2-3 lần/tuần',
            N'[{"name":"Sâu bệnh thường gặp","description":"Theo dõi và phòng trừ sâu bệnh định kỳ. Sử dụng thuốc trừ sâu sinh học khi có thể.","severity":"Medium"}]',
            N'[{"stage":"Trồng cây","timing":"Mùa mưa","action":"Chuẩn bị đất và trồng cây con"},{"stage":"Chăm sóc","timing":"Quanh năm","action":"Tưới nước, bón phân, làm cỏ"},{"stage":"Thu hoạch","timing":"Theo mùa","action":"Thu hoạch khi cây đạt độ chín"}]');
    PRINT '  - Inserted: Cây dược liệu'
END
GO

-- ===== 4.1. Update sample data for specific TreeTypes (if they exist) =====
PRINT 'Updating sample data for specific TreeTypes...'
GO

-- Update Xoài (Mango) - by name
IF EXISTS (SELECT 1 FROM [dbo].[TreeTypes] WHERE [TreeTypeName] LIKE N'%Xoài%' OR [TreeTypeName] LIKE N'%Mango%')
BEGIN
    UPDATE [dbo].[TreeTypes]
    SET 
        [CareGuide] = N'["Bón thúc NPK 16-16-8 với liều lượng 0.5-1kg/cây vào đầu mùa mưa","Tưới nước đều đặn 2-3 lần/tuần trong mùa khô, đảm bảo đất luôn ẩm nhưng không úng","Cắt tỉa cành già, cành sâu bệnh sau mỗi vụ thu hoạch để cây phát triển tốt","Phun thuốc phòng trừ sâu bệnh định kỳ, đặc biệt là rầy mềm và bệnh thán thư","Bón phân hữu cơ 10-15kg/cây/năm để cải thiện chất lượng đất","Che phủ gốc bằng rơm rạ hoặc cỏ khô để giữ ẩm và hạn chế cỏ dại"]',
        [LightRequirement] = N'Ánh sáng đầy đủ (6-8 giờ/ngày)',
        [WaterRequirement] = N'Tưới đều đặn, 2-3 lần/tuần',
        [Pests] = N'[{"name":"Rầy mềm","description":"Rầy mềm hút nhựa cây, làm lá vàng, quả kém phát triển. Phòng trừ bằng thuốc trừ sâu sinh học hoặc dầu khoáng.","severity":"High"},{"name":"Bệnh thán thư","description":"Bệnh do nấm gây ra, xuất hiện đốm đen trên lá và quả. Phòng trừ bằng thuốc trừ nấm và vệ sinh vườn.","severity":"High"},{"name":"Ruồi đục quả","description":"Ruồi đẻ trứng vào quả non, ấu trùng phá hoại bên trong. Sử dụng bẫy pheromone và bao quả.","severity":"Medium"},{"name":"Sâu đục thân","description":"Sâu đục vào thân cây làm cây suy yếu. Phòng trừ bằng cách quét vôi gốc và phun thuốc trừ sâu.","severity":"Low"}]',
        [SeasonalRoadmap] = N'[{"stage":"Gieo trồng","timing":"Tháng 5-6","action":"Chuẩn bị đất, trồng cây con, tưới nước đều đặn"},{"stage":"Chăm sóc non","timing":"Tháng 7-9","action":"Bón phân lót, tưới nước, phòng trừ sâu bệnh"},{"stage":"Phát triển","timing":"Tháng 10-12","action":"Bón thúc NPK, cắt tỉa cành, tạo tán"},{"stage":"Ra hoa","timing":"Tháng 1-2","action":"Tưới nước đầy đủ, phun thuốc kích thích ra hoa nếu cần"},{"stage":"Đậu quả","timing":"Tháng 3-4","action":"Bón phân kali, tưới nước, bao quả để tránh sâu bệnh"},{"stage":"Thu hoạch","timing":"Tháng 5-6","action":"Thu hoạch khi quả chín 70-80%, bảo quản nơi khô ráo"}]'
    WHERE ([TreeTypeName] LIKE N'%Xoài%' OR [TreeTypeName] LIKE N'%Mango%')
      AND ([CareGuide] IS NULL OR [LightRequirement] IS NULL);
    PRINT '  - Updated: Xoài (Mango)'
END
GO

-- Update Bơ (Avocado) - by name
IF EXISTS (SELECT 1 FROM [dbo].[TreeTypes] WHERE [TreeTypeName] LIKE N'%Bơ%' OR [TreeTypeName] LIKE N'%Avocado%')
BEGIN
    UPDATE [dbo].[TreeTypes]
    SET 
        [CareGuide] = N'["Bón phân NPK 20-20-15 với liều lượng 0.5-1.5kg/cây vào đầu và giữa mùa mưa","Tưới nước sâu 1-2 lần/tuần, đảm bảo đất ẩm nhưng không úng nước","Cắt tỉa cành vượt, cành sâu bệnh để tạo tán đều và thông thoáng","Phòng trừ bệnh thối rễ bằng cách cải thiện hệ thống thoát nước","Bón phân hữu cơ 15-20kg/cây/năm để tăng độ phì nhiêu của đất","Che phủ gốc bằng mùn hữu cơ để giữ ẩm và điều hòa nhiệt độ"]',
        [LightRequirement] = N'Ánh sáng đầy đủ (6-8 giờ/ngày)',
        [WaterRequirement] = N'Tưới sâu 1-2 lần/tuần',
        [Pests] = N'[{"name":"Bệnh thối rễ","description":"Bệnh do nấm Phytophthora gây ra, làm rễ thối, cây chết. Phòng trừ bằng cách cải thiện thoát nước và phun thuốc trừ nấm.","severity":"High"},{"name":"Rệp sáp","description":"Rệp sáp hút nhựa cây, làm lá vàng, quả kém phát triển. Phòng trừ bằng thuốc trừ sâu hoặc thiên địch.","severity":"Medium"},{"name":"Sâu đục quả","description":"Sâu đục vào quả non làm quả rụng. Sử dụng bẫy pheromone và phun thuốc trừ sâu.","severity":"Low"}]',
        [SeasonalRoadmap] = N'[{"stage":"Trồng cây","timing":"Tháng 4-5","action":"Chuẩn bị hố trồng, trồng cây con, tưới nước đều"},{"stage":"Chăm sóc","timing":"Tháng 6-8","action":"Bón phân lót, tưới nước, làm cỏ"},{"stage":"Phát triển","timing":"Tháng 9-11","action":"Bón thúc, cắt tỉa, tạo tán"},{"stage":"Ra hoa","timing":"Tháng 12-2","action":"Tưới nước đầy đủ, phun thuốc kích thích"},{"stage":"Đậu quả","timing":"Tháng 3-5","action":"Bón phân kali, tưới nước, chăm sóc quả"},{"stage":"Thu hoạch","timing":"Tháng 6-8","action":"Thu hoạch khi quả chín, bảo quản lạnh"}]'
    WHERE ([TreeTypeName] LIKE N'%Bơ%' OR [TreeTypeName] LIKE N'%Avocado%')
      AND ([CareGuide] IS NULL OR [LightRequirement] IS NULL);
    PRINT '  - Updated: Bơ (Avocado)'
END
GO

-- Update Thanh Long (Dragon Fruit) - by name
IF EXISTS (SELECT 1 FROM [dbo].[TreeTypes] WHERE [TreeTypeName] LIKE N'%Thanh Long%' OR [TreeTypeName] LIKE N'%Dragon%')
BEGIN
    UPDATE [dbo].[TreeTypes]
    SET 
        [CareGuide] = N'["Bón phân NPK 15-15-15 với liều lượng 0.3-0.5kg/cây vào đầu mùa mưa","Tưới nước 1-2 lần/tuần trong mùa khô, cây chịu hạn tốt nên không cần tưới quá nhiều","Cắt tỉa cành già, cành sâu bệnh để cây tập trung dinh dưỡng cho quả","Làm giá đỡ chắc chắn để cây leo, đảm bảo ánh sáng đầy đủ","Bón phân hữu cơ 5-10kg/cây/năm để cải thiện đất","Phun thuốc phòng trừ nấm bệnh vào mùa mưa"]',
        [LightRequirement] = N'Ánh sáng đầy đủ (8-10 giờ/ngày)',
        [WaterRequirement] = N'Tưới 1-2 lần/tuần (chịu hạn tốt)',
        [Pests] = N'[{"name":"Bệnh thối gốc","description":"Bệnh do nấm gây ra khi đất quá ẩm. Phòng trừ bằng cách cải thiện thoát nước và phun thuốc trừ nấm.","severity":"High"},{"name":"Rệp sáp","description":"Rệp sáp hút nhựa cây, làm cây suy yếu. Phòng trừ bằng thuốc trừ sâu hoặc dầu khoáng.","severity":"Medium"},{"name":"Ruồi đục quả","description":"Ruồi đẻ trứng vào quả, ấu trùng phá hoại. Sử dụng bẫy pheromone và bao quả.","severity":"Low"}]',
        [SeasonalRoadmap] = N'[{"stage":"Trồng cây","timing":"Tháng 3-4","action":"Chuẩn bị giá đỡ, trồng cây con, tưới nước"},{"stage":"Chăm sóc","timing":"Tháng 5-7","action":"Bón phân, tưới nước, làm cỏ"},{"stage":"Phát triển","timing":"Tháng 8-10","action":"Cắt tỉa, bón thúc, chăm sóc cành"},{"stage":"Ra hoa","timing":"Tháng 11-1","action":"Tưới nước, phun thuốc kích thích"},{"stage":"Đậu quả","timing":"Tháng 2-4","action":"Bón phân, tưới nước, bao quả"},{"stage":"Thu hoạch","timing":"Tháng 5-7","action":"Thu hoạch khi quả chín, bảo quản mát"}]'
    WHERE ([TreeTypeName] LIKE N'%Thanh Long%' OR [TreeTypeName] LIKE N'%Dragon%')
      AND ([CareGuide] IS NULL OR [LightRequirement] IS NULL);
    PRINT '  - Updated: Thanh Long (Dragon Fruit)'
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
                       [GardenSoilID], [IsActive], [IsFruiting], [ExpectedHarvestDate], [Notes], [VirtualAgeMonths], [CycleCount])
        VALUES (@Garden1IDForTrees, @Farmer1IDForTrees, @TreeTypeFruitIDForTrees, @Stage1ID, N'TREE001', N'Cây Xoài 1', '2024-01-15', N'Góc trái vườn',
            @GardenSoil1ID, 1, 0, '2025-06-15', N'Cây mới trồng, cần chăm sóc kỹ', NULL, 0);
        PRINT '  - Inserted: Cây Xoài 1'
    END
    
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Cam 1' AND [GardenID] = @Garden1IDForTrees)
    BEGIN
        INSERT INTO [dbo].[Trees] ([GardenID], [UserID], [TreeTypeID], [StageID], [TreeCode], [TreeName], [PlantDate], [Location],
                       [GardenSoilID], [IsActive], [IsFruiting], [ExpectedHarvestDate], [Notes], [VirtualAgeMonths], [CycleCount])
        VALUES (@Garden1IDForTrees, @Farmer1IDForTrees, @TreeTypeFruitIDForTrees, @Stage2ID, N'TREE002', N'Cây Cam 1', '2023-06-20', N'Góc phải vườn',
            @GardenSoil1ID, 1, 0, '2024-12-20', N'Cây đang phát triển tốt', NULL, 1);
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
                       [GardenSoilID], [IsActive], [IsFruiting], [ExpectedHarvestDate], [Notes], [VirtualAgeMonths], [CycleCount])
        VALUES (@Garden2ID, @Farmer1IDForTrees2, @TreeTypeFruitIDForTrees2, @Stage2IDForTrees, N'TREE003', N'Cây Ổi 1', '2023-09-10', N'Giữa vườn',
            NULL, 1, 1, '2024-09-10', N'Cây đã bắt đầu ra quả', NULL, 2);
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
                       [GardenSoilID], [IsActive], [IsFruiting], [ExpectedHarvestDate], [Notes], [VirtualAgeMonths], [CycleCount])
        VALUES (@Garden3ID, @Farmer2IDForTrees, @TreeTypeIndustrialIDForTrees, @Stage2IDForTrees2, N'TREE004', N'Cây Cao Su 1', '2022-05-15', N'Khu A1',
            NULL, 1, 0, NULL, N'Cây cao su đang phát triển tốt', NULL, 3);
        PRINT '  - Inserted: Cây Cao Su 1'
    END
    
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Cà Phê 1' AND [GardenID] = @Garden3ID)
    BEGIN
        INSERT INTO [dbo].[Trees] ([GardenID], [UserID], [TreeTypeID], [StageID], [TreeCode], [TreeName], [PlantDate], [Location],
                       [GardenSoilID], [IsActive], [IsFruiting], [ExpectedHarvestDate], [Notes], [VirtualAgeMonths], [CycleCount])
        VALUES (@Garden3ID, @Farmer2IDForTrees, @TreeTypeIndustrialIDForTrees, @Stage2IDForTrees2, N'TREE005', N'Cây Cà Phê 1', '2023-03-20', N'Khu B2',
            NULL, 1, 0, '2025-03-20', N'Cây cà phê mới trồng', NULL, 0);
        PRINT '  - Inserted: Cây Cà Phê 1'
    END
END
GO

-- ===== 9. SUBSCRIPTION PLANS =====
PRINT 'Inserting SubscriptionPlans...'
GO

-- Insert fixed subscription plans (4 plans only)
-- Free Plan: 1 month, 1 garden, 1 tree
IF NOT EXISTS (SELECT 1 FROM [dbo].[SubscriptionPlans] WHERE [PlanName] = N'Gói Miễn Phí')
BEGIN
    INSERT INTO [dbo].[SubscriptionPlans] ([PlanName], [PlanType], [Price], [Currency], [Description], [Features], [MaxGardens], [MaxTreesPerGarden], [DurationInMonths], [IsActive])
    VALUES (N'Gói Miễn Phí', N'free', 0.00, N'VND', 
            N'Gói miễn phí dùng thử: 1 tháng, 1 vườn, 1 cây', 
            N'["Gói miễn phí dùng thử 1 tháng", "Quản lý 1 vườn", "Quản lý 1 cây trong vườn", "Nhắc nhở chăm sóc cơ bản"]', 
            1, 1, 1, 1);
    PRINT 'Inserted: Gói Miễn Phí'
END
ELSE
BEGIN
    PRINT 'Gói Miễn Phí already exists, skipping...'
END
GO

-- Plan 1: 1 garden, 5 trees per garden, price 100
IF NOT EXISTS (SELECT 1 FROM [dbo].[SubscriptionPlans] WHERE [PlanName] = N'Gói 1')
BEGIN
    INSERT INTO [dbo].[SubscriptionPlans] ([PlanName], [PlanType], [Price], [Currency], [Description], [Features], [MaxGardens], [MaxTreesPerGarden], [DurationInMonths], [IsActive])
    VALUES (N'Gói 1', N'plan1', 100.00, N'VND', 
            N'Gói 1: Tạo được 1 vườn và mỗi vườn 5 cây', 
            N'["Quản lý 1 vườn", "Mỗi vườn tối đa 5 cây", "Nhắc nhở chăm sóc", "Theo dõi tăng trưởng"]', 
            1, 5, NULL, 1);
    PRINT 'Inserted: Gói 1'
END
ELSE
BEGIN
    PRINT 'Gói 1 already exists, skipping...'
END
GO

-- Plan 2: 5 gardens, 5 trees per garden, price 500
IF NOT EXISTS (SELECT 1 FROM [dbo].[SubscriptionPlans] WHERE [PlanName] = N'Gói 2')
BEGIN
    INSERT INTO [dbo].[SubscriptionPlans] ([PlanName], [PlanType], [Price], [Currency], [Description], [Features], [MaxGardens], [MaxTreesPerGarden], [DurationInMonths], [IsActive])
    VALUES (N'Gói 2', N'plan2', 500.00, N'VND', 
            N'Gói 2: Tạo 5 vườn và mỗi vườn 5 cây', 
            N'["Quản lý tối đa 5 vườn", "Mỗi vườn tối đa 5 cây", "Nhắc nhở chăm sóc thông minh", "Phân tích tăng trưởng chi tiết", "Tư vấn AI về chăm sóc cây"]', 
            5, 5, NULL, 1);
    PRINT 'Inserted: Gói 2'
END
ELSE
BEGIN
    PRINT 'Gói 2 already exists, skipping...'
END
GO

-- Plan 3: Unlimited gardens and trees, price 990
IF NOT EXISTS (SELECT 1 FROM [dbo].[SubscriptionPlans] WHERE [PlanName] = N'Gói 3')
BEGIN
    INSERT INTO [dbo].[SubscriptionPlans] ([PlanName], [PlanType], [Price], [Currency], [Description], [Features], [MaxGardens], [MaxTreesPerGarden], [DurationInMonths], [IsActive])
    VALUES (N'Gói 3', N'plan3', 990.00, N'VND', 
            N'Gói 3: Không giới hạn vườn và cây trong vườn', 
            N'["Quản lý không giới hạn số vườn", "Không giới hạn số cây trong mỗi vườn", "Nhắc nhở chăm sóc thông minh với AI", "Phân tích tăng trưởng nâng cao", "Tư vấn AI chuyên sâu", "Hỗ trợ 24/7 ưu tiên", "Báo cáo thời tiết chi tiết", "Xuất báo cáo chuyên nghiệp"]', 
            NULL, NULL, NULL, 1);
    PRINT 'Inserted: Gói 3'
END
ELSE
BEGIN
    PRINT 'Gói 3 already exists, skipping...'
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

-- ===== Update TreeVariety with ImageUrl =====
PRINT ''
PRINT 'Updating TreeVariety with sample ImageUrl...'
GO

-- Update existing varieties with sample image URLs (if they don't have one)
UPDATE [dbo].[TreeVariety]
SET [ImageUrl] = N'https://images.unsplash.com/photo-1605027990121-166a3b1b0c0b?w=400'
WHERE [ImageUrl] IS NULL 
  AND ([VarietyName] LIKE N'%Xoài%' OR [VarietyName] LIKE N'%Mango%');

UPDATE [dbo].[TreeVariety]
SET [ImageUrl] = N'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400'
WHERE [ImageUrl] IS NULL 
  AND ([VarietyName] LIKE N'%Bơ%' OR [VarietyName] LIKE N'%Avocado%');

UPDATE [dbo].[TreeVariety]
SET [ImageUrl] = N'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400'
WHERE [ImageUrl] IS NULL 
  AND ([VarietyName] LIKE N'%Thanh Long%' OR [VarietyName] LIKE N'%Dragon%');

-- Set default image for other varieties
UPDATE [dbo].[TreeVariety]
SET [ImageUrl] = N'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'
WHERE [ImageUrl] IS NULL;

PRINT '  - Updated TreeVariety ImageUrl fields'
GO

-- ===== 12. CARE SCHEDULES =====
PRINT ''
PRINT 'Inserting CareSchedules...'
GO

-- Get Tree IDs and User IDs
DECLARE @Tree1ID INT;
DECLARE @Tree2ID INT;
DECLARE @Tree3ID INT;
DECLARE @Tree4ID INT;
DECLARE @Tree5ID INT;
DECLARE @Farmer1ID INT;
DECLARE @Farmer2ID INT;

-- Only get IDs if tables exist
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Trees' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    SELECT @Tree1ID = [TreeID] FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Xoài 1';
    SELECT @Tree2ID = [TreeID] FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Cam 1';
    SELECT @Tree3ID = [TreeID] FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Ổi 1';
    SELECT @Tree4ID = [TreeID] FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Cao Su 1';
    SELECT @Tree5ID = [TreeID] FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Cà Phê 1';
END

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Users' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    SELECT @Farmer1ID = [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com';
    SELECT @Farmer2ID = [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com';
END

-- Care Schedule 1: Tưới nước cho Cây Xoài 1 (Pending)
IF @Tree1ID IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[CareSchedules] WHERE [TreeID] = @Tree1ID AND [TaskType] = N'Tưới nước' AND [ScheduledDate] = CAST(GETDATE() AS DATE))
    BEGIN
        INSERT INTO [dbo].[CareSchedules] ([TreeID], [TaskType], [TaskName], [Description], [ScheduledDate], [ScheduledTimeOfDay], 
                                          [EstimatedDurationMinutes], [Status], [WaterAmountLiters], [WaterSource], 
                                          [Priority], [IsAutoGenerated], [CreatedAt])
        VALUES (@Tree1ID, N'Tưới nước', N'Tưới nước cho Cây Xoài 1', N'Tưới nước đều đặn để cây phát triển tốt', 
                CAST(GETDATE() AS DATE), N'Morning', 15, N'Pending', 2.0, N'Nước máy', N'Normal', 1, GETDATE());
        PRINT '  - Inserted: CareSchedule - Tưới nước (Cây Xoài 1)'
    END
END
GO

-- Care Schedule 2: Bón phân cho Cây Cam 1 (Scheduled)
IF @Tree2ID IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[CareSchedules] WHERE [TreeID] = @Tree2ID AND [TaskType] = N'Bón phân' AND [ScheduledDate] = DATEADD(DAY, 2, CAST(GETDATE() AS DATE)))
    BEGIN
        INSERT INTO [dbo].[CareSchedules] ([TreeID], [TaskType], [TaskName], [Description], [ScheduledDate], [ScheduledTimeOfDay], 
                                          [EstimatedDurationMinutes], [Status], [FertilizerType], [FertilizerAmountGrams], 
                                          [ApplicationMethod], [Priority], [IsAutoGenerated], [CreatedAt])
        VALUES (@Tree2ID, N'Bón phân', N'Bón phân cho Cây Cam 1', N'Bón phân NPK 16-16-8 để cây phát triển tốt', 
                DATEADD(DAY, 2, CAST(GETDATE() AS DATE)), N'Morning', 30, N'Scheduled', N'NPK 16-16-8', 100, 
                N'Rải xung quanh gốc', N'Normal', 1, GETDATE());
        PRINT '  - Inserted: CareSchedule - Bón phân (Cây Cam 1)'
    END
END
GO

-- Care Schedule 3: Tưới nước cho Cây Ổi 1 (Completed)
IF @Tree3ID IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[CareSchedules] WHERE [TreeID] = @Tree3ID AND [TaskType] = N'Tưới nước' AND [Status] = N'Completed')
    BEGIN
        INSERT INTO [dbo].[CareSchedules] ([TreeID], [TaskType], [TaskName], [Description], [ScheduledDate], [ScheduledTimeOfDay], 
                                          [EstimatedDurationMinutes], [Status], [CompletedAt], [CompletedByUserID], 
                                          [WaterAmountLiters], [ActualWaterAmountLiters], [WaterSource], 
                                          [CompletionNotes], [ResultRating], [Priority], [CreatedAt])
        VALUES (@Tree3ID, N'Tưới nước', N'Tưới nước cho Cây Ổi 1', N'Tưới nước đều đặn', 
                DATEADD(DAY, -1, CAST(GETDATE() AS DATE)), N'Morning', 15, N'Completed', DATEADD(DAY, -1, GETDATE()), @Farmer1ID,
                1.5, 1.5, N'Nước máy', N'Đã tưới đầy đủ, cây phát triển tốt', 5, N'Normal', DATEADD(DAY, -2, GETDATE()));
        PRINT '  - Inserted: CareSchedule - Tưới nước (Cây Ổi 1) - Completed'
    END
END
GO

-- Care Schedule 4: Cắt tỉa cho Cây Cao Su 1 (Pending)
IF @Tree4ID IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[CareSchedules] WHERE [TreeID] = @Tree4ID AND [TaskType] = N'Cắt tỉa' AND [ScheduledDate] = DATEADD(DAY, 3, CAST(GETDATE() AS DATE)))
    BEGIN
        INSERT INTO [dbo].[CareSchedules] ([TreeID], [TaskType], [TaskName], [Description], [ScheduledDate], [ScheduledTimeOfDay], 
                                          [EstimatedDurationMinutes], [Status], [PruningType], [Priority], [IsAutoGenerated], [CreatedAt])
        VALUES (@Tree4ID, N'Cắt tỉa', N'Cắt tỉa cành cho Cây Cao Su 1', N'Cắt tỉa cành già, cành sâu bệnh', 
                DATEADD(DAY, 3, CAST(GETDATE() AS DATE)), N'Morning', 45, N'Pending', N'Tỉa cành', N'Normal', 1, GETDATE());
        PRINT '  - Inserted: CareSchedule - Cắt tỉa (Cây Cao Su 1)'
    END
END
GO

-- Care Schedule 5: Bón phân cho Cây Cà Phê 1 (Scheduled)
IF @Tree5ID IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[CareSchedules] WHERE [TreeID] = @Tree5ID AND [TaskType] = N'Bón phân' AND [ScheduledDate] = DATEADD(DAY, 5, CAST(GETDATE() AS DATE)))
    BEGIN
        INSERT INTO [dbo].[CareSchedules] ([TreeID], [TaskType], [TaskName], [Description], [ScheduledDate], [ScheduledTimeOfDay], 
                                          [EstimatedDurationMinutes], [Status], [FertilizerType], [FertilizerAmountGrams], 
                                          [ApplicationMethod], [Priority], [IsAutoGenerated], [CreatedAt])
        VALUES (@Tree5ID, N'Bón phân', N'Bón phân cho Cây Cà Phê 1', N'Bón phân NPK để cây phát triển tốt', 
                DATEADD(DAY, 5, CAST(GETDATE() AS DATE)), N'Afternoon', 30, N'Scheduled', N'NPK 15-15-15', 150, 
                N'Rải xung quanh gốc', N'Normal', 1, GETDATE());
        PRINT '  - Inserted: CareSchedule - Bón phân (Cây Cà Phê 1)'
    END
END
GO

-- Care Schedule 6: Tưới nước cho Cây Xoài 1 (Completed - past)
IF @Tree1ID IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[CareSchedules] WHERE [TreeID] = @Tree1ID AND [TaskType] = N'Tưới nước' AND [Status] = N'Completed' AND [ScheduledDate] < CAST(GETDATE() AS DATE))
    BEGIN
        INSERT INTO [dbo].[CareSchedules] ([TreeID], [TaskType], [TaskName], [Description], [ScheduledDate], [ScheduledTimeOfDay], 
                                          [EstimatedDurationMinutes], [Status], [CompletedAt], [CompletedByUserID], 
                                          [WaterAmountLiters], [ActualWaterAmountLiters], [WaterSource], 
                                          [CompletionNotes], [ResultRating], [Priority], [CreatedAt])
        VALUES (@Tree1ID, N'Tưới nước', N'Tưới nước cho Cây Xoài 1', N'Tưới nước đều đặn', 
                DATEADD(DAY, -3, CAST(GETDATE() AS DATE)), N'Morning', 15, N'Completed', DATEADD(DAY, -3, DATEADD(HOUR, 8, GETDATE())), @Farmer1ID,
                2.0, 2.0, N'Nước máy', N'Đã tưới đầy đủ', 4, N'Normal', DATEADD(DAY, -4, GETDATE()));
        PRINT '  - Inserted: CareSchedule - Tưới nước (Cây Xoài 1) - Completed (Past)'
    END
END
GO

-- Care Schedule 7: Kiểm tra sức khỏe cho Cây Cam 1 (Pending - High Priority)
IF @Tree2ID IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[CareSchedules] WHERE [TreeID] = @Tree2ID AND [TaskType] = N'Kiểm tra sức khỏe' AND [Priority] = N'High')
    BEGIN
        INSERT INTO [dbo].[CareSchedules] ([TreeID], [TaskType], [TaskName], [Description], [ScheduledDate], [ScheduledTimeOfDay], 
                                          [EstimatedDurationMinutes], [Status], [Priority], [Notes], [IsAutoGenerated], [CreatedAt])
        VALUES (@Tree2ID, N'Kiểm tra sức khỏe', N'Kiểm tra sức khỏe cho Cây Cam 1', N'Kiểm tra lá, thân, quả xem có dấu hiệu sâu bệnh không', 
                DATEADD(DAY, 1, CAST(GETDATE() AS DATE)), N'Morning', 20, N'Pending', N'High', N'Cần kiểm tra kỹ vì có dấu hiệu lá vàng', 0, GETDATE());
        PRINT '  - Inserted: CareSchedule - Kiểm tra sức khỏe (Cây Cam 1) - High Priority'
    END
END
GO

-- Care Schedule 8: Recurring task - Tưới nước định kỳ cho Cây Ổi 1
IF @Tree3ID IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[CareSchedules] WHERE [TreeID] = @Tree3ID AND [IsRecurring] = 1 AND [TaskType] = N'Tưới nước')
    BEGIN
        INSERT INTO [dbo].[CareSchedules] ([TreeID], [TaskType], [TaskName], [Description], [ScheduledDate], [ScheduledTimeOfDay], 
                                          [EstimatedDurationMinutes], [Status], [WaterAmountLiters], [WaterSource], 
                                          [Priority], [IsRecurring], [RecurrencePattern], [IsAutoGenerated], [CreatedAt])
        VALUES (@Tree3ID, N'Tưới nước', N'Tưới nước định kỳ cho Cây Ổi 1', N'Tưới nước mỗi 2 ngày', 
                DATEADD(DAY, 2, CAST(GETDATE() AS DATE)), N'Morning', 15, N'Scheduled', 1.5, N'Nước máy', 
                N'Normal', 1, N'Every 2 days', 1, GETDATE());
        PRINT '  - Inserted: CareSchedule - Tưới nước định kỳ (Cây Ổi 1)'
    END
END
GO

-- ===== 13. ACTIVITY LOGS =====
PRINT ''
PRINT 'Inserting ActivityLogs...'
GO

-- Get User IDs and Tree IDs
DECLARE @Farmer1ID INT;
DECLARE @Farmer2ID INT;
DECLARE @SystemAdminID INT;
DECLARE @BusinessAdminID INT;
DECLARE @Tree1ID INT;
DECLARE @Tree2ID INT;
DECLARE @Tree3ID INT;
DECLARE @Garden1ID INT;
DECLARE @CareSchedule1ID INT;
DECLARE @CareSchedule3ID INT;

-- Only get IDs if tables exist
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Users' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    SELECT @Farmer1ID = [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com';
    SELECT @Farmer2ID = [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com';
    SELECT @SystemAdminID = [UserID] FROM [dbo].[Users] WHERE [Email] = 'systemadmin@mammoi.com';
    SELECT @BusinessAdminID = [UserID] FROM [dbo].[Users] WHERE [Email] = 'businessadmin@mammoi.com';
END

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Trees' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    SELECT @Tree1ID = [TreeID] FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Xoài 1';
    SELECT @Tree2ID = [TreeID] FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Cam 1';
    SELECT @Tree3ID = [TreeID] FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Ổi 1';
END

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Gardens' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    SELECT @Garden1ID = [GardenID] FROM [dbo].[Gardens] WHERE [Name] = N'Vườn Cây Ăn Quả Nhà Tôi';
END

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'CareSchedules' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    SELECT @CareSchedule1ID = [ScheduleID] FROM [dbo].[CareSchedules] WHERE [TreeID] = @Tree1ID AND [TaskType] = N'Tưới nước' ORDER BY [CreatedAt] DESC;
    SELECT @CareSchedule3ID = [ScheduleID] FROM [dbo].[CareSchedules] WHERE [TreeID] = @Tree3ID AND [Status] = N'Completed';
END

-- Activity Log 1: User đăng nhập
IF @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[ActivityLogs] WHERE [UserID] = @Farmer1ID AND [ActivityType] = N'Login' AND [CreatedAt] > DATEADD(HOUR, -1, GETDATE()))
    BEGIN
        INSERT INTO [dbo].[ActivityLogs] ([UserID], [ActivityType], [ActivityDescription], [UserAgent], [CreatedAt])
        VALUES (@Farmer1ID, N'Login', N'Người dùng đăng nhập vào hệ thống', N'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', GETDATE());
        PRINT '  - Inserted: ActivityLog - Login (Farmer1)'
    END
END
GO

-- Activity Log 2: Tạo vườn
IF @Farmer1ID IS NOT NULL AND @Garden1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[ActivityLogs] WHERE [UserID] = @Farmer1ID AND [ActivityType] = N'Create' AND [EntityType] = N'Garden' AND [EntityID] = @Garden1ID)
    BEGIN
        INSERT INTO [dbo].[ActivityLogs] ([UserID], [ActivityType], [ActivityDescription], [EntityType], [EntityID], 
                                         [ActionData], [CreatedAt])
        VALUES (@Farmer1ID, N'Create', N'Tạo vườn mới: Vườn Cây Ăn Quả Nhà Tôi', N'Garden', @Garden1ID, 
                N'{"GardenName": "Vườn Cây Ăn Quả Nhà Tôi", "Location": "123 Đường ABC, Quận 1, TP.HCM"}', DATEADD(DAY, -30, GETDATE()));
        PRINT '  - Inserted: ActivityLog - Create Garden'
    END
END
GO

-- Activity Log 3: Thêm cây
IF @Farmer1ID IS NOT NULL AND @Tree1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[ActivityLogs] WHERE [UserID] = @Farmer1ID AND [ActivityType] = N'Create' AND [EntityType] = N'Tree' AND [EntityID] = @Tree1ID)
    BEGIN
        INSERT INTO [dbo].[ActivityLogs] ([UserID], [TreeID], [ActivityType], [ActivityDescription], [EntityType], [EntityID], 
                                         [ActionData], [CreatedAt])
        VALUES (@Farmer1ID, @Tree1ID, N'Create', N'Thêm cây mới: Cây Xoài 1', N'Tree', @Tree1ID, 
                N'{"TreeName": "Cây Xoài 1", "TreeCode": "TREE001", "Location": "Góc trái vườn"}', DATEADD(DAY, -25, GETDATE()));
        PRINT '  - Inserted: ActivityLog - Create Tree (Cây Xoài 1)'
    END
END
GO

-- Activity Log 4: Cập nhật thông tin cây
IF @Farmer1ID IS NOT NULL AND @Tree1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[ActivityLogs] WHERE [UserID] = @Farmer1ID AND [ActivityType] = N'Update' AND [EntityType] = N'Tree' AND [EntityID] = @Tree1ID AND [CreatedAt] > DATEADD(DAY, -20, GETDATE()))
    BEGIN
        INSERT INTO [dbo].[ActivityLogs] ([UserID], [TreeID], [ActivityType], [ActivityDescription], [EntityType], [EntityID], 
                                         [ActionData], [OldValue], [NewValue], [CreatedAt])
        VALUES (@Farmer1ID, @Tree1ID, N'Update', N'Cập nhật thông tin cây: Cây Xoài 1', N'Tree', @Tree1ID, 
                N'{"Field": "Notes"}', N'{"Notes": "Cây mới trồng"}', 
                N'{"Notes": "Cây mới trồng, cần chăm sóc kỹ"}', DATEADD(DAY, -20, GETDATE()));
        PRINT '  - Inserted: ActivityLog - Update Tree (Cây Xoài 1)'
    END
END
GO

-- Activity Log 5: Hoàn thành task chăm sóc
IF @Farmer1ID IS NOT NULL AND @Tree3ID IS NOT NULL AND @CareSchedule3ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[ActivityLogs] WHERE [UserID] = @Farmer1ID AND [ActivityType] = N'Complete' AND [EntityType] = N'CareSchedule' AND [EntityID] = @CareSchedule3ID)
    BEGIN
        INSERT INTO [dbo].[ActivityLogs] ([UserID], [TreeID], [ActivityType], [ActivityDescription], [EntityType], [EntityID], 
                                         [ActionData], [CreatedAt])
        VALUES (@Farmer1ID, @Tree3ID, N'Complete', N'Hoàn thành task: Tưới nước cho Cây Ổi 1', N'CareSchedule', @CareSchedule3ID, 
                N'{"TaskType": "Tưới nước", "ActualWaterAmount": 1.5, "Rating": 5}', DATEADD(DAY, -1, GETDATE()));
        PRINT '  - Inserted: ActivityLog - Complete CareSchedule'
    END
END
GO

-- Activity Log 6: Tạo lịch chăm sóc
IF @Farmer1ID IS NOT NULL AND @Tree1ID IS NOT NULL AND @CareSchedule1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[ActivityLogs] WHERE [UserID] = @Farmer1ID AND [ActivityType] = N'Create' AND [EntityType] = N'CareSchedule' AND [EntityID] = @CareSchedule1ID)
    BEGIN
        INSERT INTO [dbo].[ActivityLogs] ([UserID], [TreeID], [ActivityType], [ActivityDescription], [EntityType], [EntityID], 
                                         [ActionData], [CreatedAt])
        VALUES (@Farmer1ID, @Tree1ID, N'Create', N'Tạo lịch chăm sóc: Tưới nước cho Cây Xoài 1', N'CareSchedule', @CareSchedule1ID, 
                N'{"TaskType": "Tưới nước", "ScheduledDate": "' + CAST(CAST(GETDATE() AS DATE) AS NVARCHAR(50)) + '", "IsAutoGenerated": true}', GETDATE());
        PRINT '  - Inserted: ActivityLog - Create CareSchedule'
    END
END
GO

-- Activity Log 7: Xem chi tiết cây
IF @Farmer1ID IS NOT NULL AND @Tree2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[ActivityLogs] WHERE [UserID] = @Farmer1ID AND [ActivityType] = N'View' AND [EntityType] = N'Tree' AND [EntityID] = @Tree2ID AND [CreatedAt] > DATEADD(HOUR, -2, GETDATE()))
    BEGIN
        INSERT INTO [dbo].[ActivityLogs] ([UserID], [TreeID], [ActivityType], [ActivityDescription], [EntityType], [EntityID], 
                                         [CreatedAt])
        VALUES (@Farmer1ID, @Tree2ID, N'View', N'Xem chi tiết cây: Cây Cam 1', N'Tree', @Tree2ID, DATEADD(HOUR, -1, GETDATE()));
        PRINT '  - Inserted: ActivityLog - View Tree (Cây Cam 1)'
    END
END
GO

-- Activity Log 8: System Admin - Quản lý hệ thống
IF @SystemAdminID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[ActivityLogs] WHERE [UserID] = @SystemAdminID AND [ActivityType] = N'SystemAction' AND [CreatedAt] > DATEADD(DAY, -1, GETDATE()))
    BEGIN
        INSERT INTO [dbo].[ActivityLogs] ([UserID], [ActivityType], [ActivityDescription], [EntityType], 
                                         [ActionData], [CreatedAt])
        VALUES (@SystemAdminID, N'SystemAction', N'Thực hiện bảo trì hệ thống', N'System', 
                N'{"Action": "SystemMaintenance", "Duration": "30 minutes"}', DATEADD(HOUR, -12, GETDATE()));
        PRINT '  - Inserted: ActivityLog - SystemAction (SystemAdmin)'
    END
END
GO

-- Activity Log 9: Business Admin - Quản lý người dùng
IF @BusinessAdminID IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[ActivityLogs] WHERE [UserID] = @BusinessAdminID AND [ActivityType] = N'Update' AND [EntityType] = N'User' AND [EntityID] = @Farmer1ID)
    BEGIN
        INSERT INTO [dbo].[ActivityLogs] ([UserID], [ActivityType], [ActivityDescription], [EntityType], [EntityID], 
                                         [ActionData], [CreatedAt])
        VALUES (@BusinessAdminID, N'Update', N'Cập nhật thông tin người dùng', N'User', @Farmer1ID, 
                N'{"Field": "IsActive", "Value": true}', DATEADD(DAY, -5, GETDATE()));
        PRINT '  - Inserted: ActivityLog - Update User (BusinessAdmin)'
    END
END
GO

-- Activity Log 10: Upload ảnh cây
IF @Farmer1ID IS NOT NULL AND @Tree1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[ActivityLogs] WHERE [UserID] = @Farmer1ID AND [ActivityType] = N'Upload' AND [EntityType] = N'TreeImage' AND [TreeID] = @Tree1ID)
    BEGIN
        INSERT INTO [dbo].[ActivityLogs] ([UserID], [TreeID], [ActivityType], [ActivityDescription], [EntityType], 
                                         [ActionData], [CreatedAt])
        VALUES (@Farmer1ID, @Tree1ID, N'Upload', N'Upload ảnh cho cây: Cây Xoài 1', N'TreeImage', 
                N'{"ImageCount": 1, "ImageType": "TreeHealth"}', DATEADD(DAY, -15, GETDATE()));
        PRINT '  - Inserted: ActivityLog - Upload Tree Image'
    END
END
GO

-- Activity Log 11: Tìm kiếm cây
IF @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[ActivityLogs] WHERE [UserID] = @Farmer1ID AND [ActivityType] = N'Search' AND [CreatedAt] > DATEADD(HOUR, -3, GETDATE()))
    BEGIN
        INSERT INTO [dbo].[ActivityLogs] ([UserID], [ActivityType], [ActivityDescription], 
                                         [ActionData], [CreatedAt])
        VALUES (@Farmer1ID, N'Search', N'Tìm kiếm cây trong vườn', 
                N'{"SearchTerm": "Xoài", "Results": 1}', DATEADD(HOUR, -2, GETDATE()));
        PRINT '  - Inserted: ActivityLog - Search'
    END
END
GO

-- Activity Log 12: Cập nhật lịch chăm sóc
IF @Farmer1ID IS NOT NULL AND @CareSchedule1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[ActivityLogs] WHERE [UserID] = @Farmer1ID AND [ActivityType] = N'Update' AND [EntityType] = N'CareSchedule' AND [EntityID] = @CareSchedule1ID)
    BEGIN
        INSERT INTO [dbo].[ActivityLogs] ([UserID], [TreeID], [ActivityType], [ActivityDescription], [EntityType], [EntityID], 
                                         [ActionData], [OldValue], [NewValue], [CreatedAt])
        VALUES (@Farmer1ID, @Tree1ID, N'Update', N'Cập nhật lịch chăm sóc: Thay đổi thời gian tưới nước', N'CareSchedule', @CareSchedule1ID, 
                N'{"Field": "ScheduledTimeOfDay"}', N'{"ScheduledTimeOfDay": "Afternoon"}', N'{"ScheduledTimeOfDay": "Morning"}', DATEADD(HOUR, -5, GETDATE()));
        PRINT '  - Inserted: ActivityLog - Update CareSchedule'
    END
END
GO

-- Activity Log 13: Farmer 2 - Thêm cây
IF @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[ActivityLogs] WHERE [UserID] = @Farmer2ID AND [ActivityType] = N'Create' AND [EntityType] = N'Tree')
    BEGIN
        INSERT INTO [dbo].[ActivityLogs] ([UserID], [TreeID], [ActivityType], [ActivityDescription], [EntityType], [EntityID], 
                                         [ActionData], [CreatedAt])
        VALUES (@Farmer2ID, @Tree4ID, N'Create', N'Thêm cây mới: Cây Cao Su 1', N'Tree', @Tree4ID, 
                N'{"TreeName": "Cây Cao Su 1", "TreeCode": "TREE004"}', DATEADD(DAY, -40, GETDATE()));
        PRINT '  - Inserted: ActivityLog - Create Tree (Farmer2)'
    END
END
GO

-- Activity Log 14: Đổi mật khẩu
IF @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[ActivityLogs] WHERE [UserID] = @Farmer1ID AND [ActivityType] = N'PasswordChange')
    BEGIN
        INSERT INTO [dbo].[ActivityLogs] ([UserID], [ActivityType], [ActivityDescription], [EntityType], 
                                         [ActionData], [CreatedAt])
        VALUES (@Farmer1ID, N'PasswordChange', N'Đổi mật khẩu tài khoản', N'User', 
                N'{"ChangedAt": "' + CAST(GETDATE() AS NVARCHAR(50)) + '"}', DATEADD(DAY, -7, GETDATE()));
        PRINT '  - Inserted: ActivityLog - Password Change'
    END
END
GO

-- Activity Log 15: Đăng xuất
IF @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[ActivityLogs] WHERE [UserID] = @Farmer1ID AND [ActivityType] = N'Logout' AND [CreatedAt] > DATEADD(HOUR, -24, GETDATE()))
    BEGIN
        INSERT INTO [dbo].[ActivityLogs] ([UserID], [ActivityType], [ActivityDescription], [UserAgent], [CreatedAt])
        VALUES (@Farmer1ID, N'Logout', N'Người dùng đăng xuất khỏi hệ thống', N'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', DATEADD(HOUR, -6, GETDATE()));
        PRINT '  - Inserted: ActivityLog - Logout (Farmer1)'
    END
END
GO

-- ===== ADDITIONAL: CHUỐI (BANANA) TREE TYPE AND STAGES =====
PRINT 'Inserting Chuối (Banana) TreeType and GrowthStages...'
GO

-- Insert Chuối TreeType
IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Chuối')
BEGIN
    DECLARE @SoilMasterIDForBanana INT = (SELECT TOP 1 [SoilMasterID] FROM [dbo].[SoilMaster] WHERE [SoilName] = N'Đất phù sa');
    IF @SoilMasterIDForBanana IS NULL
        SET @SoilMasterIDForBanana = 1; -- Fallback to first soil type
    
    INSERT INTO [dbo].[TreeTypes] ([SoilMasterID], [TreeTypeName], [ScientificName], [Description], [Category], [AverageLifespanYears],
                                   [OptimalTemperatureMin], [OptimalTemperatureMax], [OptimalHumidityMin], [OptimalHumidityMax],
                                   [DroughtTolerance], [FloodTolerance], [FrostTolerance], [WindTolerance], [IsActive],
                                   [CareGuide], [LightRequirement], [WaterRequirement], [Pests], [SeasonalRoadmap])
    VALUES (@SoilMasterIDForBanana, N'Chuối', N'Musa acuminata', N'Cây chuối nhiệt đới, cho quả quanh năm', N'Tropical Fruit', 5, 
            20.0, 35.0, 60.0, 90.0,
            N'Medium', N'High', N'Low', N'Low', 1,
            N'["Bón phân NPK 15-15-15 với liều lượng 0.5-1kg/cây vào đầu mùa mưa","Tưới nước đều đặn 2-3 lần/tuần, đảm bảo đất luôn ẩm","Cắt tỉa lá già, lá bệnh thường xuyên để cây phát triển tốt","Phòng trừ bệnh héo rũ Panama và bệnh đốm lá","Bón phân hữu cơ 10-15kg/cây/năm","Che phủ gốc bằng rơm rạ để giữ ẩm"]',
            N'Ánh sáng đầy đủ (6-8 giờ/ngày)',
            N'Tưới đều đặn, 2-3 lần/tuần',
            N'[{"name":"Bệnh héo rũ Panama","description":"Bệnh do nấm gây ra, làm cây héo và chết. Phòng trừ bằng cách chọn giống kháng bệnh và vệ sinh vườn.","severity":"High"},{"name":"Bệnh đốm lá","description":"Bệnh do nấm gây ra, xuất hiện đốm vàng trên lá. Phòng trừ bằng thuốc trừ nấm.","severity":"Medium"},{"name":"Sâu đục thân","description":"Sâu đục vào thân cây làm cây suy yếu. Phòng trừ bằng cách vệ sinh vườn và phun thuốc trừ sâu.","severity":"Low"}]',
            N'[{"stage":"Trồng cây","timing":"Tháng 3-4","action":"Chuẩn bị đất, trồng cây con, tưới nước đều đặn"},{"stage":"Chăm sóc","timing":"Tháng 5-7","action":"Bón phân lót, tưới nước, làm cỏ"},{"stage":"Sinh trưởng","timing":"Tháng 8-9","action":"Bón thúc, tưới nước, chăm sóc lá"},{"stage":"Ra hoa","timing":"Tháng 10-11","action":"Tưới nước đầy đủ, phun thuốc kích thích ra hoa"},{"stage":"Đậu quả","timing":"Tháng 12-1","action":"Bón phân kali, tưới nước, bao buồng chuối"},{"stage":"Thu hoạch","timing":"Tháng 2-3","action":"Thu hoạch khi quả chín 70-80%, bảo quản nơi khô ráo"}]');
    PRINT '  - Inserted: Chuối (Banana) TreeType'
END
GO

-- Insert TreeGrowthStages for Chuối
DECLARE @TreeTypeBananaID INT = (SELECT TOP 1 [TreeTypeID] FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Chuối');

IF @TreeTypeBananaID IS NOT NULL
BEGIN
    -- Stage 1: Sinh trưởng & Phát triển (0-8 tháng)
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeGrowthStages] WHERE [TreeTypeID] = @TreeTypeBananaID AND [StageOrder] = 1)
    BEGIN
        INSERT INTO [dbo].[TreeGrowthStages] ([TreeTypeID], [StageName], [StageOrder], [Description], [MinAgeInMonths], [MaxAgeInMonths],
                                              [WateringFrequencyDays], [WateringAmountLiters], [FertilizingFrequencyDays], 
                                              [FertilizerType], [FertilizerAmountGrams], [PruningFrequencyDays], 
                                              [CareInstructions], [CommonIssues], [CriticalWeatherFactors], [VulnerabilityLevel])
        VALUES (@TreeTypeBananaID, N'Sinh trưởng & Phát triển', 1, N'Cây phát triển thân lá, ra rễ mạnh', 0, 8, 
                2, 3.0, 60, N'NPK 16-16-8', 150.0, 90,
                N'Tưới nước đều đặn, bón phân định kỳ, làm cỏ xung quanh gốc',
                N'Rệp sáp, nấm lá, sâu đục thân',
                N'Mưa kéo dài, gió mạnh',
                6);
        PRINT '  - Inserted: Sinh trưởng & Phát triển (Chuối) - 0-8 tháng'
    END
    
    -- Stage 2: Ra hoa (8-10 tháng) - Theo yêu cầu: cây chuối đến tuổi tháng 8 thì tự động quy trình phải chuyển sang ra Hoa
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeGrowthStages] WHERE [TreeTypeID] = @TreeTypeBananaID AND [StageOrder] = 2)
    BEGIN
        INSERT INTO [dbo].[TreeGrowthStages] ([TreeTypeID], [StageName], [StageOrder], [Description], [MinAgeInMonths], [MaxAgeInMonths],
                                              [WateringFrequencyDays], [WateringAmountLiters], [FertilizingFrequencyDays],
                                              [FertilizerType], [FertilizerAmountGrams], [PruningFrequencyDays],
                                              [CareInstructions], [CommonIssues], [CriticalWeatherFactors], [VulnerabilityLevel])
        VALUES (@TreeTypeBananaID, N'Ra hoa', 2, N'Hình thành chồi hoa, phân hóa mầm hoa', 8, 10,
                3, 4.0, 45, N'Vi lượng + NPK 12-12-17', 120.0, 60,
                N'Phun vi lượng khi phân hóa mầm hoa, tưới nước đầy đủ, bảo vệ chồi hoa',
                N'Rụng hoa, thối nụ, sâu đục hoa',
                N'Mưa trái mùa, gió mạnh',
                7);
        PRINT '  - Inserted: Ra hoa (Chuối) - 8-10 tháng'
    END
    
    -- Stage 3: Đậu quả (10-12 tháng)
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeGrowthStages] WHERE [TreeTypeID] = @TreeTypeBananaID AND [StageOrder] = 3)
    BEGIN
        INSERT INTO [dbo].[TreeGrowthStages] ([TreeTypeID], [StageName], [StageOrder], [Description], [MinAgeInMonths], [MaxAgeInMonths],
                                              [WateringFrequencyDays], [WateringAmountLiters], [FertilizingFrequencyDays],
                                              [FertilizerType], [FertilizerAmountGrams], [PruningFrequencyDays],
                                              [CareInstructions], [CommonIssues], [CriticalWeatherFactors], [VulnerabilityLevel])
        VALUES (@TreeTypeBananaID, N'Đậu quả', 3, N'Hình thành quả non, nuôi quả ban đầu', 10, 12,
                3, 5.0, 30, N'Kali cao (NPK 15-5-20)', 180.0, 60,
                N'Bảo vệ quả non, bón kali bổ sung, bao buồng chuối',
                N'Rụng quả non, sâu đục quả, bệnh đốm quả',
                N'Mưa trái mùa, nắng nóng',
                7);
        PRINT '  - Inserted: Đậu quả (Chuối) - 10-12 tháng'
    END
    
    -- Stage 4: Trước thu hoạch (12-14 tháng)
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeGrowthStages] WHERE [TreeTypeID] = @TreeTypeBananaID AND [StageOrder] = 4)
    BEGIN
        INSERT INTO [dbo].[TreeGrowthStages] ([TreeTypeID], [StageName], [StageOrder], [Description], [MinAgeInMonths], [MaxAgeInMonths],
                                              [WateringFrequencyDays], [WateringAmountLiters], [FertilizingFrequencyDays],
                                              [FertilizerType], [FertilizerAmountGrams], [PruningFrequencyDays],
                                              [CareInstructions], [CommonIssues], [CriticalWeatherFactors], [VulnerabilityLevel])
        VALUES (@TreeTypeBananaID, N'Trước thu hoạch', 4, N'Nuôi quả lớn, tích lũy đường', 12, 14,
                4, 4.5, 60, N'NPK cân đối (15-15-15)', 150.0, 120,
                N'Giữ ẩm vừa, tỉa lá già, chống đổ ngã',
                N'Nứt quả, thối quả, sâu bệnh',
                N'Nắng nóng, khô hạn, gió mạnh',
                5);
        PRINT '  - Inserted: Trước thu hoạch (Chuối) - 12-14 tháng'
    END
    
    -- Stage 5: Sau thu hoạch (14+ tháng)
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeGrowthStages] WHERE [TreeTypeID] = @TreeTypeBananaID AND [StageOrder] = 5)
    BEGIN
        INSERT INTO [dbo].[TreeGrowthStages] ([TreeTypeID], [StageName], [StageOrder], [Description], [MinAgeInMonths], [MaxAgeInMonths],
                                              [WateringFrequencyDays], [WateringAmountLiters], [FertilizingFrequencyDays],
                                              [FertilizerType], [FertilizerAmountGrams], [PruningFrequencyDays],
                                              [CareInstructions], [CommonIssues], [CriticalWeatherFactors], [VulnerabilityLevel])
        VALUES (@TreeTypeBananaID, N'Sau thu hoạch', 5, N'Phục hồi sau thu, chuẩn bị chu kỳ mới', 14, NULL,
                5, 3.0, 90, N'Hữu cơ + NPK 16-16-8', 200.0, 180,
                N'Tỉa cành chết, vệ sinh vườn, bón phân hữu cơ',
                N'Nấm bệnh lưu tồn, sâu bệnh tích tụ',
                N'Mưa dầm, úng nước',
                4);
        PRINT '  - Inserted: Sau thu hoạch (Chuối) - 14+ tháng'
    END
END
ELSE
BEGIN
    PRINT '  - WARNING: Chuối TreeType not found. Please ensure TreeType is created first.'
END
GO

-- ===== 14. DISEASE LIBRARY =====
PRINT ''
PRINT 'Inserting DiseaseLibrary...'
GO

-- Disease 1: Bệnh thán thư
IF NOT EXISTS (SELECT 1 FROM [dbo].[DiseaseLibrary] WHERE [DiseaseName] = N'Bệnh thán thư')
BEGIN
    INSERT INTO [dbo].[DiseaseLibrary] ([DiseaseName], [ScientificName], [Category], [Symptoms], [Causes], [AffectedParts], [Severity], [SpreadRate], [Treatment], [Prevention], [OrganicTreatment], [ChemicalTreatment], [RecoveryTime], [IsContagious])
    VALUES (N'Bệnh thán thư', N'Colletotrichum gloeosporioides', N'Nấm', 
            N'Xuất hiện đốm đen hoặc nâu trên lá, quả. Đốm lan rộng, mô bệnh khô và chết. Quả bị biến dạng, rụng sớm.',
            N'Do nấm Colletotrichum gloeosporioides gây ra, phát triển mạnh trong điều kiện ẩm ướt, nhiệt độ 25-30°C.',
            N'Lá, quả, cành non', N'High', N'Fast',
            N'Cắt bỏ phần bị bệnh, phun thuốc trừ nấm đồng hoặc mancozeb. Vệ sinh vườn thường xuyên.',
            N'Vệ sinh vườn sạch sẽ, không để ẩm ướt quá mức, phun phòng định kỳ.',
            N'Sử dụng dung dịch đồng sulfat loãng, tỏi nghiền ngâm nước phun lá.',
            N'Mancozeb 80WP, Antracol 70WP, Score 250EC',
            N'2-4 tuần', 1);
    PRINT '  - Inserted: Bệnh thán thư'
END
GO

-- Disease 2: Bệnh héo rũ Panama
IF NOT EXISTS (SELECT 1 FROM [dbo].[DiseaseLibrary] WHERE [DiseaseName] = N'Bệnh héo rũ Panama')
BEGIN
    INSERT INTO [dbo].[DiseaseLibrary] ([DiseaseName], [ScientificName], [Category], [Symptoms], [Causes], [AffectedParts], [Severity], [SpreadRate], [Treatment], [Prevention], [OrganicTreatment], [ChemicalTreatment], [RecoveryTime], [IsContagious])
    VALUES (N'Bệnh héo rũ Panama', N'Fusarium oxysporum f.sp. cubense', N'Nấm', 
            N'Lá vàng từ ngoài rìa vào trong, cuống lá gãy, thân cây bị héo rũ. Khi cắt ngang thân thấy mạch dẫn bị nâu đen.',
            N'Do nấm Fusarium oxysporum gây ra, lây lan qua đất bị nhiễm bệnh và nước tưới.',
            N'Rễ, thân, lá', N'High', N'Medium',
            N'Khó điều trị khi đã nhiễm nặng. Nhổ bỏ cây bệnh, khử trùng đất bằng vôi hoặc formaldehyde.',
            N'Chọn giống kháng bệnh, luân canh cây trồng, không trồng lại ở vùng đất bị bệnh.',
            N'Bón Trichoderma vào đất, bón vôi điều chỉnh pH đất.',
            N'Carbendazim 500FL, Topsin-M 70WP',
            N'Không thể phục hồi khi nhiễm nặng', 1);
    PRINT '  - Inserted: Bệnh héo rũ Panama'
END
GO

-- Disease 3: Bệnh đốm lá
IF NOT EXISTS (SELECT 1 FROM [dbo].[DiseaseLibrary] WHERE [DiseaseName] = N'Bệnh đốm lá')
BEGIN
    INSERT INTO [dbo].[DiseaseLibrary] ([DiseaseName], [ScientificName], [Category], [Symptoms], [Causes], [AffectedParts], [Severity], [SpreadRate], [Treatment], [Prevention], [OrganicTreatment], [ChemicalTreatment], [RecoveryTime], [IsContagious])
    VALUES (N'Bệnh đốm lá', N'Cercospora spp.', N'Nấm', 
            N'Xuất hiện đốm nhỏ màu vàng hoặc nâu trên lá, đốm có viền đỏ hoặc tím. Lá bị nhiều đốm sẽ vàng và rụng sớm.',
            N'Do nấm Cercospora gây ra, phát triển mạnh trong điều kiện ẩm ướt, thiếu ánh sáng.',
            N'Lá', N'Medium', N'Medium',
            N'Cắt bỏ lá bệnh, phun thuốc trừ nấm. Cải thiện thông thoáng cho vườn cây.',
            N'Tỉa cành tạo độ thông thoáng, không tưới quá nhiều, bón phân cân đối.',
            N'Phun dung dịch baking soda (5g/l), nước ép tỏi.',
            N'Daconil 75WP, Ridomil Gold 68WG',
            N'1-2 tuần', 1);
    PRINT '  - Inserted: Bệnh đốm lá'
END
GO

-- Disease 4: Rệp sáp
IF NOT EXISTS (SELECT 1 FROM [dbo].[DiseaseLibrary] WHERE [DiseaseName] = N'Rệp sáp')
BEGIN
    INSERT INTO [dbo].[DiseaseLibrary] ([DiseaseName], [ScientificName], [Category], [Symptoms], [Causes], [AffectedParts], [Severity], [SpreadRate], [Treatment], [Prevention], [OrganicTreatment], [ChemicalTreatment], [RecoveryTime], [IsContagious])
    VALUES (N'Rệp sáp', N'Pseudococcidae', N'Côn trùng', 
            N'Xuất hiện lớp sáp trắng bông trên thân, lá, quả. Cây sinh trưởng kém, lá vàng, rụng. Mật ngọt tiết ra thu hút nấm bồ hóng.',
            N'Do rệp sáp (Pseudococcidae) hút nhựa cây, thường xuất hiện ở môi trường khô nóng.',
            N'Thân, lá, quả, rễ', N'Medium', N'Slow',
            N'Phun thuốc trừ sâu dạng dầu khoáng hoặc thuốc lưu dẫn. Cắt bỏ cành nhiễm nặng.',
            N'Kiểm tra thường xuyên, duy trì độ ẩm hợp lý, nuôi thiên địch như bọ rùa.',
            N'Phun dầu neem, xà phòng rửa chén pha loãng.',
            N'Confidor 100SL, Admire 200SC, Dầu khoáng SK',
            N'2-3 tuần', 1);
    PRINT '  - Inserted: Rệp sáp'
END
GO

-- Disease 5: Sâu đục thân
IF NOT EXISTS (SELECT 1 FROM [dbo].[DiseaseLibrary] WHERE [DiseaseName] = N'Sâu đục thân')
BEGIN
    INSERT INTO [dbo].[DiseaseLibrary] ([DiseaseName], [ScientificName], [Category], [Symptoms], [Causes], [AffectedParts], [Severity], [SpreadRate], [Treatment], [Prevention], [OrganicTreatment], [ChemicalTreatment], [RecoveryTime], [IsContagious])
    VALUES (N'Sâu đục thân', N'Ostrinia spp.', N'Côn trùng', 
            N'Thân cây có lỗ đục nhỏ, phân sâu tiết ra ngoài. Cây sinh trưởng kém, dễ gãy đổ khi gió. Nhánh bị đục héo chết.',
            N'Do sâu non của bướm đục vào thân cây để ăn mô dẫn.',
            N'Thân, cành', N'High', N'Slow',
            N'Tiêm thuốc trừ sâu vào lỗ đục, cắt bỏ cành bị hại nặng. Bắt sâu thủ công.',
            N'Quét vôi gốc cây, vệ sinh vườn, sử dụng bẫy pheromone.',
            N'Bọc gốc bằng vải mỏng, sử dụng chế phẩm Bt (Bacillus thuringiensis).',
            N'Regent 800WG, Vitako 40WG',
            N'4-6 tuần', 0);
    PRINT '  - Inserted: Sâu đục thân'
END
GO

-- Disease 6: Ruồi đục quả
IF NOT EXISTS (SELECT 1 FROM [dbo].[DiseaseLibrary] WHERE [DiseaseName] = N'Ruồi đục quả')
BEGIN
    INSERT INTO [dbo].[DiseaseLibrary] ([DiseaseName], [ScientificName], [Category], [Symptoms], [Causes], [AffectedParts], [Severity], [SpreadRate], [Treatment], [Prevention], [OrganicTreatment], [ChemicalTreatment], [RecoveryTime], [IsContagious])
    VALUES (N'Ruồi đục quả', N'Bactrocera dorsalis', N'Côn trùng', 
            N'Quả có vết châm nhỏ, bên trong có giòi. Quả thối nhũn, rụng sớm. Vỏ quả có đốm nâu mềm.',
            N'Do ruồi cái đẻ trứng vào quả, ấu trùng phát triển bên trong ăn thịt quả.',
            N'Quả', N'High', N'Fast',
            N'Thu gom quả rụng tiêu hủy, sử dụng bẫy pheromone, bao quả.',
            N'Bao quả từ khi còn non, sử dụng bẫy dẫn dụ, vệ sinh vườn.',
            N'Sử dụng bẫy protein thủy phân, phun nước ép ớt + tỏi.',
            N'Abamectin 1.8EC, Success 120SC',
            N'Không phục hồi quả bị hại', 0);
    PRINT '  - Inserted: Ruồi đục quả'
END
GO

-- Disease 7: Bệnh thối rễ
IF NOT EXISTS (SELECT 1 FROM [dbo].[DiseaseLibrary] WHERE [DiseaseName] = N'Bệnh thối rễ')
BEGIN
    INSERT INTO [dbo].[DiseaseLibrary] ([DiseaseName], [ScientificName], [Category], [Symptoms], [Causes], [AffectedParts], [Severity], [SpreadRate], [Treatment], [Prevention], [OrganicTreatment], [ChemicalTreatment], [RecoveryTime], [IsContagious])
    VALUES (N'Bệnh thối rễ', N'Phytophthora spp.', N'Nấm', 
            N'Cây sinh trưởng kém, lá vàng héo, rễ thối đen có mùi hôi. Cây dễ nhổ lên do rễ đã bị phá hủy.',
            N'Do nấm Phytophthora gây ra, phát triển mạnh trong đất ẩm ướt, thoát nước kém.',
            N'Rễ, gốc thân', N'High', N'Medium',
            N'Cải thiện thoát nước, tưới thuốc trừ nấm vào gốc. Cây nhiễm nặng cần nhổ bỏ.',
            N'Trồng trên đất thoát nước tốt, không tưới quá nhiều, bón Trichoderma.',
            N'Bón vôi khử chua đất, sử dụng chế phẩm Trichoderma.',
            N'Aliette 800WG, Ridomil Gold 68WG',
            N'3-6 tuần (nếu phát hiện sớm)', 1);
    PRINT '  - Inserted: Bệnh thối rễ'
END
GO

-- Disease 8: Nhện đỏ
IF NOT EXISTS (SELECT 1 FROM [dbo].[DiseaseLibrary] WHERE [DiseaseName] = N'Nhện đỏ')
BEGIN
    INSERT INTO [dbo].[DiseaseLibrary] ([DiseaseName], [ScientificName], [Category], [Symptoms], [Causes], [AffectedParts], [Severity], [SpreadRate], [Treatment], [Prevention], [OrganicTreatment], [ChemicalTreatment], [RecoveryTime], [IsContagious])
    VALUES (N'Nhện đỏ', N'Tetranychus urticae', N'Côn trùng', 
            N'Lá có đốm vàng nhỏ li ti, mặt dưới lá có nhện nhỏ và tơ. Lá bị nặng sẽ khô cháy, rụng.',
            N'Do nhện đỏ (Tetranychus) hút nhựa lá, phát triển mạnh trong điều kiện nóng và khô.',
            N'Lá, cành non', N'Medium', N'Fast',
            N'Phun nước áp lực mạnh, sử dụng thuốc trừ nhện đặc hiệu.',
            N'Duy trì độ ẩm, tránh để vườn quá khô nóng, nuôi thiên địch.',
            N'Phun dầu neem, nước xà phòng loãng.',
            N'Nissorun 5EC, Ortus 5SC, Comite 73EC',
            N'1-2 tuần', 0);
    PRINT '  - Inserted: Nhện đỏ'
END
GO

-- ===== 15. TREE VARIETY =====
PRINT ''
PRINT 'Inserting TreeVariety...'
GO

-- Get TreeType IDs
DECLARE @TreeTypeFruitID INT = (SELECT TOP 1 [TreeTypeID] FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Cây ăn quả');
DECLARE @TreeTypeBananaID INT = (SELECT TOP 1 [TreeTypeID] FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Chuối');
DECLARE @TreeTypeIndustrialID INT = (SELECT TOP 1 [TreeTypeID] FROM [dbo].[TreeTypes] WHERE [TreeTypeName] = N'Cây công nghiệp');

-- Variety 1: Xoài Cát Hòa Lộc
IF @TreeTypeFruitID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeVariety] WHERE [VarietyName] = N'Xoài Cát Hòa Lộc')
    BEGIN
        INSERT INTO [dbo].[TreeVariety] ([TreeTypeID], [VarietyName], [VarietyDescription], [ImageUrl])
        VALUES (@TreeTypeFruitID, N'Xoài Cát Hòa Lộc', N'Xoài Cát Hòa Lộc là giống xoài đặc sản của Việt Nam, quả to, thịt vàng, ngọt thanh, ít xơ. Được trồng nhiều ở Tiền Giang, Đồng Tháp.', 
                N'https://images.unsplash.com/photo-1605027990121-166a3b1b0c0b?w=400');
        PRINT '  - Inserted: Xoài Cát Hòa Lộc'
    END
END

-- Variety 2: Xoài Đài Loan
IF @TreeTypeFruitID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeVariety] WHERE [VarietyName] = N'Xoài Đài Loan')
    BEGIN
        INSERT INTO [dbo].[TreeVariety] ([TreeTypeID], [VarietyName], [VarietyDescription], [ImageUrl])
        VALUES (@TreeTypeFruitID, N'Xoài Đài Loan', N'Xoài Đài Loan có quả to, vỏ xanh khi chín, thịt ngọt mát. Năng suất cao, thích hợp trồng ở miền Nam.', 
                N'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400');
        PRINT '  - Inserted: Xoài Đài Loan'
    END
END

-- Variety 3: Bơ Booth
IF @TreeTypeFruitID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeVariety] WHERE [VarietyName] = N'Bơ Booth')
    BEGIN
        INSERT INTO [dbo].[TreeVariety] ([TreeTypeID], [VarietyName], [VarietyDescription], [ImageUrl])
        VALUES (@TreeTypeFruitID, N'Bơ Booth', N'Bơ Booth là giống bơ phổ biến, quả tròn, vỏ xanh sáng, thịt béo ngậy. Thích hợp trồng ở Tây Nguyên.', 
                N'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400');
        PRINT '  - Inserted: Bơ Booth'
    END
END

-- Variety 4: Bơ 034
IF @TreeTypeFruitID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeVariety] WHERE [VarietyName] = N'Bơ 034')
    BEGIN
        INSERT INTO [dbo].[TreeVariety] ([TreeTypeID], [VarietyName], [VarietyDescription], [ImageUrl])
        VALUES (@TreeTypeFruitID, N'Bơ 034', N'Bơ 034 có quả to, thịt dày, hạt nhỏ, vị béo đậm đà. Là giống được ưa chuộng tại Đắk Lắk.', 
                N'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=400');
        PRINT '  - Inserted: Bơ 034'
    END
END

-- Variety 5: Chuối Tiêu
IF @TreeTypeBananaID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeVariety] WHERE [VarietyName] = N'Chuối Tiêu')
    BEGIN
        INSERT INTO [dbo].[TreeVariety] ([TreeTypeID], [VarietyName], [VarietyDescription], [ImageUrl])
        VALUES (@TreeTypeBananaID, N'Chuối Tiêu', N'Chuối Tiêu là giống chuối phổ biến nhất, quả thon dài, vỏ vàng khi chín, thịt ngọt và thơm.', 
                N'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400');
        PRINT '  - Inserted: Chuối Tiêu'
    END
END

-- Variety 6: Chuối Già Hương
IF @TreeTypeBananaID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeVariety] WHERE [VarietyName] = N'Chuối Già Hương')
    BEGIN
        INSERT INTO [dbo].[TreeVariety] ([TreeTypeID], [VarietyName], [VarietyDescription], [ImageUrl])
        VALUES (@TreeTypeBananaID, N'Chuối Già Hương', N'Chuối Già Hương có mùi thơm đặc trưng, quả ngắn mập, thịt dẻo và ngọt. Được trồng nhiều ở miền Nam.', 
                N'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400');
        PRINT '  - Inserted: Chuối Già Hương'
    END
END

-- Variety 7: Cà phê Arabica
IF @TreeTypeIndustrialID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeVariety] WHERE [VarietyName] = N'Cà phê Arabica')
    BEGIN
        INSERT INTO [dbo].[TreeVariety] ([TreeTypeID], [VarietyName], [VarietyDescription], [ImageUrl])
        VALUES (@TreeTypeIndustrialID, N'Cà phê Arabica', N'Cà phê Arabica có hương vị tinh tế, độ chua nhẹ. Thích hợp trồng ở vùng cao nguyên có khí hậu mát mẻ.', 
                N'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400');
        PRINT '  - Inserted: Cà phê Arabica'
    END
END

-- Variety 8: Cà phê Robusta
IF @TreeTypeIndustrialID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeVariety] WHERE [VarietyName] = N'Cà phê Robusta')
    BEGIN
        INSERT INTO [dbo].[TreeVariety] ([TreeTypeID], [VarietyName], [VarietyDescription], [ImageUrl])
        VALUES (@TreeTypeIndustrialID, N'Cà phê Robusta', N'Cà phê Robusta có vị đắng đậm, hàm lượng caffeine cao. Được trồng phổ biến ở Tây Nguyên Việt Nam.', 
                N'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400');
        PRINT '  - Inserted: Cà phê Robusta'
    END
END

-- Variety 9: Cam sành
IF @TreeTypeFruitID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeVariety] WHERE [VarietyName] = N'Cam sành')
    BEGIN
        INSERT INTO [dbo].[TreeVariety] ([TreeTypeID], [VarietyName], [VarietyDescription], [ImageUrl])
        VALUES (@TreeTypeFruitID, N'Cam sành', N'Cam sành có vỏ dày, nhiều nước, vị ngọt đậm. Là giống cam đặc sản của Hà Giang và Vinh.', 
                N'https://images.unsplash.com/photo-1547514701-42fee7e0c24f?w=400');
        PRINT '  - Inserted: Cam sành'
    END
END

-- Variety 10: Ổi lê Đài Loan
IF @TreeTypeFruitID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[TreeVariety] WHERE [VarietyName] = N'Ổi lê Đài Loan')
    BEGIN
        INSERT INTO [dbo].[TreeVariety] ([TreeTypeID], [VarietyName], [VarietyDescription], [ImageUrl])
        VALUES (@TreeTypeFruitID, N'Ổi lê Đài Loan', N'Ổi lê Đài Loan có quả to tròn, thịt trắng giòn, vị ngọt thanh. Năng suất cao, dễ chăm sóc.', 
                N'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=400');
        PRINT '  - Inserted: Ổi lê Đài Loan'
    END
END
GO

-- ===== 16. NOTIFICATIONS =====
PRINT ''
PRINT 'Inserting Notifications...'
GO

DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Farmer2ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');
DECLARE @Tree1ID INT = (SELECT TOP 1 [TreeID] FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Xoài 1');
DECLARE @Tree2ID INT = (SELECT TOP 1 [TreeID] FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Cam 1');

-- Notification 1: Nhắc tưới nước
IF @Farmer1ID IS NOT NULL AND @Tree1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Notifications] WHERE [UserID] = @Farmer1ID AND [NotificationType] = N'Watering' AND [SentAt] > DATEADD(DAY, -1, GETDATE()))
    BEGIN
        INSERT INTO [dbo].[Notifications] ([UserID], [TreeID], [Title], [Message], [NotificationType], [Priority], [Category], [ActionUrl], [RequiresAction], [Status], [IsRead])
        VALUES (@Farmer1ID, @Tree1ID, N'Nhắc tưới nước - Cây Xoài 1', N'Đã đến giờ tưới nước cho Cây Xoài 1. Lượng nước khuyến nghị: 2 lít.', 
                N'Watering', N'Normal', N'CareReminder', N'/tree_detail/' + CAST(@Tree1ID AS NVARCHAR(10)), 1, N'Sent', 0);
        PRINT '  - Inserted: Notification - Nhắc tưới nước'
    END
END

-- Notification 2: Cảnh báo thời tiết
IF @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Notifications] WHERE [UserID] = @Farmer1ID AND [NotificationType] = N'Weather' AND [SentAt] > DATEADD(DAY, -1, GETDATE()))
    BEGIN
        INSERT INTO [dbo].[Notifications] ([UserID], [Title], [Message], [NotificationType], [Priority], [Category], [RequiresAction], [Status], [IsRead])
        VALUES (@Farmer1ID, N'Cảnh báo mưa lớn', N'Dự báo mưa lớn trong 2 ngày tới. Hãy kiểm tra hệ thống thoát nước và che chắn cây non.', 
                N'Weather', N'High', N'WeatherAlert', 1, N'Sent', 0);
        PRINT '  - Inserted: Notification - Cảnh báo thời tiết'
    END
END

-- Notification 3: Nhắc bón phân
IF @Farmer1ID IS NOT NULL AND @Tree2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Notifications] WHERE [UserID] = @Farmer1ID AND [NotificationType] = N'Fertilizing' AND [TreeID] = @Tree2ID)
    BEGIN
        INSERT INTO [dbo].[Notifications] ([UserID], [TreeID], [Title], [Message], [NotificationType], [Priority], [Category], [ActionUrl], [RequiresAction], [Status], [IsRead])
        VALUES (@Farmer1ID, @Tree2ID, N'Lịch bón phân - Cây Cam 1', N'Cây Cam 1 cần được bón phân NPK 16-16-8. Lượng phân khuyến nghị: 100g.', 
                N'Fertilizing', N'Normal', N'CareReminder', N'/tree_detail/' + CAST(@Tree2ID AS NVARCHAR(10)), 1, N'Sent', 0);
        PRINT '  - Inserted: Notification - Nhắc bón phân'
    END
END

-- Notification 4: Thông báo hệ thống
IF @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Notifications] WHERE [UserID] = @Farmer1ID AND [NotificationType] = N'System' AND [Title] = N'Cập nhật tính năng mới')
    BEGIN
        INSERT INTO [dbo].[Notifications] ([UserID], [Title], [Message], [NotificationType], [Priority], [Category], [RequiresAction], [Status], [IsRead], [ReadAt])
        VALUES (@Farmer1ID, N'Cập nhật tính năng mới', N'Ứng dụng đã được cập nhật với tính năng phân tích sức khỏe cây bằng AI. Hãy thử ngay!', 
                N'System', N'Low', N'SystemUpdate', 0, N'Sent', 1, DATEADD(HOUR, -2, GETDATE()));
        PRINT '  - Inserted: Notification - Thông báo hệ thống'
    END
END

-- Notification 5: Nhắc kiểm tra sức khỏe
IF @Farmer2ID IS NOT NULL
BEGIN
    DECLARE @Tree4ID INT = (SELECT TOP 1 [TreeID] FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Cao Su 1');
    IF @Tree4ID IS NOT NULL
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Notifications] WHERE [UserID] = @Farmer2ID AND [NotificationType] = N'HealthCheck')
        BEGIN
            INSERT INTO [dbo].[Notifications] ([UserID], [TreeID], [Title], [Message], [NotificationType], [Priority], [Category], [ActionUrl], [RequiresAction], [Status], [IsRead])
            VALUES (@Farmer2ID, @Tree4ID, N'Kiểm tra sức khỏe định kỳ', N'Đã 30 ngày kể từ lần kiểm tra sức khỏe cuối. Hãy chụp ảnh và cập nhật tình trạng cây.', 
                    N'HealthCheck', N'Normal', N'CareReminder', N'/tree_detail/' + CAST(@Tree4ID AS NVARCHAR(10)) + '/health', 1, N'Sent', 0);
            PRINT '  - Inserted: Notification - Kiểm tra sức khỏe'
        END
    END
END

-- Notification 6: Thanh toán thành công
IF @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Notifications] WHERE [UserID] = @Farmer1ID AND [NotificationType] = N'Payment')
    BEGIN
        INSERT INTO [dbo].[Notifications] ([UserID], [Title], [Message], [NotificationType], [Priority], [Category], [RequiresAction], [Status], [IsRead], [ReadAt])
        VALUES (@Farmer1ID, N'Thanh toán thành công', N'Bạn đã thanh toán thành công gói dịch vụ Gói Vườn Xanh. Cảm ơn bạn đã sử dụng dịch vụ!', 
                N'Payment', N'Low', N'Billing', 0, N'Sent', 1, DATEADD(DAY, -30, GETDATE()));
        PRINT '  - Inserted: Notification - Thanh toán thành công'
    END
END
GO

-- ===== 17. WEATHER HISTORIES =====
PRINT ''
PRINT 'Inserting WeatherHistories...'
GO

DECLARE @Tree1ID INT = (SELECT TOP 1 [TreeID] FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Xoài 1');
DECLARE @Tree2ID INT = (SELECT TOP 1 [TreeID] FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Cam 1');

-- Weather History 1: Dữ liệu thực tế hôm qua
IF @Tree1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[WeatherHistories] WHERE [TreeID] = @Tree1ID AND [ForecastDate] = DATEADD(DAY, -1, CAST(GETDATE() AS DATE)) AND [IsForecast] = 0)
    BEGIN
        INSERT INTO [dbo].[WeatherHistories] ([TreeID], [IsForecast], [ForecastDate], [DataSource], [APIRespondedAt], [DataQuality], [RawAPIResponse])
        VALUES (@Tree1ID, 0, DATEADD(DAY, -1, CAST(GETDATE() AS DATE)), N'OpenWeatherMap', DATEADD(DAY, -1, GETDATE()), N'Good',
                N'{"temp": 32, "humidity": 75, "windSpeed": 10, "condition": "Partly Cloudy", "rain": 0, "uv": 7}');
        PRINT '  - Inserted: WeatherHistory - Yesterday (actual)'
    END
END

-- Weather History 2: Dự báo hôm nay
IF @Tree1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[WeatherHistories] WHERE [TreeID] = @Tree1ID AND [ForecastDate] = CAST(GETDATE() AS DATE) AND [IsForecast] = 1)
    BEGIN
        INSERT INTO [dbo].[WeatherHistories] ([TreeID], [IsForecast], [ForecastDate], [ForecastHorizonDays], [DataSource], [APIRespondedAt], [DataQuality], [RawAPIResponse])
        VALUES (@Tree1ID, 1, CAST(GETDATE() AS DATE), 0, N'OpenWeatherMap', GETDATE(), N'Good',
                N'{"temp": 33, "humidity": 70, "windSpeed": 12, "condition": "Sunny", "rain": 0, "uv": 8}');
        PRINT '  - Inserted: WeatherHistory - Today (forecast)'
    END
END

-- Weather History 3: Dự báo ngày mai
IF @Tree1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[WeatherHistories] WHERE [TreeID] = @Tree1ID AND [ForecastDate] = DATEADD(DAY, 1, CAST(GETDATE() AS DATE)) AND [IsForecast] = 1)
    BEGIN
        INSERT INTO [dbo].[WeatherHistories] ([TreeID], [IsForecast], [ForecastDate], [ForecastHorizonDays], [DataSource], [APIRespondedAt], [DataQuality], [RawAPIResponse])
        VALUES (@Tree1ID, 1, DATEADD(DAY, 1, CAST(GETDATE() AS DATE)), 1, N'OpenWeatherMap', GETDATE(), N'Good',
                N'{"temp": 30, "humidity": 85, "windSpeed": 15, "condition": "Rainy", "rain": 25, "uv": 3}');
        PRINT '  - Inserted: WeatherHistory - Tomorrow (forecast)'
    END
END

-- Weather History 4: Dự báo 2 ngày tới
IF @Tree2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[WeatherHistories] WHERE [TreeID] = @Tree2ID AND [ForecastDate] = DATEADD(DAY, 2, CAST(GETDATE() AS DATE)) AND [IsForecast] = 1)
    BEGIN
        INSERT INTO [dbo].[WeatherHistories] ([TreeID], [IsForecast], [ForecastDate], [ForecastHorizonDays], [DataSource], [APIRespondedAt], [DataQuality], [RawAPIResponse])
        VALUES (@Tree2ID, 1, DATEADD(DAY, 2, CAST(GETDATE() AS DATE)), 2, N'OpenWeatherMap', GETDATE(), N'Medium',
                N'{"temp": 28, "humidity": 90, "windSpeed": 20, "condition": "Thunderstorm", "rain": 50, "uv": 2}');
        PRINT '  - Inserted: WeatherHistory - 2 days ahead (forecast)'
    END
END
GO

-- ===== 18. WEATHER ALERTS =====
PRINT ''
PRINT 'Inserting WeatherAlerts...'
GO

DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Tree1ID INT = (SELECT TOP 1 [TreeID] FROM [dbo].[Trees] WHERE [TreeName] = N'Cây Xoài 1');

-- Weather Alert 1: Cảnh báo mưa lớn
IF @Farmer1ID IS NOT NULL AND @Tree1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[WeatherAlerts] WHERE [UserID] = @Farmer1ID AND [AlertType] = N'HeavyRain' AND [CreatedAt] > DATEADD(DAY, -1, GETDATE()))
    BEGIN
        INSERT INTO [dbo].[WeatherAlerts] ([UserID], [TreeID], [AlertType], [Severity], [Title], [Message], [DetailedDescription], [ActionRequired], [ActionPriority], [EstimatedDamageLevel], [ImpactLevel], [AlertStartAt], [AlertEndAt], [Status], [IsAcknowledged], [WeatherAPISource], [ConfidenceLevel])
        VALUES (@Farmer1ID, @Tree1ID, N'HeavyRain', N'High', N'Cảnh báo mưa lớn', 
                N'Dự báo mưa lớn 50mm trong 2 ngày tới. Có thể ảnh hưởng đến cây trồng.',
                N'Theo dự báo thời tiết, khu vực của bạn sẽ có mưa lớn với lượng mưa dự kiến 50mm. Điều này có thể gây úng nước cho cây nếu hệ thống thoát nước không tốt.',
                N'Kiểm tra hệ thống thoát nước, che chắn cây non, tạm dừng tưới nước.',
                1, N'Medium', N'Medium', 
                DATEADD(DAY, 1, GETDATE()), DATEADD(DAY, 3, GETDATE()),
                N'Active', 0, N'OpenWeatherMap', 0.85);
        PRINT '  - Inserted: WeatherAlert - Mưa lớn'
    END
END

-- Weather Alert 2: Cảnh báo nắng nóng (đã xác nhận)
IF @Farmer1ID IS NOT NULL AND @Tree1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[WeatherAlerts] WHERE [UserID] = @Farmer1ID AND [AlertType] = N'HeatWave' AND [IsAcknowledged] = 1)
    BEGIN
        INSERT INTO [dbo].[WeatherAlerts] ([UserID], [TreeID], [AlertType], [Severity], [Title], [Message], [DetailedDescription], [ActionRequired], [ActionPriority], [EstimatedDamageLevel], [ImpactLevel], [AlertStartAt], [AlertEndAt], [Status], [IsAcknowledged], [AcknowledgedAt], [UserAction], [WeatherAPISource], [ConfidenceLevel])
        VALUES (@Farmer1ID, @Tree1ID, N'HeatWave', N'Medium', N'Cảnh báo nắng nóng', 
                N'Nhiệt độ cao trên 35°C trong 3 ngày tới.',
                N'Nhiệt độ dự kiến lên đến 37°C vào buổi trưa. Cây có thể bị stress nhiệt nếu không được chăm sóc đúng cách.',
                N'Tưới nước vào sáng sớm hoặc chiều tối, che bóng cho cây non.',
                2, N'Low', N'Low', 
                DATEADD(DAY, -2, GETDATE()), DATEADD(DAY, 1, GETDATE()),
                N'Acknowledged', 1, DATEADD(DAY, -1, GETDATE()), N'Đã tăng cường tưới nước buổi sáng',
                N'OpenWeatherMap', 0.90);
        PRINT '  - Inserted: WeatherAlert - Nắng nóng (acknowledged)'
    END
END
GO

-- ===== 19. SYSTEM SETTINGS =====
PRINT ''
PRINT 'Inserting SystemSettings...'
GO

DECLARE @SystemAdminID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'systemadmin@mammoi.com');
DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');

-- System Setting 1: Weather API Key
IF @SystemAdminID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemSettings] WHERE [SettingKey] = N'weather_api_key')
    BEGIN
        INSERT INTO [dbo].[SystemSettings] ([UserID], [SettingKey], [SettingValue], [DataType], [Category], [Description], [IsPublic])
        VALUES (@SystemAdminID, N'weather_api_key', N'sk-weather-demo-key-xxxxx', N'string', N'Integration', N'API key cho dịch vụ thời tiết OpenWeatherMap', 0);
        PRINT '  - Inserted: SystemSetting - weather_api_key'
    END
END

-- System Setting 2: Default Language
IF @SystemAdminID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemSettings] WHERE [SettingKey] = N'default_language')
    BEGIN
        INSERT INTO [dbo].[SystemSettings] ([UserID], [SettingKey], [SettingValue], [DataType], [Category], [Description], [IsPublic])
        VALUES (@SystemAdminID, N'default_language', N'vi', N'string', N'General', N'Ngôn ngữ mặc định của ứng dụng', 1);
        PRINT '  - Inserted: SystemSetting - default_language'
    END
END

-- System Setting 3: Email Notifications Enabled
IF @SystemAdminID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemSettings] WHERE [SettingKey] = N'email_notifications_enabled')
    BEGIN
        INSERT INTO [dbo].[SystemSettings] ([UserID], [SettingKey], [SettingValue], [DataType], [Category], [Description], [IsPublic])
        VALUES (@SystemAdminID, N'email_notifications_enabled', N'true', N'boolean', N'Notification', N'Bật/tắt gửi email thông báo', 1);
        PRINT '  - Inserted: SystemSetting - email_notifications_enabled'
    END
END

-- System Setting 4: Auto Schedule Generation
IF @SystemAdminID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemSettings] WHERE [SettingKey] = N'auto_schedule_generation')
    BEGIN
        INSERT INTO [dbo].[SystemSettings] ([UserID], [SettingKey], [SettingValue], [DataType], [Category], [Description], [IsPublic])
        VALUES (@SystemAdminID, N'auto_schedule_generation', N'true', N'boolean', N'CareSchedule', N'Tự động tạo lịch chăm sóc dựa trên giai đoạn sinh trưởng', 1);
        PRINT '  - Inserted: SystemSetting - auto_schedule_generation'
    END
END

-- System Setting 5: Weather Forecast Days
IF @SystemAdminID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemSettings] WHERE [SettingKey] = N'weather_forecast_days')
    BEGIN
        INSERT INTO [dbo].[SystemSettings] ([UserID], [SettingKey], [SettingValue], [DataType], [Category], [Description], [IsPublic])
        VALUES (@SystemAdminID, N'weather_forecast_days', N'7', N'integer', N'Weather', N'Số ngày dự báo thời tiết hiển thị', 1);
        PRINT '  - Inserted: SystemSetting - weather_forecast_days'
    END
END

-- System Setting 6: AI Model Version
IF @SystemAdminID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemSettings] WHERE [SettingKey] = N'ai_model_version')
    BEGIN
        INSERT INTO [dbo].[SystemSettings] ([UserID], [SettingKey], [SettingValue], [DataType], [Category], [Description], [IsPublic])
        VALUES (@SystemAdminID, N'ai_model_version', N'gpt-4o-mini', N'string', N'AI', N'Phiên bản model AI đang sử dụng', 0);
        PRINT '  - Inserted: SystemSetting - ai_model_version'
    END
END

-- User Setting 1: Farmer1 Notification Preferences
IF @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemSettings] WHERE [SettingKey] = N'notification_preferences_' + CAST(@Farmer1ID AS NVARCHAR(10)))
    BEGIN
        INSERT INTO [dbo].[SystemSettings] ([UserID], [SettingKey], [SettingValue], [DataType], [Category], [Description], [IsPublic])
        VALUES (@Farmer1ID, N'notification_preferences_' + CAST(@Farmer1ID AS NVARCHAR(10)), 
                N'{"email": true, "push": true, "sms": false, "watering": true, "fertilizing": true, "weather": true}', 
                N'json', N'Notification', N'Cài đặt thông báo của người dùng', 0);
        PRINT '  - Inserted: SystemSetting - User notification preferences'
    END
END

-- System Setting 7: Maintenance Mode
IF @SystemAdminID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemSettings] WHERE [SettingKey] = N'maintenance_mode')
    BEGIN
        INSERT INTO [dbo].[SystemSettings] ([UserID], [SettingKey], [SettingValue], [DataType], [Category], [Description], [IsPublic])
        VALUES (@SystemAdminID, N'maintenance_mode', N'false', N'boolean', N'System', N'Bật/tắt chế độ bảo trì hệ thống', 1);
        PRINT '  - Inserted: SystemSetting - maintenance_mode'
    END
END

-- System Setting 8: Max Trees Per Garden (Free Plan)
IF @SystemAdminID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[SystemSettings] WHERE [SettingKey] = N'max_trees_free_plan')
    BEGIN
        INSERT INTO [dbo].[SystemSettings] ([UserID], [SettingKey], [SettingValue], [DataType], [Category], [Description], [IsPublic])
        VALUES (@SystemAdminID, N'max_trees_free_plan', N'1', N'integer', N'Subscription', N'Số cây tối đa cho gói miễn phí', 1);
        PRINT '  - Inserted: SystemSetting - max_trees_free_plan'
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
PRINT '  - TreeTypes: 6 records (including Chuối)'
PRINT '  - TreeGrowthStages: 10+ records (including Chuối stages)'
PRINT '  - Gardens: 5 records'
PRINT '  - GardenSoils: 1 record'
PRINT '  - Trees: 5 records'
PRINT '  - SubscriptionPlans: 4 fixed plans (Gói Miễn Phí, Gói 1, Gói 2, Gói 3)'
PRINT '  - Subscriptions: 5+ records'
PRINT '  - Payments: 15+ records'
PRINT '  - CareSchedules: 8+ records (various task types)'
PRINT '  - ActivityLogs: 15+ records (Login, Create, Update, Complete, View, Upload, Search, etc.)'
PRINT '  - DiseaseLibrary: 8 records (diseases and pests)'
PRINT '  - TreeVariety: 10 records (fruit varieties)'
PRINT '  - Notifications: 6+ records (reminders, alerts)'
PRINT '  - WeatherHistories: 4 records (actual and forecast)'
PRINT '  - WeatherAlerts: 2 records (rain, heat wave)'
PRINT '  - SystemSettings: 9+ records (API keys, preferences)'
PRINT ''
PRINT 'Test Accounts:'
PRINT '  - SystemAdmin: systemadmin@mammoi.com / SystemAdmin@123'
PRINT '  - BusinessAdmin: businessadmin@mammoi.com / BusinessAdmin@123'
PRINT '  - Farmer 1: farmer1@mammoi.com / Farmer@123'
PRINT '  - Farmer 2: farmer2@mammoi.com / Farmer2@123'
PRINT '  - Farmer 3: farmer3@mammoi.com / Farmer3@123'
PRINT ''
GO
-- ===== AICONSULTATIONS =====
PRINT 'Inserting AIConsultations...'
INSERT INTO [dbo].[AIConsultations] ([UserID], [TreeID], [PromptInput], [CreatedAt])
VALUES (3, 1, N'Cây xoài của tôi bị vàng lá, tôi nên làm gì?', '2025-01-15 10:30:00');
PRINT '  - Inserted 1 AI consultation record'
GO