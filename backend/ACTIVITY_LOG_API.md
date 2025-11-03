# API Activity Log - Lịch sử hoạt động/đăng nhập

## Endpoint
```
GET /api/UserProfile/{userId}/activity-logs
```

## Mô tả
- **Chức năng**: Lấy lịch sử hoạt động và đăng nhập của một người dùng
- **Hỗ trợ phân trang**: Có (pageSize, pageNumber)
- **Sắp xếp**: Mới nhất trước (CreatedAt DESC)

## Parameters

### Path Parameters
| Tên | Loại | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| `userId` | integer | ✅ | ID của người dùng |

### Query Parameters
| Tên | Loại | Bắt buộc | Giá trị mặc định | Mô tả |
|-----|------|----------|------------------|-------|
| `pageSize` | integer | ❌ | 20 | Số bản ghi mỗi trang (1-100) |
| `pageNumber` | integer | ❌ | 1 | Số trang (bắt đầu từ 1) |

## Response Success (200 OK)

```json
{
  "userId": 123,
  "pageSize": 20,
  "pageNumber": 1,
  "data": [
    {
      "logId": 1001,
      "activityType": "Login",
      "activityDescription": "User logged in successfully",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "ipAddress": null,
      "createdAt": "2025-11-02T10:30:00Z"
    },
    {
      "logId": 1000,
      "activityType": "ProfileUpdate",
      "activityDescription": "Updated profile information",
      "userAgent": "Mozilla/5.0...",
      "ipAddress": null,
      "createdAt": "2025-11-01T15:20:00Z"
    }
  ]
}
```

## Response Errors

| Code | Mô tả |
|------|-------|
| 400 | Bad Request - pageSize hoặc pageNumber không hợp lệ |
| 500 | Internal Server Error |

## Ví dụ sử dụng

### 1. Test trên Swagger
1. Mở Swagger UI: `http://localhost:<port>/swagger`
2. Tìm endpoint `GET /api/UserProfile/{userId}/activity-logs`
3. Click **"Try it out"**
4. Nhập:
   - `userId`: `1`
   - `pageSize`: `20` (hoặc để trống)
   - `pageNumber`: `1` (hoặc để trống)
5. Click **"Execute"**

### 2. cURL
```bash
# Lấy 20 log đầu tiên
curl -X GET "http://localhost:5000/api/UserProfile/1/activity-logs?pageSize=20&pageNumber=1"

# Lấy trang 2
curl -X GET "http://localhost:5000/api/UserProfile/1/activity-logs?pageSize=20&pageNumber=2"

# Lấy 10 log mới nhất
curl -X GET "http://localhost:5000/api/UserProfile/1/activity-logs?pageSize=10"
```

### 3. JavaScript/Fetch
```javascript
const userId = 1;
const pageSize = 20;
const pageNumber = 1;

fetch(`/api/UserProfile/${userId}/activity-logs?pageSize=${pageSize}&pageNumber=${pageNumber}`)
  .then(res => res.json())
  .then(data => {
    console.log('Activity logs:', data.data);
    console.log('Total retrieved:', data.data.length);
  });
```

## ActivityLogDto Schema

```csharp
public class ActivityLogDto
{
    public int LogId { get; set; }
    public string ActivityType { get; set; }        // Loại hoạt động (Login, Logout, ProfileUpdate, etc.)
    public string? ActivityDescription { get; set; } // Mô tả chi tiết
    public string? UserAgent { get; set; }          // Browser/Device info
    public string? IpAddress { get; set; }          // IP address (nếu có)
    public DateTime CreatedAt { get; set; }         // Thời gian
}
```

## Validation

- `pageSize`: phải từ 1 đến 100
- `pageNumber`: phải lớn hơn 0
- Nếu không hợp lệ → trả về 400 Bad Request

## Luồng hoạt động

1. Client gọi `GET /api/UserProfile/{userId}/activity-logs?pageSize=20&pageNumber=1`
2. Controller validate pageSize và pageNumber
3. Service query database:
   - Lọc theo `UserId`
   - Sắp xếp theo `CreatedAt DESC` (mới nhất trước)
   - Skip: `(pageNumber - 1) * pageSize`
   - Take: `pageSize`
4. Map sang `ActivityLogDto` và trả về

## Lưu ý

### 1. ActivityLog table
- Bảng `ActivityLog` đã có sẵn trong database
- Các trường quan trọng:
  - `UserId`: ID người dùng
  - `ActivityType`: Loại hoạt động
  - `ActivityDescription`: Mô tả
  - `UserAgent`: Thông tin browser/device
  - `CreatedAt`: Timestamp

### 2. Ghi log khi Login
- Khi implement API Login, nhớ tạo record trong `ActivityLog`:
```csharp
var activityLog = new ActivityLog
{
    UserId = user.UserId,
    ActivityType = "Login",
    ActivityDescription = "User logged in successfully",
    UserAgent = Request.Headers["User-Agent"].ToString(),
    CreatedAt = DateTime.UtcNow
};
await _context.ActivityLogs.AddAsync(activityLog);
await _context.SaveChangesAsync();
```

### 3. Các ActivityType thường dùng
- `Login` - Đăng nhập
- `Logout` - Đăng xuất
- `ProfileUpdate` - Cập nhật profile
- `PasswordChange` - Đổi mật khẩu
- `EmailChange` - Đổi email
- `AvatarUpload` - Upload avatar
- `FailedLogin` - Đăng nhập thất bại

### 4. Bảo mật
- Chỉ cho phép user xem activity log của chính mình
- Admin có thể xem activity log của bất kỳ user nào
- Cần implement Authorization để kiểm tra quyền

### 5. Performance
- Index trên `(UserId, CreatedAt DESC)` để tăng tốc query
- Giới hạn pageSize tối đa 100 để tránh load quá nhiều
- Có thể cache result nếu traffic cao

## Next Steps

1. **Implement Authorization**: Kiểm tra user chỉ xem được log của mình
2. **Add IP Address**: Lưu IP address khi ghi log
3. **Add Filters**: Lọc theo ActivityType, date range
4. **Add Total Count**: Trả về tổng số records để làm pagination UI
5. **Implement Logging**: Tự động ghi log cho các hành động quan trọng (Login, Logout, ProfileUpdate, etc.)
