# Authentication Module - MamMoi Backend

## 📋 Tổng quan
Module xử lý đăng ký, đăng nhập, xác thực OTP cho hệ thống MamMoi.

**Developer:** Huy  
**Branch:** huylthe176445  
**Date:** 02/11/2025

---

## 🗂️ Cấu trúc Code

```
backend/
├── MamMoi.Application/
│   ├── DTOs/Auth/                    # Data Transfer Objects
│   │   ├── RegisterRequestDto.cs    # DTO đăng ký
│   │   ├── LoginRequestDto.cs       # DTO đăng nhập
│   │   ├── VerifyOtpRequestDto.cs   # DTO xác thực OTP
│   │   ├── ResendOtpRequestDto.cs   # DTO gửi lại OTP
│   │   └── AuthResponseDto.cs       # DTO response chung
│   │
│   └── Interfaces/Auth/              # Service Interfaces (sub-folder Auth)
│       ├── IAuthService.cs          # Interface Auth logic
│       └── IEmailService.cs         # Interface gửi email
│
├── MamMoi.Infrastructure/
│   └── Services/Auth/                # Service Implementations (sub-folder Auth)
│       ├── AuthService.cs           # Logic đăng ký, OTP, đăng nhập
│       └── EmailService.cs          # Logic gửi email qua SMTP
│
└── MamMoi.Api/
    └── Controllers/
        └── AuthController.cs        # API Endpoints
```

---

## ✅ Các Chức Năng Đã Hoàn Thành

### 1. **User Registration** ✅
- **Endpoint:** `POST /api/auth/register`
- **Mô tả:** Đăng ký user mới, gửi OTP qua email
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "123456",
  "fullName": "Nguyen Van A",
  "phone": "0123456789"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "isEmailVerified": false,
    "message": "Đăng ký thành công! Vui lòng kiểm tra email để nhận mã OTP."
  }
}
```

### 2. **Email OTP Verification** ✅
- **Endpoint:** `POST /api/auth/verify-otp`
- **Mô tả:** Xác thực OTP, trả về JWT tokens
- **Request Body:**
```json
{
  "email": "user@example.com",
  "otpCode": "123456"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "isEmailVerified": true,
    "accessToken": "eyJhbGci...",
    "refreshToken": "ZXlKaGJ...",
    "tokenExpiresAt": "2025-11-02T10:00:00Z",
    "message": "Xác thực thành công!"
  }
}
```

### 3. **Resend OTP** ✅
- **Endpoint:** `POST /api/auth/resend-otp`
- **Mô tả:** Gửi lại OTP mới
- **Request Body:**
```json
{
  "email": "user@example.com"
}
```

### 4. **Login with Email/Password** ✅
- **Endpoint:** `POST /api/auth/login`
- **Mô tả:** Đăng nhập, trả về JWT tokens
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```
- **Response:** Giống VerifyOtp

### 5. **Logout** ✅
- **Endpoint:** `POST /api/auth/logout`
- **Mô tả:** Đăng xuất, xóa refresh token
- **Headers:** `Authorization: Bearer {accessToken}`

### 6. **Get Current User** ✅
- **Endpoint:** `GET /api/auth/me`
- **Mô tả:** Lấy thông tin user hiện tại từ JWT token
- **Headers:** `Authorization: Bearer {accessToken}`

---

## ⚙️ Cấu hình

### 1. **appsettings.json** - Cấu hình Email SMTP
```json
{
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "FromEmail": "your-email@gmail.com",
    "FromName": "MamMoi Team",
    "Username": "your-email@gmail.com",
    "Password": "your-app-password"
  }
}
```

**⚠️ Lưu ý Gmail:**
- Phải bật **2-Step Verification**
- Tạo **App Password** tại: https://myaccount.google.com/apppasswords
- Không dùng mật khẩu Gmail thật

### 2. **Dependency Injection**
Đã tự động register trong `Infrastructure/DependencyInjection.cs`:
- `IAuthService` → `AuthService`
- `IEmailService` → `EmailService`
- `IMemoryCache` → Lưu OTP tạm (5 phút)

---

## 🔧 Cách Chạy & Test

### 1. **Chạy Backend**
```bash
cd backend/MamMoi.Api
dotnet run
```
Backend sẽ chạy tại: `https://localhost:7XXX`

### 2. **Truy cập Swagger**
Mở trình duyệt: `https://localhost:7XXX/swagger`

### 3. **Test Flow Đăng Ký**
1. **Register:** Gọi `POST /api/auth/register`
2. **Check Email:** Mở email nhận OTP (6 số)
3. **Verify OTP:** Gọi `POST /api/auth/verify-otp` với OTP
4. **Nhận Token:** Lưu `accessToken` và `refreshToken`
5. **Test Auth:** Gọi `GET /api/auth/me` với header `Authorization: Bearer {accessToken}`

### 4. **Test Flow Đăng Nhập**
1. **Login:** Gọi `POST /api/auth/login`
2. **Nhận Token:** Lưu tokens
3. **Test Auth:** Gọi các API cần authentication

---

## 🛡️ Security Notes

### **Password Hashing**
- Hiện tại dùng SHA256 (đơn giản cho development)
- **TODO:** Nâng cấp lên BCrypt hoặc Argon2 cho production

### **OTP Storage**
- Lưu trong **IMemoryCache** (RAM)
- Tự động xóa sau **5 phút**
- **Ưu điểm:** Nhanh, đơn giản, không lưu DB
- **Nhược điểm:** Mất OTP khi restart server (chấp nhận được vì OTP ngắn hạn)

### **JWT Tokens**
- **Access Token:** Expire sau 60 phút
- **Refresh Token:** Expire sau 7 ngày (lưu cache)
- **TODO:** Implement Refresh Token logic

---

## 📝 TODO - Các Chức Năng Tiếp Theo

- [ ] **Refresh Token** - Làm mới access token
- [ ] **Forgot Password** - Quên mật khẩu
- [ ] **Reset Password** - Đặt lại mật khẩu
- [ ] **Change Password** - Đổi mật khẩu
- [ ] **Login with Google** - OAuth Google (optional)
- [ ] **Login with Facebook** - OAuth Facebook (optional)

---

## 🐛 Troubleshooting

### **Lỗi: Email không gửi được**
- Kiểm tra `appsettings.json` có đúng config SMTP không
- Đảm bảo đã tạo App Password cho Gmail
- Check firewall/antivirus có block port 587 không

### **Lỗi: OTP hết hạn quá nhanh**
- OTP mặc định expire sau 5 phút
- Có thể tăng trong `AuthService.cs` line 73: `TimeSpan.FromMinutes(5)` → `TimeSpan.FromMinutes(10)`

### **Lỗi: JWT Token không hợp lệ**
- Kiểm tra `Jwt:Key` trong appsettings phải giống nhau
- Đảm bảo token chưa expire
- Kiểm tra header `Authorization: Bearer {token}` đúng format

---

## 📞 Liên Hệ

**Developer:** Huy (huylthe176445)  
**Team:** MamMoi Capstone Project  
**Branch:** `huylthe176445`

Nếu có vấn đề gì, liên hệ qua:
- GitHub Issues
- Team chat/group

---

## 🎯 Best Practices Cho Team

### **Khi Code Tiếp:**
1. ✅ **KHÔNG SỬA** các file Models trong `Infrastructure/Models/` (từ DB scaffold)
2. ✅ **TẠO DTO** cho mọi request/response
3. ✅ **ĐẶT INTERFACE** trong Application layer
4. ✅ **IMPLEMENT** trong Infrastructure layer
5. ✅ **CONTROLLER** chỉ gọi service, không có logic
6. ✅ **COMMENT** đầy đủ để team hiểu

### **Khi Commit:**
```bash
git add .
git commit -m "feat: implement user registration & OTP verification"
git push origin huylthe176445
```

### **Khi Merge:**
- Luôn pull code mới từ main trước khi code
- Test kỹ trước khi tạo Pull Request
- Tag reviewer trong PR

---

**Happy Coding! 🚀**
