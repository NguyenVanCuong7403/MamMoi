-- =============================================
-- Script: Thêm chức năng Invitation vào GardenMembers
-- Mô tả: 
--   Thêm các cột để hỗ trợ mời Staff vào vườn
--   - Status: Trạng thái member (Active/Pending/Declined)
--   - InvitationToken: Token bảo mật để accept
--   - InvitedByUserId: Ai mời
--   - InvitedAt: Khi nào mời
--   - TokenExpiresAt: Token hết hạn
-- Chạy script này TRƯỚC khi dùng EF Core Migrations
-- =============================================

USE CapstoneDB01;
GO

PRINT 'Starting migration: Add Invitation columns to GardenMembers';
GO

-- Kiểm tra xem các cột đã tồn tại chưa
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'GardenMembers') AND name = 'Status')
BEGIN
    -- Thêm cột Status
    ALTER TABLE GardenMembers
    ADD Status NVARCHAR(20) NOT NULL DEFAULT 'Active';
    
    PRINT 'Added Status column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'GardenMembers') AND name = 'InvitationToken')
BEGIN
    -- Thêm cột InvitationToken
    ALTER TABLE GardenMembers
    ADD InvitationToken NVARCHAR(100) NULL;
    
    PRINT 'Added InvitationToken column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'GardenMembers') AND name = 'InvitedByUserId')
BEGIN
    -- Thêm cột InvitedByUserId
    ALTER TABLE GardenMembers
    ADD InvitedByUserId INT NULL;
    
    -- Thêm foreign key constraint
    ALTER TABLE GardenMembers
    ADD CONSTRAINT FK_GardenMembers_InvitedBy FOREIGN KEY (InvitedByUserId) 
    REFERENCES Users(UserId);
    
    PRINT 'Added InvitedByUserId column with FK';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'GardenMembers') AND name = 'InvitedAt')
BEGIN
    -- Thêm cột InvitedAt
    ALTER TABLE GardenMembers
    ADD InvitedAt DATETIME NULL;
    
    PRINT 'Added InvitedAt column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'GardenMembers') AND name = 'TokenExpiresAt')
BEGIN
    -- Thêm cột TokenExpiresAt
    ALTER TABLE GardenMembers
    ADD TokenExpiresAt DATETIME NULL;
    
    PRINT 'Added TokenExpiresAt column';
END
GO

-- Thêm unique constraint cho InvitationToken (nếu chưa có)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'GardenMembers') AND name = 'UQ_GardenMembers_Token')
BEGIN
    CREATE UNIQUE INDEX UQ_GardenMembers_Token 
    ON GardenMembers(InvitationToken) 
    WHERE InvitationToken IS NOT NULL;
    
    PRINT 'Created unique index on InvitationToken';
END
GO

-- Thêm index cho Status để query nhanh
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'GardenMembers') AND name = 'IX_GardenMembers_Status')
BEGIN
    CREATE INDEX IX_GardenMembers_Status 
    ON GardenMembers(Status);
    
    PRINT 'Created index on Status';
END
GO

-- Thêm index cho GardenId + Status (query pending invitations)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'GardenMembers') AND name = 'IX_GardenMembers_Garden_Status')
BEGIN
    CREATE INDEX IX_GardenMembers_Garden_Status 
    ON GardenMembers(GardenId, Status);
    
    PRINT 'Created composite index on GardenId and Status';
END
GO

-- Update existing records to have Status = 'Active' (nếu đã có data)
UPDATE GardenMembers
SET Status = 'Active'
WHERE Status IS NULL OR Status = '';
GO

-- Verify
SELECT 
    c.name AS ColumnName,
    t.name AS DataType,
    c.max_length AS MaxLength,
    c.is_nullable AS IsNullable,
    d.definition AS DefaultValue
FROM sys.columns c
JOIN sys.types t ON c.user_type_id = t.user_type_id
LEFT JOIN sys.default_constraints d ON c.default_object_id = d.object_id
WHERE c.object_id = OBJECT_ID(N'GardenMembers')
  AND c.name IN ('Status', 'InvitationToken', 'InvitedByUserId', 'InvitedAt', 'TokenExpiresAt')
ORDER BY c.column_id;
GO

PRINT '✅ Migration completed successfully!';
PRINT 'GardenMembers table now supports invitation flow:';
PRINT '  - Status: Active/Pending/Declined';
PRINT '  - InvitationToken: Secure token for accepting invites';
PRINT '  - InvitedByUserId: Who sent the invitation';
PRINT '  - InvitedAt: When invitation was sent';
PRINT '  - TokenExpiresAt: When token expires (7 days)';
PRINT '';
PRINT '';
PRINT '⚠️ IMPORTANT: Making UserId and JoinedAt nullable...';
GO

-- Make UserId nullable (để support Pending invitations)
-- Trước tiên phải drop unique constraint nếu có
IF EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'GardenMembers') AND name = 'UX_GardenMembers_Garden_User')
BEGIN
    ALTER TABLE GardenMembers DROP CONSTRAINT UX_GardenMembers_Garden_User;
    PRINT 'Dropped UX_GardenMembers_Garden_User constraint';
END
GO

-- Bây giờ có thể alter UserId
ALTER TABLE GardenMembers ALTER COLUMN UserId INT NULL;
PRINT '✅ UserId is now nullable';
GO

-- Re-create unique constraint nhưng chỉ apply cho records có UserId (bỏ qua pending)
CREATE UNIQUE INDEX UX_GardenMembers_Garden_User 
ON GardenMembers(GardenId, UserId)
WHERE UserId IS NOT NULL;
PRINT '✅ Re-created UX_GardenMembers_Garden_User constraint (for active members only)';
GO

-- Make JoinedAt nullable - phải drop default constraint trước
DECLARE @ConstraintName NVARCHAR(200);
SELECT @ConstraintName = d.name
FROM sys.default_constraints d
JOIN sys.columns c ON d.parent_object_id = c.object_id AND d.parent_column_id = c.column_id
WHERE c.object_id = OBJECT_ID(N'GardenMembers') AND c.name = 'JoinedAt';

IF @ConstraintName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE GardenMembers DROP CONSTRAINT ' + @ConstraintName);
    PRINT 'Dropped JoinedAt default constraint: ' + @ConstraintName;
END
GO

ALTER TABLE GardenMembers ALTER COLUMN JoinedAt DATETIME NULL;
PRINT '✅ JoinedAt is now nullable';
GO

PRINT '';
PRINT '✅✅✅ Migration completed successfully! ✅✅✅';
PRINT 'GardenMembers table now fully supports invitation flow!';
GO
