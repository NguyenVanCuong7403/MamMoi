# Quick Fix Guide - UserProfile API

## Vấn đề đã sửa:

### 1. Error: ArgumentNullException - Value cannot be null (Parameter 'path1')
**Nguyên nhân**: `IWebHostEnvironment.WebRootPath` trả về null vì chưa có thư mục `wwwroot` trong project

**Giải pháp**:
- ✅ Tạo thư mục `wwwroot` trong `MamMoi.Api`
- ✅ Tạo cấu trúc thư mục `wwwroot/uploads/avatars/`
- ✅ Sửa `UserProfileService` constructor để fallback về `ContentRootPath` nếu `WebRootPath` null

### 2. Code đã sửa:

```csharp
// OLD CODE (gây lỗi):
_uploadPath = Path.Combine(environment.WebRootPath, "uploads", "avatars");

// NEW CODE (đã fix):
var webRootPath = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
_uploadPath = Path.Combine(webRootPath, "uploads", "avatars");
```

## Cấu trúc thư mục hiện tại:

```
MamMoi.Api/
├── wwwroot/                    <- Mới tạo
│   ├── README.md
│   └── uploads/
│       └── avatars/            <- Thư mục lưu avatar
│           ├── .gitkeep
│           └── .gitignore
├── Controllers/
├── Program.cs
└── ...
```

## Test lại API:

Bây giờ bạn có thể test các endpoints:

### 1. GET /api/UserProfile/{userId}
```bash
curl -X 'GET' 'https://localhost:7237/api/UserProfile/1' -H 'accept: application/json'
```

### 2. PUT /api/UserProfile/{userId}
```bash
curl -X 'PUT' 'https://localhost:7237/api/UserProfile/1' \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "+84901234567",
    "address": "123 Test St",
    "experienceLevel": "Intermediate",
    "preferredLanguage": "vi"
  }'
```

### 3. POST /api/UserProfile/{userId}/avatar
- Sử dụng Swagger UI hoặc Postman để upload file
- Max size: 5MB
- Supported formats: jpg, jpeg, png, gif, bmp

## Các file đã thay đổi:

1. ✅ `MamMoi.Infrastructure/Services/UserProfileService.cs` - Fix null reference
2. ✅ `MamMoi.Api/wwwroot/` - Tạo thư mục static files
3. ✅ `MamMoi.Api/wwwroot/uploads/avatars/` - Tạo thư mục avatars

## Lưu ý:

- Thư mục `wwwroot` cần được include trong project khi deploy
- Thư mục `uploads/avatars` sẽ chứa file ảnh của users (đã config .gitignore)
- Static files đã được enable trong `Program.cs` với `app.UseStaticFiles()`
