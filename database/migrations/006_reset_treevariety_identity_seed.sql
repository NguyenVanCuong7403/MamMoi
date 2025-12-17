-- Migration: Reset TreeVariety IDENTITY seed to correct value
-- Date: 2025-01-XX
-- Description: Resets the IDENTITY seed for TreeVariety table to continue from the maximum existing ID
--              This fixes the issue where new varieties get IDs like 1002 instead of 3

USE [MamMoi]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

PRINT '========================================';
PRINT 'Migration 006: Reset TreeVariety IDENTITY Seed';
PRINT '========================================';
PRINT '';

BEGIN TRANSACTION;

BEGIN TRY
    -- Check current identity value
    DECLARE @CurrentIdentity INT;
    SELECT @CurrentIdentity = IDENT_CURRENT('[dbo].[TreeVariety]');
    PRINT 'Current IDENTITY value: ' + CAST(@CurrentIdentity AS VARCHAR(10));

    -- Get max existing ID
    DECLARE @MaxID INT;
    SELECT @MaxID = ISNULL(MAX([VarietyID]), 0) FROM [dbo].[TreeVariety];
    PRINT 'Maximum existing VarietyID: ' + CAST(@MaxID AS VARCHAR(10));

    -- Get count of records
    DECLARE @RecordCount INT;
    SELECT @RecordCount = COUNT(*) FROM [dbo].[TreeVariety];
    PRINT 'Total records in TreeVariety: ' + CAST(@RecordCount AS VARCHAR(10));

    -- Display all existing IDs for debugging
    PRINT '';
    PRINT 'Existing VarietyIDs:';
    DECLARE @ExistingIDs NVARCHAR(MAX) = '';
    SELECT @ExistingIDs = @ExistingIDs + CAST([VarietyID] AS VARCHAR(10)) + ', '
    FROM [dbo].[TreeVariety]
    ORDER BY [VarietyID];
    -- Remove trailing comma and space
    IF LEN(@ExistingIDs) > 0
        SET @ExistingIDs = LEFT(@ExistingIDs, LEN(@ExistingIDs) - 1);
    PRINT @ExistingIDs;

    -- Reset identity seed to max ID
    IF @MaxID > 0
    BEGIN
        DBCC CHECKIDENT('[dbo].[TreeVariety]', RESEED, @MaxID);
        PRINT '';
        PRINT 'SUCCESS: Reset IDENTITY seed to ' + CAST(@MaxID AS VARCHAR(10));
        PRINT 'Next auto-generated ID will be: ' + CAST(@MaxID + 1 AS VARCHAR(10));
    END
    ELSE
    BEGIN
        -- No records exist, reset to 0 so first insert gets ID 1
        DBCC CHECKIDENT('[dbo].[TreeVariety]', RESEED, 0);
        PRINT '';
        PRINT 'SUCCESS: No records found. Reset IDENTITY seed to 0';
        PRINT 'Next auto-generated ID will be: 1';
    END

    COMMIT TRANSACTION;
    PRINT '';
    PRINT 'Migration 006 completed successfully!';
    PRINT '========================================';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
    DECLARE @ErrorState INT = ERROR_STATE();

    PRINT '';
    PRINT 'ERROR: Migration 006 failed!';
    PRINT 'Error Message: ' + @ErrorMessage;
    PRINT '========================================';

    RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
END CATCH

GO
