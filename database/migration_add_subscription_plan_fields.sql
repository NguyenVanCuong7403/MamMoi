-- ===== Migration Script: Add New Fields to SubscriptionPlans Table =====
-- This script adds MaxGardens, MaxTreesPerGarden, and DurationInMonths columns
-- to the SubscriptionPlans table for existing databases
-- Run this script if you already have a database with the old schema

USE [MamMoi]
GO

PRINT 'Starting migration: Adding new fields to SubscriptionPlans table...'
GO

-- Add MaxGardens column if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SubscriptionPlans]') AND name = 'MaxGardens')
BEGIN
    ALTER TABLE [dbo].[SubscriptionPlans]
    ADD [MaxGardens] [int] NULL;
    PRINT '  - Added column: MaxGardens'
END
ELSE
BEGIN
    PRINT '  - Column MaxGardens already exists, skipping...'
END
GO

-- Add MaxTreesPerGarden column if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SubscriptionPlans]') AND name = 'MaxTreesPerGarden')
BEGIN
    ALTER TABLE [dbo].[SubscriptionPlans]
    ADD [MaxTreesPerGarden] [int] NULL;
    PRINT '  - Added column: MaxTreesPerGarden'
END
ELSE
BEGIN
    PRINT '  - Column MaxTreesPerGarden already exists, skipping...'
END
GO

-- Add DurationInMonths column if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SubscriptionPlans]') AND name = 'DurationInMonths')
BEGIN
    ALTER TABLE [dbo].[SubscriptionPlans]
    ADD [DurationInMonths] [int] NULL;
    PRINT '  - Added column: DurationInMonths'
END
ELSE
BEGIN
    PRINT '  - Column DurationInMonths already exists, skipping...'
END
GO

PRINT ''
PRINT 'Migration completed successfully!'
PRINT ''
PRINT 'Note: After running this migration, you may want to:'
PRINT '  1. Update existing subscription plans with appropriate values'
PRINT '  2. Run insert.sql to add/update the 4 fixed plans (Free, Gói 1, Gói 2, Gói 3)'
PRINT ''
GO

