-- Migration: Add IDENTITY(1,1) to TreeVariety.VarietyID
-- Date: 2025-01-XX
-- Description: Fixes the issue where VarietyID cannot be NULL when inserting new TreeVariety records
--              This script converts VarietyID to an IDENTITY column for auto-generation

USE [MamMoi]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

BEGIN TRANSACTION;

-- Step 1: Check if table has data
DECLARE @RowCount INT;
SELECT @RowCount = COUNT(*) FROM [dbo].[TreeVariety];

-- Step 2: If table is empty, we can drop and recreate
IF @RowCount = 0
BEGIN
    -- Drop foreign key constraints that reference TreeVariety
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Trees_TreeVariety')
        ALTER TABLE [dbo].[Trees] DROP CONSTRAINT [FK_Trees_TreeVariety];
    
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_TreeVariety_TreeTypes')
        ALTER TABLE [dbo].[TreeVariety] DROP CONSTRAINT [FK_TreeVariety_TreeTypes];
    
    -- Drop primary key
    IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'PK_TreeVariety')
        ALTER TABLE [dbo].[TreeVariety] DROP CONSTRAINT [PK_TreeVariety];
    
    -- Drop and recreate table with IDENTITY
    DROP TABLE [dbo].[TreeVariety];
    
    CREATE TABLE [dbo].[TreeVariety](
        [VarietyID] [int] IDENTITY(1,1) NOT NULL,
        [TreeTypeID] [int] NULL,
        [VarietyName] [nvarchar](255) NULL,
        [VarietyDescription] [nvarchar](max) NULL,
        [ImageUrl] [nvarchar](500) NULL,
        CONSTRAINT [PK_TreeVariety] PRIMARY KEY CLUSTERED 
        (
            [VarietyID] ASC
        )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];
    
    -- Recreate foreign key constraints
    ALTER TABLE [dbo].[TreeVariety] 
        ADD CONSTRAINT [FK_TreeVariety_TreeTypes] 
        FOREIGN KEY([TreeTypeID]) 
        REFERENCES [dbo].[TreeTypes] ([TreeTypeID])
        ON DELETE NO ACTION;
    
    ALTER TABLE [dbo].[Trees] 
        ADD CONSTRAINT [FK_Trees_TreeVariety] 
        FOREIGN KEY([VarietyID]) 
        REFERENCES [dbo].[TreeVariety] ([VarietyID])
        ON DELETE NO ACTION;
END
ELSE
BEGIN
    -- Table has data - need to preserve it
    -- Step 1: Create temporary table with IDENTITY
    CREATE TABLE [dbo].[TreeVariety_Temp](
        [VarietyID] [int] IDENTITY(1,1) NOT NULL,
        [TreeTypeID] [int] NULL,
        [VarietyName] [nvarchar](255) NULL,
        [VarietyDescription] [nvarchar](max) NULL,
        [ImageUrl] [nvarchar](500) NULL,
        CONSTRAINT [PK_TreeVariety_Temp] PRIMARY KEY CLUSTERED 
        (
            [VarietyID] ASC
        )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];
    
    -- Step 2: Copy data (without VarietyID - it will be auto-generated)
    SET IDENTITY_INSERT [dbo].[TreeVariety_Temp] ON;
    
    INSERT INTO [dbo].[TreeVariety_Temp] ([VarietyID], [TreeTypeID], [VarietyName], [VarietyDescription], [ImageUrl])
    SELECT [VarietyID], [TreeTypeID], [VarietyName], [VarietyDescription], [ImageUrl]
    FROM [dbo].[TreeVariety]
    ORDER BY [VarietyID];
    
    SET IDENTITY_INSERT [dbo].[TreeVariety_Temp] OFF;
    
    -- Step 3: Drop foreign key constraints
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Trees_TreeVariety')
        ALTER TABLE [dbo].[Trees] DROP CONSTRAINT [FK_Trees_TreeVariety];
    
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_TreeVariety_TreeTypes')
        ALTER TABLE [dbo].[TreeVariety] DROP CONSTRAINT [FK_TreeVariety_TreeTypes];
    
    -- Step 4: Drop old table
    DROP TABLE [dbo].[TreeVariety];
    
    -- Step 5: Rename temp table
    EXEC sp_rename '[dbo].[TreeVariety_Temp]', 'TreeVariety';
    EXEC sp_rename '[dbo].[PK_TreeVariety_Temp]', 'PK_TreeVariety', 'OBJECT';
    
    -- Step 6: Recreate foreign key constraints
    ALTER TABLE [dbo].[TreeVariety] 
        ADD CONSTRAINT [FK_TreeVariety_TreeTypes] 
        FOREIGN KEY([TreeTypeID]) 
        REFERENCES [dbo].[TreeTypes] ([TreeTypeID])
        ON DELETE NO ACTION;
    
    ALTER TABLE [dbo].[Trees] 
        ADD CONSTRAINT [FK_Trees_TreeVariety] 
        FOREIGN KEY([VarietyID]) 
        REFERENCES [dbo].[TreeVariety] ([VarietyID])
        ON DELETE NO ACTION;
    
    -- Step 7: Update IDENTITY seed to continue from max existing ID
    DECLARE @MaxID INT;
    SELECT @MaxID = ISNULL(MAX([VarietyID]), 0) FROM [dbo].[TreeVariety];
    DBCC CHECKIDENT('[dbo].[TreeVariety]', RESEED, @MaxID);
END

COMMIT TRANSACTION;
GO

