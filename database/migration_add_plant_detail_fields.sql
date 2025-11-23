USE [MamMoi]
GO

-- ============================================
-- Migration: Add fields for PlantDetail page
-- Date: 2025-01-XX
-- Description: Add fields to TreeTypes and TreeVariety tables
--              to support all information displayed on /plants/:id page
-- ============================================

PRINT 'Starting migration: Add PlantDetail fields...'
GO

-- ============================================
-- 1. Add fields to TreeTypes table
-- ============================================

-- Add CareGuide field (JSON array of care instruction strings)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[TreeTypes]') 
    AND name = 'CareGuide'
)
BEGIN
    ALTER TABLE [dbo].[TreeTypes]
    ADD [CareGuide] [nvarchar](max) NULL;
    
    PRINT 'Added CareGuide column to TreeTypes table'
END
ELSE
BEGIN
    PRINT 'CareGuide column already exists in TreeTypes table'
END
GO

-- Add LightRequirement field
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[TreeTypes]') 
    AND name = 'LightRequirement'
)
BEGIN
    ALTER TABLE [dbo].[TreeTypes]
    ADD [LightRequirement] [nvarchar](500) NULL;
    
    PRINT 'Added LightRequirement column to TreeTypes table'
END
ELSE
BEGIN
    PRINT 'LightRequirement column already exists in TreeTypes table'
END
GO

-- Add WaterRequirement field
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[TreeTypes]') 
    AND name = 'WaterRequirement'
)
BEGIN
    ALTER TABLE [dbo].[TreeTypes]
    ADD [WaterRequirement] [nvarchar](500) NULL;
    
    PRINT 'Added WaterRequirement column to TreeTypes table'
END
ELSE
BEGIN
    PRINT 'WaterRequirement column already exists in TreeTypes table'
END
GO

-- Add Pests field (JSON array of pest objects with name, description, severity)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[TreeTypes]') 
    AND name = 'Pests'
)
BEGIN
    ALTER TABLE [dbo].[TreeTypes]
    ADD [Pests] [nvarchar](max) NULL;
    
    PRINT 'Added Pests column to TreeTypes table'
END
ELSE
BEGIN
    PRINT 'Pests column already exists in TreeTypes table'
END
GO

-- Add SeasonalRoadmap field (JSON array of roadmap objects with stage, timing, action)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[TreeTypes]') 
    AND name = 'SeasonalRoadmap'
)
BEGIN
    ALTER TABLE [dbo].[TreeTypes]
    ADD [SeasonalRoadmap] [nvarchar](max) NULL;
    
    PRINT 'Added SeasonalRoadmap column to TreeTypes table'
END
ELSE
BEGIN
    PRINT 'SeasonalRoadmap column already exists in TreeTypes table'
END
GO

-- ============================================
-- 2. Add ImageUrl field to TreeVariety table
-- ============================================

IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[TreeVariety]') 
    AND name = 'ImageUrl'
)
BEGIN
    ALTER TABLE [dbo].[TreeVariety]
    ADD [ImageUrl] [nvarchar](500) NULL;
    
    PRINT 'Added ImageUrl column to TreeVariety table'
END
ELSE
BEGIN
    PRINT 'ImageUrl column already exists in TreeVariety table'
END
GO

-- ============================================
-- 3. Insert sample data for existing TreeTypes
-- ============================================

PRINT ''
PRINT 'Inserting sample data for TreeTypes...'
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

-- Update for other TreeTypes (generic data)
DECLARE @TreeTypeID INT;
DECLARE @TreeTypeName NVARCHAR(100);

DECLARE tree_cursor CURSOR FOR
SELECT [TreeTypeID], [TreeTypeName]
FROM [dbo].[TreeTypes]
WHERE ([CareGuide] IS NULL OR [LightRequirement] IS NULL OR [WaterRequirement] IS NULL)
  AND NOT ([TreeTypeName] LIKE N'%Xoài%' OR [TreeTypeName] LIKE N'%Mango%' 
        OR [TreeTypeName] LIKE N'%Bơ%' OR [TreeTypeName] LIKE N'%Avocado%'
        OR [TreeTypeName] LIKE N'%Thanh Long%' OR [TreeTypeName] LIKE N'%Dragon%');

OPEN tree_cursor;
FETCH NEXT FROM tree_cursor INTO @TreeTypeID, @TreeTypeName;

WHILE @@FETCH_STATUS = 0
BEGIN
    UPDATE [dbo].[TreeTypes]
    SET 
        [CareGuide] = N'["Bón phân định kỳ theo hướng dẫn","Tưới nước đều đặn, tránh úng nước","Cắt tỉa cành sâu bệnh thường xuyên","Phòng trừ sâu bệnh định kỳ","Bón phân hữu cơ để cải thiện đất","Theo dõi và chăm sóc cây thường xuyên"]',
        [LightRequirement] = N'Ánh sáng đầy đủ (6-8 giờ/ngày)',
        [WaterRequirement] = N'Tưới đều đặn, 2-3 lần/tuần',
        [Pests] = N'[{"name":"Sâu bệnh thường gặp","description":"Theo dõi và phòng trừ sâu bệnh định kỳ. Sử dụng thuốc trừ sâu sinh học khi có thể.","severity":"Medium"}]',
        [SeasonalRoadmap] = N'[{"stage":"Trồng cây","timing":"Mùa mưa","action":"Chuẩn bị đất và trồng cây con"},{"stage":"Chăm sóc","timing":"Quanh năm","action":"Tưới nước, bón phân, làm cỏ"},{"stage":"Thu hoạch","timing":"Theo mùa","action":"Thu hoạch khi cây đạt độ chín"}]'
    WHERE [TreeTypeID] = @TreeTypeID;
    
    PRINT '  - Updated: TreeTypeID = ' + CAST(@TreeTypeID AS NVARCHAR(10)) + ' (' + @TreeTypeName + ')';
    
    FETCH NEXT FROM tree_cursor INTO @TreeTypeID, @TreeTypeName;
END;

CLOSE tree_cursor;
DEALLOCATE tree_cursor;
GO

-- ============================================
-- 4. Insert sample data for TreeVariety ImageUrl
-- ============================================

PRINT ''
PRINT 'Updating TreeVariety with sample ImageUrl...'
GO

-- Update existing varieties with sample image URLs (if they don't have one)
UPDATE [dbo].[TreeVariety]
SET [ImageUrl] = N'https://images.unsplash.com/photo-1605027990121-166a3b1b0c0b?w=400'
WHERE [ImageUrl] IS NULL 
  AND [VarietyName] LIKE N'%Xoài%' OR [VarietyName] LIKE N'%Mango%';

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

-- ============================================
-- Migration completed
-- ============================================

PRINT ''
PRINT '========================================'
PRINT 'Migration completed successfully!'
PRINT '========================================'
PRINT ''
PRINT 'Added fields:'
PRINT '  - TreeTypes.CareGuide (nvarchar(max))'
PRINT '  - TreeTypes.LightRequirement (nvarchar(500))'
PRINT '  - TreeTypes.WaterRequirement (nvarchar(500))'
PRINT '  - TreeTypes.Pests (nvarchar(max))'
PRINT '  - TreeTypes.SeasonalRoadmap (nvarchar(max))'
PRINT '  - TreeVariety.ImageUrl (nvarchar(500))'
PRINT ''
PRINT 'Sample data inserted:'
PRINT '  - Updated TreeTypes with CareGuide, LightRequirement, WaterRequirement, Pests, SeasonalRoadmap'
PRINT '  - Updated TreeVariety with ImageUrl'
PRINT ''
PRINT 'Note: JSON fields (CareGuide, Pests, SeasonalRoadmap) store:'
PRINT '  - CareGuide: JSON array of strings, e.g., ["instruction1", "instruction2"]'
PRINT '  - Pests: JSON array of objects, e.g., [{"name":"...","description":"...","severity":"High"}]'
PRINT '  - SeasonalRoadmap: JSON array of objects, e.g., [{"stage":"...","timing":"...","action":"..."}]'
PRINT ''
GO

