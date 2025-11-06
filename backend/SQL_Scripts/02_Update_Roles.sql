-- =============================================
-- Script: Cập nhật Role Structure cho MamMoi
-- Mô tả: 
--   1. SystemAdmin - Quản trị hệ thống
--   2. BusinessAdmin - Quản trị doanh nghiệp
--   3. Farmer - Chủ vườn (tạo vườn, giao việc cho Staff)
--   4. Staff - Nhân viên (được Farmer giao việc)
-- =============================================

USE CapstoneDB01;
GO

-- Xóa roles cũ (nếu có)
DELETE FROM Roles;
GO

-- Insert roles mới
INSERT INTO Roles (RoleId, RoleName, Description, CreatedAt) VALUES
(1, 'SystemAdmin', 'Quản trị viên hệ thống - Quyền cao nhất', GETDATE()),
(2, 'BusinessAdmin', 'Quản trị viên doanh nghiệp - Quản lý business logic', GETDATE()),
(3, 'Farmer', 'Chủ vườn - Tạo vườn và giao việc cho Staff', GETDATE()),
(4, 'Staff', 'Nhân viên - Được Farmer giao việc chăm sóc cây', GETDATE());
GO

-- Verify
SELECT * FROM Roles ORDER BY RoleId;
GO

-- Update existing users to Farmer role (if needed)
-- UPDATE Users SET RoleId = 3 WHERE Email = 'your.email@example.com';
-- GO

PRINT 'Roles updated successfully!';
PRINT '1. SystemAdmin';
PRINT '2. BusinessAdmin';
PRINT '3. Farmer (Default for Registration)';
PRINT '4. Staff';
