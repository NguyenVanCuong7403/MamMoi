-- =============================================
-- Script: Create TreeVariety Table with Identity Column
-- Mô tả:
--   Tạo bảng TreeVariety với VarietyID là IDENTITY(1,1)
--   để EF Core có thể tự động generate ID khi insert
-- =============================================

USE MamMoi;
GO

PRINT 'Starting: Create TreeVariety table with identity column';
GO

-- Kiểm tra xem bảng TreeVariety đã tồn tại chưa
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TreeVariety')
BEGIN
    PRINT 'Creating TreeVariety table...';

    -- Tạo bảng TreeVariety với VarietyID là identity
    CREATE TABLE TreeVariety (
        VarietyID INT IDENTITY(1,1) PRIMARY KEY,
        TreeTypeID INT NULL,
        VarietyName NVARCHAR(100) NULL,
        VarietyDescription NVARCHAR(500) NULL,
        CONSTRAINT FK_TreeVariety_TreeTypes FOREIGN KEY (TreeTypeID)
            REFERENCES TreeTypes(TreeTypeID)
    );
    PRINT 'Created TreeVariety table with identity column';

END
ELSE
BEGIN
    PRINT 'TreeVariety table already exists. Checking if VarietyID is identity...';

    -- Kiểm tra xem cột VarietyID đã là identity chưa
    IF NOT EXISTS (
        SELECT 1
        FROM sys.columns c
        INNER JOIN sys.tables t ON c.object_id = t.object_id
        WHERE t.name = 'TreeVariety'
        AND c.name = 'VarietyID'
        AND c.is_identity = 1
    )
    BEGIN
        PRINT 'VarietyID is not an identity column. This requires manual intervention.';
        PRINT 'Please backup your data and recreate the table with identity column.';
    END
    ELSE
    BEGIN
        PRINT 'VarietyID is already an identity column. No changes needed.';
    END
END

-- Verify
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'TreeVariety')
BEGIN
    SELECT TOP 5 * FROM TreeVariety ORDER BY VarietyID;
    SELECT
        t.name AS TableName,
        c.name AS ColumnName,
        c.is_identity AS IsIdentity,
        IDENT_SEED(t.name) AS IdentitySeed,
        IDENT_INCR(t.name) AS IdentityIncrement
    FROM sys.columns c
    INNER JOIN sys.tables t ON c.object_id = t.object_id
    WHERE t.name = 'TreeVariety' AND c.name = 'VarietyID';
END

PRINT 'TreeVariety table creation/check completed successfully!';
GO