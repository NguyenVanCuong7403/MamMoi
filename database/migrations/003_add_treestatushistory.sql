/* ========================================================================
   Migration: 003_add_treestatushistory
   Purpose  : Create TreeStatusHistory table to track changes to tree status fields
   Target   : SQL Server (MamMoi DB)
   Created  : 2025-12-03
   Notes    :
     - Tracks changes to LeafStatus, BranchStatus, FlowerStatus, FruitStatus
     - Uses IF NOT EXISTS guard so the script is safe to run multiple times.
   ======================================================================== */

SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;

-- Check if Trees and Users tables exist first
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Trees]') AND type in (N'U'))
BEGIN
    PRINT 'ERROR: Table [dbo].[Trees] does not exist. Please run schema.sql first to create base tables.';
    ROLLBACK TRANSACTION;
    RETURN;
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    PRINT 'ERROR: Table [dbo].[Users] does not exist. Please run schema.sql first to create base tables.';
    ROLLBACK TRANSACTION;
    RETURN;
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TreeStatusHistory]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TreeStatusHistory](
        [HistoryId] [int] IDENTITY(1,1) NOT NULL,
        [TreeId] [int] NOT NULL,
        [UserId] [int] NOT NULL,
        [StatusField] [nvarchar](50) NOT NULL, -- 'LeafStatus', 'BranchStatus', 'FlowerStatus', 'FruitStatus'
        [OldValue] [nvarchar](100) NULL,
        [NewValue] [nvarchar](100) NULL,
        [ChangedAt] [datetime2](0) NOT NULL DEFAULT (sysdatetime()),
        CONSTRAINT [PK_TreeStatusHistory] PRIMARY KEY CLUSTERED ([HistoryId] ASC)
        WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY];

    -- Foreign key to Trees (note: Trees table uses TreeID, not TreeId)
    ALTER TABLE [dbo].[TreeStatusHistory]
    ADD CONSTRAINT [FK_TreeStatusHistory_Trees] FOREIGN KEY([TreeId])
    REFERENCES [dbo].[Trees] ([TreeID])
    ON DELETE CASCADE;

    -- Foreign key to Users (note: Users table uses UserID, not UserId)
    ALTER TABLE [dbo].[TreeStatusHistory]
    ADD CONSTRAINT [FK_TreeStatusHistory_Users] FOREIGN KEY([UserId])
    REFERENCES [dbo].[Users] ([UserID])
    ON DELETE NO ACTION;

    -- Index for faster queries by TreeId
    CREATE NONCLUSTERED INDEX [IX_TreeStatusHistory_TreeId] ON [dbo].[TreeStatusHistory]
    (
        [TreeId] ASC
    )
    INCLUDE([StatusField], [OldValue], [NewValue], [ChangedAt])
    WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY];

    -- Index for faster queries by TreeId and ChangedAt (for sorting)
    CREATE NONCLUSTERED INDEX [IX_TreeStatusHistory_TreeId_ChangedAt] ON [dbo].[TreeStatusHistory]
    (
        [TreeId] ASC,
        [ChangedAt] DESC
    )
    WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY];

    PRINT 'Table TreeStatusHistory created successfully.';
END
ELSE
BEGIN
    PRINT 'Table TreeStatusHistory already exists.';
END

COMMIT TRANSACTION;
GO

PRINT 'Migration 003_add_treestatushistory applied successfully.';

