ALTER TABLE [dbo].[Trees]
ADD [CycleCount] INT NOT NULL CONSTRAINT DF_Trees_CycleCount DEFAULT (0);


