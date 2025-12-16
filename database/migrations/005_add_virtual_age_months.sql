-- 005_add_virtual_age_months.sql
-- Add VirtualAgeMonths column to Trees table. Nullable int used to store a "virtual" age
-- when manual lifecycle overrides should not modify the real PlantDate/preMonths.

-- NOTE: adjust the table/schema name if your DB uses a different casing or schema.
-- This migration is written as generic ANSI SQL; if your DB is PostgreSQL or MySQL
-- it will work in most cases. If using SQL Server, the statements below are also valid.

-- SQL Server (T-SQL) compatible version
-- Add the column only if it does not already exist
IF COL_LENGTH('dbo.Trees', 'VirtualAgeMonths') IS NULL
BEGIN
    ALTER TABLE dbo.Trees ADD VirtualAgeMonths INT NULL;
END

IF COL_LENGTH('dbo.Trees', 'VirtualAgeMonths') IS NOT NULL
BEGIN
    -- Use dynamic SQL to avoid compile-time column resolution errors
    EXEC sp_executesql N'UPDATE dbo.Trees SET VirtualAgeMonths = NULL WHERE VirtualAgeMonths IS NULL';
END
-- Optional: add column description as an extended property (safe to skip if not desired)
BEGIN TRY
    DECLARE @tbl sysname = N'Trees';
    DECLARE @col sysname = N'VirtualAgeMonths';
    DECLARE @schema sysname = N'dbo';

    IF NOT EXISTS (
        SELECT 1 FROM sys.extended_properties ep
        JOIN sys.tables t ON ep.major_id = t.object_id
        JOIN sys.schemas s ON t.schema_id = s.schema_id
        JOIN sys.columns c ON c.object_id = t.object_id AND c.name = @col
        WHERE t.name = @tbl AND s.name = @schema AND c.name = @col AND ep.name = 'MS_Description'
    )
    BEGIN
        EXEC sys.sp_addextendedproperty
            @name = N'MS_Description',
            @value = N'Nullable virtual age in months used for manual lifecycle overrides (does not change PlantDate/preMonths)',
            @level0type = N'SCHEMA', @level0name = @schema,
            @level1type = N'TABLE',  @level1name = @tbl,
            @level2type = N'COLUMN', @level2name = @col;
    END
END TRY
BEGIN CATCH
    -- ignore errors related to extended properties; column creation is the important part
END CATCH
