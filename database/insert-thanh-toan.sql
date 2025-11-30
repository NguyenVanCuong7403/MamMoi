-- ===== Insert Payment Data Script =====
-- This script inserts sample payment data into the Payments table
-- Run this script after schema.sql and insert.sql have been executed
-- Note: Make sure Subscriptions and Users exist before running this script

USE [MamMoi]
GO

PRINT 'Starting payment data insertion...'
PRINT 'Note: Make sure Users and Subscriptions exist before running this script.'
GO

-- ===== Get User IDs =====
DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Farmer2ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');
DECLARE @Farmer3ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer3@mammoi.com');

PRINT 'User IDs:'
PRINT '  - Farmer 1: ' + ISNULL(CAST(@Farmer1ID AS NVARCHAR(10)), 'NOT FOUND')
PRINT '  - Farmer 2: ' + ISNULL(CAST(@Farmer2ID AS NVARCHAR(10)), 'NOT FOUND')
PRINT '  - Farmer 3: ' + ISNULL(CAST(@Farmer3ID AS NVARCHAR(10)), 'NOT FOUND')
GO

-- ===== Payment 1: Farmer 1 - Success payment for Gói Vườn Xanh (January 2024) =====
DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Sub1ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'orchard' AND [Status] = N'Active');
IF @Sub1ID IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub1ID AND [PaymentDate] = '2024-01-15 10:30:00')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [InvoiceUrl], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub1ID, @Farmer1ID, '2024-01-15 10:30:00', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240115-001', N'VNPAY202401151030001',
                N'Thanh toán gói dịch vụ Gói Vườn Xanh', N'INV-2024-001', N'https://mammoi.com/invoice/INV-2024-001', 
                0, N'192.168.1.100', '2024-01-15 10:30:00');
        PRINT '  - Inserted: Payment 1 - Farmer 1 (Success - Gói Vườn Xanh)'
    END
END
GO

-- ===== Payment 2: Farmer 2 - Success payment for Gói Ươm Mầm (February 2024) =====
DECLARE @Farmer2ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');
DECLARE @Sub2ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'seedling' AND [Status] = N'Active');
IF @Sub2ID IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub2ID AND [PaymentDate] = '2024-02-20 14:20:00')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub2ID, @Farmer2ID, '2024-02-20 14:20:00', 490000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20240220-001', N'MOMO202402201420001',
                N'Thanh toán gói dịch vụ Gói Ươm Mầm', N'INV-2024-045', 
                0, N'192.168.1.101', '2024-02-20 14:20:00');
        PRINT '  - Inserted: Payment 2 - Farmer 2 (Success - Gói Ươm Mầm)'
    END
END
GO

-- ===== Payment 3: Farmer 3 - Success payment for Gói Thu Hoạch (March 2024) =====
DECLARE @Farmer3ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer3@mammoi.com');
DECLARE @Sub3ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer3ID AND [PlanType] = N'harvest' AND [Status] = N'Active');
IF @Sub3ID IS NOT NULL AND @Farmer3ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub3ID AND [PaymentDate] = '2024-03-10 09:15:00')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [InvoiceUrl], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub3ID, @Farmer3ID, '2024-03-10 09:15:00', 3890000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240310-001', N'VNPAY202403100915001',
                N'Thanh toán gói dịch vụ Gói Thu Hoạch', N'INV-2024-069', N'https://mammoi.com/invoice/INV-2024-069',
                0, N'192.168.1.102', '2024-03-10 09:15:00');
        PRINT '  - Inserted: Payment 3 - Farmer 3 (Success - Gói Thu Hoạch)'
    END
END
GO

-- ===== Payment 4: Farmer 1 - Success payment (April 2024 - Renewal) =====
DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Sub1ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'orchard' AND [Status] = N'Active');
IF @Sub1ID IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub1ID AND [PaymentDate] = '2024-04-15 11:00:00')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub1ID, @Farmer1ID, '2024-04-15 11:00:00', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240415-001', N'VNPAY202404151100001',
                N'Gia hạn gói dịch vụ Gói Vườn Xanh', N'INV-2024-105',
                0, N'192.168.1.100', '2024-04-15 11:00:00');
        PRINT '  - Inserted: Payment 4 - Farmer 1 (Success - Renewal)'
    END
END
GO

-- ===== Payment 5: Farmer 2 - Failed payment (March 2024) =====
DECLARE @Farmer2ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');
DECLARE @Sub2ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'seedling' AND [Status] = N'Active');
IF @Sub2ID IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub2ID AND [PaymentDate] = '2024-03-18 16:45:00' AND [TransactionStatus] = N'Failed')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub2ID, @Farmer2ID, '2024-03-18 16:45:00', 490000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Failed', N'TXN-20240318-FAIL', N'VNPAY202403181645FAIL',
                N'Thanh toán thất bại - Gói Ươm Mầm (Không đủ số dư)', N'INV-2024-077-FAIL',
                0, N'192.168.1.101', '2024-03-18 16:45:00');
        PRINT '  - Inserted: Payment 5 - Farmer 2 (Failed)'
    END
END
GO

-- ===== Payment 6: Farmer 3 - Pending payment (April 2024) =====
DECLARE @Farmer3ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer3@mammoi.com');
DECLARE @Sub3ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer3ID AND [PlanType] = N'harvest' AND [Status] = N'Active');
IF @Sub3ID IS NOT NULL AND @Farmer3ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub3ID AND [PaymentDate] = '2024-04-20 20:30:00' AND [TransactionStatus] = N'Pending')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub3ID, @Farmer3ID, '2024-04-20 20:30:00', 3890000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Pending', N'TXN-20240420-PEND', N'MOMO202404202030PEND',
                N'Thanh toán đang xử lý - Gói Thu Hoạch', N'INV-2024-110-PEND',
                0, N'192.168.1.102', '2024-04-20 20:30:00');
        PRINT '  - Inserted: Payment 6 - Farmer 3 (Pending)'
    END
END
GO

-- ===== Payment 7: Farmer 1 - Success payment with Momo (May 2024) =====
DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Sub1ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'orchard' AND [Status] = N'Active');
IF @Sub1ID IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub1ID AND [PaymentDate] = '2024-05-12 13:25:00')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [ReceiptUrl], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub1ID, @Farmer1ID, '2024-05-12 13:25:00', 1290000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20240512-001', N'MOMO202405121325001',
                N'Thanh toán gói dịch vụ Gói Vườn Xanh qua Momo', N'INV-2024-132', N'https://mammoi.com/receipt/INV-2024-132',
                0, N'192.168.1.100', '2024-05-12 13:25:00');
        PRINT '  - Inserted: Payment 7 - Farmer 1 (Success - Momo)'
    END
END
GO

-- ===== Payment 8: Farmer 2 - Success payment (June 2024) =====
DECLARE @Farmer2ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');
DECLARE @Sub2ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'seedling' AND [Status] = N'Active');
IF @Sub2ID IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub2ID AND [PaymentDate] = '2024-06-05 08:50:00')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub2ID, @Farmer2ID, '2024-06-05 08:50:00', 490000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240605-001', N'VNPAY202406050850001',
                N'Gia hạn gói dịch vụ Gói Ươm Mầm', N'INV-2024-156',
                0, N'192.168.1.101', '2024-06-05 08:50:00');
        PRINT '  - Inserted: Payment 8 - Farmer 2 (Success)'
    END
END
GO

-- ===== Payment 9: Farmer 1 - Success payment with refund (July 2024) =====
DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Sub1ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'orchard' AND [Status] = N'Active');
IF @Sub1ID IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub1ID AND [PaymentDate] = '2024-07-01 15:40:00')
    BEGIN
        DECLARE @PaymentID INT;
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [IsRefunded], [RefundAmount], [RefundDate], [RefundReason],
                                     [IPAddress], [CreatedAt])
        VALUES (@Sub1ID, @Farmer1ID, '2024-07-01 15:40:00', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240701-001', N'VNPAY202407011540001',
                N'Thanh toán gói dịch vụ Gói Vườn Xanh', N'INV-2024-182',
                1, 1290000.00, '2024-07-05 10:00:00', N'Yêu cầu hoàn tiền từ khách hàng',
                N'192.168.1.100', '2024-07-01 15:40:00');
        SET @PaymentID = SCOPE_IDENTITY();
        PRINT '  - Inserted: Payment 9 - Farmer 1 (Success with Refund)'
    END
END
GO

-- ===== Payment 10: Farmer 3 - Success payment (July 2024) =====
DECLARE @Farmer3ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer3@mammoi.com');
DECLARE @Sub3ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer3ID AND [PlanType] = N'harvest' AND [Status] = N'Active');
IF @Sub3ID IS NOT NULL AND @Farmer3ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub3ID AND [PaymentDate] = '2024-07-15 12:10:00')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [InvoiceUrl], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub3ID, @Farmer3ID, '2024-07-15 12:10:00', 3890000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240715-001', N'VNPAY202407151210001',
                N'Gia hạn gói dịch vụ Gói Thu Hoạch', N'INV-2024-196', N'https://mammoi.com/invoice/INV-2024-196',
                0, N'192.168.1.102', '2024-07-15 12:10:00');
        PRINT '  - Inserted: Payment 10 - Farmer 3 (Success)'
    END
END
GO

-- ===== Payment 11: Farmer 2 - Success payment (August 2024) =====
DECLARE @Farmer2ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');
DECLARE @Sub2ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'seedling' AND [Status] = N'Active');
IF @Sub2ID IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub2ID AND [PaymentDate] = '2024-08-10 09:30:00')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub2ID, @Farmer2ID, '2024-08-10 09:30:00', 490000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20240810-001', N'MOMO202408100930001',
                N'Thanh toán gói dịch vụ Gói Ươm Mầm', N'INV-2024-223',
                0, N'192.168.1.101', '2024-08-10 09:30:00');
        PRINT '  - Inserted: Payment 11 - Farmer 2 (Success)'
    END
END
GO

-- ===== Payment 12: Farmer 1 - Success payment (August 2024) =====
DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Sub1ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'orchard' AND [Status] = N'Active');
IF @Sub1ID IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub1ID AND [PaymentDate] = '2024-08-20 16:20:00')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [ReceiptUrl], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub1ID, @Farmer1ID, '2024-08-20 16:20:00', 1290000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240820-001', N'VNPAY202408201620001',
                N'Thanh toán gói dịch vụ Gói Vườn Xanh', N'INV-2024-233', N'https://mammoi.com/receipt/INV-2024-233',
                0, N'192.168.1.100', '2024-08-20 16:20:00');
        PRINT '  - Inserted: Payment 12 - Farmer 1 (Success)'
    END
END
GO

-- ===== Payment 13: Farmer 3 - Failed payment (September 2024) =====
DECLARE @Farmer3ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer3@mammoi.com');
DECLARE @Sub3ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer3ID AND [PlanType] = N'harvest' AND [Status] = N'Active');
IF @Sub3ID IS NOT NULL AND @Farmer3ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub3ID AND [PaymentDate] = '2024-09-05 11:15:00' AND [TransactionStatus] = N'Failed')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub3ID, @Farmer3ID, '2024-09-05 11:15:00', 3890000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Failed', N'TXN-20240905-FAIL', N'VNPAY202409051115FAIL',
                N'Thanh toán thất bại - Gói Thu Hoạch (Thẻ bị từ chối)', N'INV-2024-248-FAIL',
                0, N'192.168.1.102', '2024-09-05 11:15:00');
        PRINT '  - Inserted: Payment 13 - Farmer 3 (Failed)'
    END
END
GO

-- ===== Payment 14: Farmer 2 - Success payment (September 2024) =====
DECLARE @Farmer2ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');
DECLARE @Sub2ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'seedling' AND [Status] = N'Active');
IF @Sub2ID IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub2ID AND [PaymentDate] = '2024-09-18 14:45:00')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub2ID, @Farmer2ID, '2024-09-18 14:45:00', 490000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20240918-001', N'VNPAY202409181445001',
                N'Thanh toán gói dịch vụ Gói Ươm Mầm', N'INV-2024-261',
                0, N'192.168.1.101', '2024-09-18 14:45:00');
        PRINT '  - Inserted: Payment 14 - Farmer 2 (Success)'
    END
END
GO

-- ===== Payment 15: Farmer 1 - Success payment (October 2024) =====
DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Sub1ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'orchard' AND [Status] = N'Active');
IF @Sub1ID IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub1ID AND [PaymentDate] = '2024-10-10 10:00:00')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [InvoiceUrl], [ReceiptUrl], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub1ID, @Farmer1ID, '2024-10-10 10:00:00', 1290000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20241010-001', N'MOMO202410101000001',
                N'Thanh toán gói dịch vụ Gói Vườn Xanh', N'INV-2024-283', 
                N'https://mammoi.com/invoice/INV-2024-283', N'https://mammoi.com/receipt/INV-2024-283',
                0, N'192.168.1.100', '2024-10-10 10:00:00');
        PRINT '  - Inserted: Payment 15 - Farmer 1 (Success)'
    END
END
GO

-- ===== Payment 16: Farmer 3 - Success payment (October 2024) =====
DECLARE @Farmer3ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer3@mammoi.com');
DECLARE @Sub3ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer3ID AND [PlanType] = N'harvest' AND [Status] = N'Active');
IF @Sub3ID IS NOT NULL AND @Farmer3ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub3ID AND [PaymentDate] = '2024-10-25 15:30:00')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub3ID, @Farmer3ID, '2024-10-25 15:30:00', 3890000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20241025-001', N'VNPAY202410251530001',
                N'Thanh toán gói dịch vụ Gói Thu Hoạch', N'INV-2024-298',
                0, N'192.168.1.102', '2024-10-25 15:30:00');
        PRINT '  - Inserted: Payment 16 - Farmer 3 (Success)'
    END
END
GO

-- ===== Payment 17: Farmer 2 - Success payment (November 2024) =====
DECLARE @Farmer2ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');
DECLARE @Sub2ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'seedling' AND [Status] = N'Active');
IF @Sub2ID IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub2ID AND [PaymentDate] = '2024-11-12 08:20:00')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub2ID, @Farmer2ID, '2024-11-12 08:20:00', 490000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20241112-001', N'VNPAY202411120820001',
                N'Thanh toán gói dịch vụ Gói Ươm Mầm', N'INV-2024-315',
                0, N'192.168.1.101', '2024-11-12 08:20:00');
        PRINT '  - Inserted: Payment 17 - Farmer 2 (Success)'
    END
END
GO

-- ===== Payment 18: Farmer 1 - Success payment (November 2024) =====
DECLARE @Farmer1ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer1@mammoi.com');
DECLARE @Sub1ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer1ID AND [PlanType] = N'orchard' AND [Status] = N'Active');
IF @Sub1ID IS NOT NULL AND @Farmer1ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub1ID AND [PaymentDate] = '2024-11-22 13:15:00')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [InvoiceUrl], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub1ID, @Farmer1ID, '2024-11-22 13:15:00', 1290000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Success', N'TXN-20241122-001', N'MOMO202411221315001',
                N'Thanh toán gói dịch vụ Gói Vườn Xanh', N'INV-2024-325', N'https://mammoi.com/invoice/INV-2024-325',
                0, N'192.168.1.100', '2024-11-22 13:15:00');
        PRINT '  - Inserted: Payment 18 - Farmer 1 (Success)'
    END
END
GO

-- ===== Payment 19: Farmer 3 - Pending payment (December 2024) =====
DECLARE @Farmer3ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer3@mammoi.com');
DECLARE @Sub3ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer3ID AND [PlanType] = N'harvest' AND [Status] = N'Active');
IF @Sub3ID IS NOT NULL AND @Farmer3ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub3ID AND [PaymentDate] = '2024-12-01 09:45:00' AND [TransactionStatus] = N'Pending')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub3ID, @Farmer3ID, '2024-12-01 09:45:00', 3890000.00, N'VND', N'Bank Transfer', N'Momo', 
                N'Pending', N'TXN-20241201-PEND', N'MOMO202412010945PEND',
                N'Thanh toán đang xử lý - Gói Thu Hoạch', N'INV-2024-335-PEND',
                0, N'192.168.1.102', '2024-12-01 09:45:00');
        PRINT '  - Inserted: Payment 19 - Farmer 3 (Pending)'
    END
END
GO

-- ===== Payment 20: Farmer 2 - Success payment (December 2024) =====
DECLARE @Farmer2ID INT = (SELECT TOP 1 [UserID] FROM [dbo].[Users] WHERE [Email] = 'farmer2@mammoi.com');
DECLARE @Sub2ID INT = (SELECT TOP 1 [SubscriptionID] FROM [dbo].[Subscriptions] WHERE [UserID] = @Farmer2ID AND [PlanType] = N'seedling' AND [Status] = N'Active');
IF @Sub2ID IS NOT NULL AND @Farmer2ID IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Payments] WHERE [SubscriptionID] = @Sub2ID AND [PaymentDate] = '2024-12-15 11:30:00')
    BEGIN
        INSERT INTO [dbo].[Payments] ([SubscriptionID], [UserID], [PaymentDate], [Amount], [Currency], [PaymentMethod], 
                                     [PaymentProvider], [TransactionStatus], [TransactionID], [ProviderTransactionID],
                                     [Description], [InvoiceNumber], [ReceiptUrl], [IsRefunded], [IPAddress], [CreatedAt])
        VALUES (@Sub2ID, @Farmer2ID, '2024-12-15 11:30:00', 490000.00, N'VND', N'Credit Card', N'VNPay', 
                N'Success', N'TXN-20241215-001', N'VNPAY202412151130001',
                N'Thanh toán gói dịch vụ Gói Ươm Mầm', N'INV-2024-349', N'https://mammoi.com/receipt/INV-2024-349',
                0, N'192.168.1.101', '2024-12-15 11:30:00');
        PRINT '  - Inserted: Payment 20 - Farmer 2 (Success)'
    END
END
GO

PRINT ''
PRINT 'Payment data insertion completed!'
PRINT 'Total payments inserted: Check the output above for details.'
GO

