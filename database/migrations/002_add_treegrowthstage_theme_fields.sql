/* ========================================================================
   Migration: 002_add_treegrowthstage_theme_fields
   Purpose  : Add Icon / NodeColor / LineColor columns for growth stage theming
   Target   : SQL Server (MamMoi DB)
   Created  : 2025-11-28
   Notes    :
     - Uses IF COL_LENGTH guard so the script is safe to run multiple times.
     - Colors stored as lowercase hex (#RRGGBB); values nullable.
   ======================================================================== */

SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;

IF COL_LENGTH('dbo.TreeGrowthStages', 'Icon') IS NULL
BEGIN
    ALTER TABLE dbo.TreeGrowthStages
    ADD Icon NVARCHAR(255) NULL;
END;

IF COL_LENGTH('dbo.TreeGrowthStages', 'NodeColor') IS NULL
BEGIN
    ALTER TABLE dbo.TreeGrowthStages
    ADD NodeColor NVARCHAR(32) NULL;
END;

IF COL_LENGTH('dbo.TreeGrowthStages', 'LineColor') IS NULL
BEGIN
    ALTER TABLE dbo.TreeGrowthStages
    ADD LineColor NVARCHAR(32) NULL;
END;

COMMIT TRANSACTION;
GO

PRINT 'Migration 002_add_treegrowthstage_theme_fields applied successfully.';

