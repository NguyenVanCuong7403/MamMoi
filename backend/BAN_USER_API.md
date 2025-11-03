# API Ban/Unban User - Cấm/Mở khóa Tài khoản

## Mô tả
API này cho phép quản trị viên cấm (ban) hoặc mở khóa (unban) tài khoản người dùng bằng cách thay đổi trạng thái `IsActive` trong database.

---

## 1. Ban User (Cấm tài khoản)

### Endpoint
```
POST /api/Users/{userId}/ban
```

### Mô tả
- **Chức năng**: Cấm tài khoản người dùng
- **Hành động**: Đổi `IsActive` = `false` trong database
- **Kết quả**: Người dùng không thể đăng nhập được

### Parameters
| Tên | Loại | Vị trí | Bắt buộc | Mô tả |
|-----|------|--------|----------|-------|
| `userId` | integer | path | ✅ | ID của người dùng cần ban |

### Response Success (200 OK)
```json
{
  "message": "User has been banned successfully",
  "userId": 123,
  "isActive": false
}
```

### Response Errors
| Code | Mô tả |
|------|-------|
| 404 | User not found - Không tìm thấy người dùng |
| 500 | Internal Server Error - Lỗi hệ thống |

### Ví dụ Test trên Swagger
1. Mở Swagger UI: `http://localhost:<port>/swagger`
2. Tìm endpoint `POST /api/Users/{userId}/ban`
3. Click **"Try it out"**
4. Nhập `userId` (ví dụ: `1`)
5. Click **"Execute"**

### Ví dụ cURL
```bash
curl -X POST "http://localhost:5000/api/Users/1/ban" -H "accept: */*"
```

---

## 2. Unban User (Mở khóa tài khoản)

### Endpoint
```
POST /api/Users/{userId}/unban
```

### Mô tả
- **Chức năng**: Mở khóa tài khoản người dùng đã bị ban
- **Hành động**: Đổi `IsActive` = `true` trong database
- **Kết quả**: Người dùng có thể đăng nhập trở lại

### Parameters
| Tên | Loại | Vị trí | Bắt buộc | Mô tả |
|-----|------|--------|----------|-------|
| `userId` | integer | path | ✅ | ID của người dùng cần unban |

### Response Success (200 OK)
```json
{
  "message": "User has been unbanned successfully",
  "userId": 123,
  "isActive": true
}
```

### Response Errors
| Code | Mô tả |
|------|-------|
| 404 | User not found - Không tìm thấy người dùng |
| 500 | Internal Server Error - Lỗi hệ thống |

### Ví dụ Test trên Swagger
1. Mở Swagger UI: `http://localhost:<port>/swagger`
2. Tìm endpoint `POST /api/Users/{userId}/unban`
3. Click **"Try it out"**
4. Nhập `userId` (ví dụ: `1`)
5. Click **"Execute"**

### Ví dụ cURL
```bash
curl -X POST "http://localhost:5000/api/Users/1/unban" -H "accept: */*"
```

---

## Luồng hoạt động

### Ban User
1. Client gọi `POST /api/Users/{userId}/ban`
2. Controller nhận request và gọi `_userService.BanUserAsync(userId)`
3. Service tìm user trong database
4. Nếu tìm thấy:
   - Đổi `IsActive = false`
   - Đổi `UpdatedAt = DateTime.UtcNow`
   - Lưu vào database
5. Trả về kết quả thành công hoặc lỗi

### Unban User
1. Client gọi `POST /api/Users/{userId}/unban`
2. Controller nhận request và gọi `_userService.UnbanUserAsync(userId)`
3. Service tìm user trong database
4. Nếu tìm thấy:
   - Đổi `IsActive = true`
   - Đổi `UpdatedAt = DateTime.UtcNow`
   - Lưu vào database
5. Trả về kết quả thành công hoặc lỗi

---

## Database Schema

### Bảng User
```sql
CREATE TABLE Users (
    UserId INT PRIMARY KEY,
    ...
    IsActive BIT NOT NULL,  -- true = active, false = banned
    UpdatedAt DATETIME2,
    ...
);
```

---

## Lưu ý quan trọng

1. **Kiểm tra IsActive khi Login**: 
   - Khi implement API Login, cần kiểm tra `IsActive == true` trước khi cho phép đăng nhập
   - Nếu `IsActive == false`, trả về lỗi "Account has been banned"

2. **Quyền truy cập**: 
   - Chỉ admin hoặc người có quyền mới được gọi API này
   - Cần implement authorization (JWT, Role-based) để bảo vệ endpoint

3. **Logging**: 
   - Mọi thao tác ban/unban đều được log để audit trail
   - Lưu thông tin: ai ban, ban ai, khi nào

4. **Soft Delete vs Ban**:
   - Ban: Tài khoản vẫn tồn tại, chỉ không đăng nhập được
   - Delete: Xóa tài khoản hoàn toàn (nếu có API Delete)

---

## Code Implementation

### IUserService.cs
```csharp
Task<bool> BanUserAsync(int userId);
Task<bool> UnbanUserAsync(int userId);
```

### UserService.cs
```csharp
public async Task<bool> BanUserAsync(int userId)
{
    var user = await _userRepository.GetByIdAsync(userId);
    if (user == null)
        return false;

    var userEntity = (User)user;
    userEntity.IsActive = false;
    userEntity.UpdatedAt = DateTime.UtcNow;

    await _userRepository.UpdateAsync(userEntity);
    return true;
}

public async Task<bool> UnbanUserAsync(int userId)
{
    var user = await _userRepository.GetByIdAsync(userId);
    if (user == null)
        return false;

    var userEntity = (User)user;
    userEntity.IsActive = true;
    userEntity.UpdatedAt = DateTime.UtcNow;

    await _userRepository.UpdateAsync(userEntity);
    return true;
}
```

### UsersController.cs
```csharp
[HttpPost("{userId}/ban")]
public async Task<IActionResult> BanUser(int userId)
{
    try
    {
        var result = await _userService.BanUserAsync(userId);
        if (!result)
            return NotFound(new { message = "User not found" });

        return Ok(new 
        { 
            message = "User has been banned successfully", 
            userId = userId,
            isActive = false 
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error banning user {UserId}", userId);
        return StatusCode(500, new { message = "An error occurred while banning user" });
    }
}
```

---

## Testing Checklist

- [ ] Test ban user thành công với userId hợp lệ
- [ ] Test ban user với userId không tồn tại → 404
- [ ] Test unban user thành công
- [ ] Kiểm tra database: `IsActive` thay đổi đúng
- [ ] Kiểm tra database: `UpdatedAt` được cập nhật
- [ ] Test login với tài khoản bị ban → phải bị từ chối
- [ ] Test login sau khi unban → thành công

---

## Next Steps

1. **Implement Login Check**: Thêm logic kiểm tra `IsActive` trong API Login
2. **Add Authorization**: Bảo vệ endpoint chỉ cho admin
3. **Add Audit Log**: Ghi lại lịch sử ban/unban
4. **Email Notification**: Gửi email thông báo khi bị ban/unban
