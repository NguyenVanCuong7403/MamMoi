-- Quick fix: Add IDENTITY to TreeVariety.VarietyID
-- This fixes the NULL insert error when creating new tree varieties

USE [MamMoi]
GO

-- Check if column already has IDENTITY
IF NOT EXISTS (
    SELECT 1 
    FROM sys.identity_columns 
    WHERE object_id = OBJECT_ID('dbo.TreeVariety') 
    AND name = 'VarietyID'
)
BEGIN
    PRINT 'Fixing TreeVariety.VarietyID to use IDENTITY...';
    
    -- Get current max ID to preserve data
    DECLARE @MaxID INT = 0;
    SELECT @MaxID = ISNULL(MAX(VarietyID), 0) FROM [dbo].[TreeVariety];
    PRINT 'Current max VarietyID: ' + CAST(@MaxID AS VARCHAR(10));
    
    -- Drop foreign key constraints
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Trees_TreeVariety')
    BEGIN
        ALTER TABLE [dbo].[Trees] DROP CONSTRAINT [FK_Trees_TreeVariety];
        PRINT 'Dropped FK_Trees_TreeVariety';
    END
    
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_TreeVariety_TreeTypes')
    BEGIN
        ALTER TABLE [dbo].[TreeVariety] DROP CONSTRAINT [FK_TreeVariety_TreeTypes];
        PRINT 'Dropped FK_TreeVariety_TreeTypes';
    END
    
    -- Drop primary key
    IF EXISTS (SELECT * FROM sys.key_constraints WHERE name = 'PK_TreeVariety')
    BEGIN
        ALTER TABLE [dbo].[TreeVariety] DROP CONSTRAINT [PK_TreeVariety];
        PRINT 'Dropped PK_TreeVariety';
    END
    
    -- Create temp table with IDENTITY
    CREATE TABLE [dbo].[TreeVariety_Temp](
        [VarietyID] [int] IDENTITY(1,1) NOT NULL,
        [TreeTypeID] [int] NULL,
        [VarietyName] [nvarchar](255) NULL,
        [VarietyDescription] [nvarchar](max) NULL,
        [ImageUrl] [nvarchar](500) NULL,
        CONSTRAINT [PK_TreeVariety_Temp] PRIMARY KEY CLUSTERED ([VarietyID] ASC)
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];
    
    PRINT 'Created temporary table';
    
    -- Copy data
    SET IDENTITY_INSERT [dbo].[TreeVariety_Temp] ON;
    
    INSERT INTO [dbo].[TreeVariety_Temp] ([VarietyID], [TreeTypeID], [VarietyName], [VarietyDescription], [ImageUrl])
    SELECT [VarietyID], [TreeTypeID], [VarietyName], [VarietyDescription], [ImageUrl]
    FROM [dbo].[TreeVariety]
    ORDER BY [VarietyID];
    
    SET IDENTITY_INSERT [dbo].[TreeVariety_Temp] OFF;
    
    PRINT 'Copied ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' rows to temp table';
    
    -- Drop old table
    DROP TABLE [dbo].[TreeVariety];
    PRINT 'Dropped old TreeVariety table';
    
    -- Rename temp table
    EXEC sp_rename '[dbo].[TreeVariety_Temp]', 'TreeVariety';
    EXEC sp_rename '[dbo].[PK_TreeVariety_Temp]', 'PK_TreeVariety', 'OBJECT';
    PRINT 'Renamed temp table to TreeVariety';
    
    -- Recreate foreign key constraints
    ALTER TABLE [dbo].[TreeVariety] 
        ADD CONSTRAINT [FK_TreeVariety_TreeTypes] 
        FOREIGN KEY([TreeTypeID]) 
        REFERENCES [dbo].[TreeTypes] ([TreeTypeID])
        ON DELETE NO ACTION;
    PRINT 'Recreated FK_TreeVariety_TreeTypes';
    
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Trees') AND name = 'VarietyID')
    BEGIN
        ALTER TABLE [dbo].[Trees] 
            ADD CONSTRAINT [FK_Trees_TreeVariety] 
            FOREIGN KEY([VarietyID]) 
            REFERENCES [dbo].[TreeVariety] ([VarietyID])
            ON DELETE NO ACTION;
        PRINT 'Recreated FK_Trees_TreeVariety';
    END
    
    -- Reset IDENTITY seed to continue from max ID
    IF @MaxID > 0
    BEGIN
        DBCC CHECKIDENT('[dbo].[TreeVariety]', RESEED, @MaxID);
        PRINT 'Reset IDENTITY seed to ' + CAST(@MaxID AS VARCHAR(10));
    END
    
    PRINT 'SUCCESS: TreeVariety.VarietyID is now an IDENTITY column!';
END
ELSE
BEGIN
    PRINT 'TreeVariety.VarietyID already has IDENTITY - no changes needed.';
END
GO

