# 🧪 Garden API - Test Cases for Swagger

## Base URL
```
http://localhost:5262
```

---

## 📝 Test Flow

### Step 1: Register & Login to get Access Token

**POST /api/auth/register**
```json
{
  "email": "farmer1@test.com",
  "password": "Test@123",
  "fullName": "Nguyễn Văn A",
  "roleId": 4
}
```

**POST /api/auth/verify-otp**
```json
{
  "email": "farmer1@test.com",
  "otp": "123456"
}
```

**Copy the `accessToken` from response and use it in Authorization header:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## ✅ Test Case 1: CREATE GARDEN - Valid data

**POST /api/gardens**

```json
{
  "name": "Vườn Nhãn Lồng Hưng Yên",
  "location": "123 Đường Nguyễn Văn Linh, Xã Minh Tân, Huyện Kim Động, Tỉnh Hưng Yên"
}
```

**Expected Result:**
- Status: `201 Created`
- Response:
```json
{
  "success": true,
  "message": "Tạo vườn thành công!",
  "data": {
    "gardenId": 1,
    "userId": 1,
    "ownerName": "Nguyễn Văn A",
    "name": "Vườn Nhãn Lồng Hưng Yên",
    "location": "123 Đường Nguyễn Văn Linh, Xã Minh Tân, Huyện Kim Động, Tỉnh Hưng Yên",
    "createdAt": "2025-11-04T10:30:00",
    "isOwner": true,
    "statistics": {
      "totalTrees": 0,
      "healthyTrees": 0,
      "treesNeedingAttention": 0,
      "totalStaff": 1
    }
  }
}
```

---

## ✅ Test Case 2: CREATE GARDEN - Without location

**POST /api/gardens**

```json
{
  "name": "Vườn Xoài Cát Hòa Lộc"
}
```

**Expected Result:**
- Status: `201 Created`
- Location field will be `null`

---

## ❌ Test Case 3: CREATE GARDEN - Name too short (< 3 chars)

**POST /api/gardens**

```json
{
  "name": "AB",
  "location": "Test"
}
```

**Expected Result:**
- Status: `400 Bad Request`
- Error: "Garden name must be between 3 and 100 characters"

---

## ❌ Test Case 4: CREATE GARDEN - Name too long (> 100 chars)

**POST /api/gardens**

```json
{
  "name": "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation",
  "location": "Test"
}
```

**Expected Result:**
- Status: `400 Bad Request`
- Error: "Garden name must be between 3 and 100 characters"

---

## ❌ Test Case 5: CREATE GARDEN - Missing required field (name)

**POST /api/gardens**

```json
{
  "location": "Test Location Only"
}
```

**Expected Result:**
- Status: `400 Bad Request`
- Error: "Garden name is required"

---

## ❌ Test Case 6: CREATE GARDEN - No authentication

**POST /api/gardens** (WITHOUT Authorization header)

```json
{
  "name": "Test Garden",
  "location": "Test"
}
```

**Expected Result:**
- Status: `401 Unauthorized`

---

## ❌ Test Case 7: CREATE GARDEN - Staff role trying to create (403)

**Register as Staff (RoleId = 3):**

```json
{
  "email": "staff1@test.com",
  "password": "Test@123",
  "fullName": "Staff User",
  "roleId": 3
}
```

**Then try to create garden:**

**POST /api/gardens** (with Staff token)

```json
{
  "name": "Staff Garden",
  "location": "Should fail"
}
```

**Expected Result:**
- Status: `403 Forbidden`
- Error: "Chỉ Farmer mới được tạo vườn."

---

## ✅ Test Case 8: GET GARDENS LIST - Default pagination

**GET /api/gardens**

**Expected Result:**
- Status: `200 OK`
- Response:
```json
{
  "success": true,
  "data": {
    "gardens": [
      {
        "gardenId": 1,
        "name": "Vườn Nhãn Lồng Hưng Yên",
        "location": "123 Đường Nguyễn Văn Linh...",
        "createdAt": "2025-11-04T10:30:00",
        "totalTrees": 0,
        "isOwner": true
      }
    ],
    "totalCount": 1,
    "pageNumber": 1,
    "pageSize": 10,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}
```

---

## ✅ Test Case 9: GET GARDENS LIST - With search

**GET /api/gardens?searchTerm=nhãn**

**Expected Result:**
- Status: `200 OK`
- Only gardens with "nhãn" in name will be returned

---

## ✅ Test Case 10: GET GARDENS LIST - With pagination

**GET /api/gardens?pageNumber=1&pageSize=5**

**Expected Result:**
- Status: `200 OK`
- Maximum 5 gardens per page

---

## ✅ Test Case 11: GET GARDEN DETAIL

**GET /api/gardens/1**

**Expected Result:**
- Status: `200 OK`
- Response includes full details + statistics

---

## ❌ Test Case 12: GET GARDEN DETAIL - Not found

**GET /api/gardens/99999**

**Expected Result:**
- Status: `404 Not Found`
- Error: "Không tìm thấy vườn với ID 99999."

---

## ✅ Test Case 13: UPDATE GARDEN - Change name and location

**PUT /api/gardens/1**

```json
{
  "name": "Vườn Nhãn Lồng Hưng Yên (Đã cập nhật)",
  "location": "456 Đường Lê Lợi, Hưng Yên (Địa chỉ mới)"
}
```

**Expected Result:**
- Status: `200 OK`
- Garden updated successfully

---

## ✅ Test Case 14: UPDATE GARDEN - Only name

**PUT /api/gardens/1**

```json
{
  "name": "Vườn Nhãn Lồng Premium"
}
```

**Expected Result:**
- Status: `200 OK`
- Only name updated, location unchanged

---

## ✅ Test Case 15: UPDATE GARDEN - Clear location

**PUT /api/gardens/1**

```json
{
  "location": ""
}
```

**Expected Result:**
- Status: `200 OK`
- Location set to null

---

## ❌ Test Case 16: UPDATE GARDEN - Not owner

**Create another Farmer account and try to update garden of first user:**

**PUT /api/gardens/1** (with different user's token)

```json
{
  "name": "Hacker's Garden"
}
```

**Expected Result:**
- Status: `403 Forbidden`
- Error: "Chỉ chủ vườn mới có quyền cập nhật thông tin."

---

## 📊 Summary

| Test Case | Method | Endpoint | Expected Status | Description |
|-----------|--------|----------|-----------------|-------------|
| TC1 | POST | /api/gardens | 201 | Create valid garden |
| TC2 | POST | /api/gardens | 201 | Create without location |
| TC3 | POST | /api/gardens | 400 | Name too short |
| TC4 | POST | /api/gardens | 400 | Name too long |
| TC5 | POST | /api/gardens | 400 | Missing name |
| TC6 | POST | /api/gardens | 401 | No auth token |
| TC7 | POST | /api/gardens | 403 | Staff role (not Farmer) |
| TC8 | GET | /api/gardens | 200 | Get list default |
| TC9 | GET | /api/gardens?searchTerm=x | 200 | Get list with search |
| TC10 | GET | /api/gardens?pageNumber=1&pageSize=5 | 200 | Get list with pagination |
| TC11 | GET | /api/gardens/1 | 200 | Get detail by ID |
| TC12 | GET | /api/gardens/99999 | 404 | Garden not found |
| TC13 | PUT | /api/gardens/1 | 200 | Update name + location |
| TC14 | PUT | /api/gardens/1 | 200 | Update name only |
| TC15 | PUT | /api/gardens/1 | 200 | Clear location |
| TC16 | PUT | /api/gardens/1 | 403 | Update by non-owner |

---

## 🚀 How to Test in Swagger

1. Run backend: `dotnet run --project MamMoi.Api`
2. Open Swagger UI: `http://localhost:5262/swagger`
3. Register user → Verify OTP → Get access token
4. Click "Authorize" button in Swagger UI
5. Enter: `Bearer YOUR_ACCESS_TOKEN`
6. Copy-paste JSON from above test cases
7. Click "Execute" and verify responses

---

## ✅ All tests should pass if:
- Garden CRUD works correctly
- Validation works (name 3-100 chars, required fields)
- Authorization works (only Farmer can create, only Owner can update)
- Pagination and search work
- Statistics are calculated correctly
