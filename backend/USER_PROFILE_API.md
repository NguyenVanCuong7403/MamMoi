# User Profile API Documentation

## Overview
API endpoints for managing user profiles with full validation, including viewing profile information, editing profile details, and uploading profile avatars with image cropping capabilities.

## Endpoints

### 1. View User Profile
**GET** `/api/UserProfile/{userId}`

Display all user information including profile details, preferences, and avatar.

#### Parameters
- `userId` (int, path) - The unique identifier of the user

#### Response (200 OK)
```json
{
  "userId": 1,
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, Country",
  "profileImageUrl": "/uploads/avatars/1_abc123.jpg",
  "experienceLevel": "Intermediate",
  "preferredLanguage": "en",
  "notificationPreferences": "email,push",
  "isActive": true,
  "lastLoginAt": "2025-11-02T10:30:00Z",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-11-02T10:30:00Z",
  "roleName": "User"
}
```

#### Response (404 Not Found)
```json
{
  "message": "User not found"
}
```

---

### 2. Edit User Profile
**PUT** `/api/UserProfile/{userId}`

Update user profile with full validation.

#### Parameters
- `userId` (int, path) - The unique identifier of the user

#### Request Body
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, Country",
  "experienceLevel": "Advanced",
  "preferredLanguage": "en",
  "notificationPreferences": "email,push,sms"
}
```

#### Validation Rules
- **fullName**: Required, 2-100 characters
- **email**: Required, valid email format, max 100 characters
- **phone**: Optional, valid phone format, max 20 characters
- **address**: Optional, max 200 characters
- **experienceLevel**: Optional, must be one of: `Beginner`, `Intermediate`, `Advanced`, `Expert`
- **preferredLanguage**: Optional, must be one of: `en`, `vi`, `fr`, `es`, `de`
- **notificationPreferences**: Optional, max 500 characters

#### Response (200 OK)
Returns the updated user profile (same format as GET endpoint)

#### Response (400 Bad Request)
```json
{
  "message": "Validation failed",
  "errors": [
    "Full name is required",
    "Invalid email format"
  ]
}
```

#### Response (404 Not Found)
```json
{
  "message": "User not found"
}
```

---

### 3. Upload Profile Avatar
**POST** `/api/UserProfile/{userId}/avatar`

Upload and crop user profile avatar with image processing.

#### Parameters
- `userId` (int, path) - The unique identifier of the user
- `image` (IFormFile, form-data) - **Required** - The image file to upload
- `cropX` (int, form-data) - Crop X position as percentage (0-100), default: 0
- `cropY` (int, form-data) - Crop Y position as percentage (0-100), default: 0
- `cropWidth` (int, form-data) - Crop width as percentage (10-100), default: 100
- `cropHeight` (int, form-data) - Crop height as percentage (10-100), default: 100

#### Constraints
- **Maximum file size**: 5MB
- **Allowed formats**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`
- **Output size**: 400x400 pixels (automatically resized)
- **Output format**: JPEG with 85% quality

#### Request (multipart/form-data)
```
image: [binary file]
cropX: 10
cropY: 10
cropWidth: 80
cropHeight: 80
```

#### Response (200 OK)
```json
{
  "success": true,
  "imageUrl": "/uploads/avatars/1_abc123.jpg",
  "message": "Avatar uploaded successfully"
}
```

#### Response (400 Bad Request)
```json
{
  "success": false,
  "message": "File size exceeds maximum allowed size of 5MB"
}
```

---

### 4. Delete User Avatar
**DELETE** `/api/UserProfile/{userId}/avatar`

Remove the user's profile avatar.

#### Parameters
- `userId` (int, path) - The unique identifier of the user

#### Response (200 OK)
```json
{
  "message": "Avatar deleted successfully"
}
```

#### Response (404 Not Found)
```json
{
  "message": "User or avatar not found"
}
```

---

## Image Cropping

The avatar upload endpoint supports percentage-based cropping:

1. **cropX** and **cropY**: Starting position of the crop area (0-100%)
2. **cropWidth** and **cropHeight**: Size of the crop area (10-100%)

### Example Crop Values:
- **Center crop**: `cropX=25, cropY=25, cropWidth=50, cropHeight=50`
- **Top-left quadrant**: `cropX=0, cropY=0, cropWidth=50, cropHeight=50`
- **Full image**: `cropX=0, cropY=0, cropWidth=100, cropHeight=100` (default)

The cropped image is then resized to 400x400 pixels and saved as JPEG.

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- **200 OK**: Successful operation
- **400 Bad Request**: Validation error or invalid input
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## Setup Requirements

### 1. Database
Ensure the `Users` table exists with the following columns:
- UserId (int, primary key)
- FullName (string)
- Email (string)
- Phone (string, nullable)
- Address (string, nullable)
- ProfileImageUrl (string, nullable)
- ExperienceLevel (string, nullable)
- PreferredLanguage (string, nullable)
- NotificationPreferences (string, nullable)
- IsActive (bool)
- LastLoginAt (datetime, nullable)
- CreatedAt (datetime)
- UpdatedAt (datetime, nullable)
- RoleId (int, foreign key)

### 2. File System
The API will automatically create the following directory structure:
```
wwwroot/
  uploads/
    avatars/
```

### 3. NuGet Packages
The following packages are required:
- `SixLabors.ImageSharp` (3.1.6 or higher)
- `Microsoft.EntityFrameworkCore` (8.0.11)
- `Microsoft.AspNetCore.Authentication.JwtBearer` (8.0.11)

### 4. Configuration
Ensure `appsettings.json` has the database connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=CapstoneDB01;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

---

## Testing with Swagger

1. Run the application
2. Navigate to `/swagger`
3. Test the endpoints:
   - Use GET to view a user profile
   - Use PUT to update profile information
   - Use POST with multipart/form-data to upload an avatar
   - Use DELETE to remove an avatar

---

## Example Usage (C# Client)

```csharp
// Get user profile
var response = await httpClient.GetAsync($"/api/UserProfile/{userId}");
var profile = await response.Content.ReadFromJsonAsync<UserProfileDto>();

// Update user profile
var updateDto = new EditUserProfileDto 
{
    FullName = "Jane Doe",
    Email = "jane.doe@example.com",
    ExperienceLevel = "Advanced"
};
await httpClient.PutAsJsonAsync($"/api/UserProfile/{userId}", updateDto);

// Upload avatar
using var content = new MultipartFormDataContent();
var fileContent = new StreamContent(File.OpenRead("avatar.jpg"));
fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
content.Add(fileContent, "image", "avatar.jpg");
content.Add(new StringContent("10"), "cropX");
content.Add(new StringContent("10"), "cropY");
content.Add(new StringContent("80"), "cropWidth");
content.Add(new StringContent("80"), "cropHeight");
await httpClient.PostAsync($"/api/UserProfile/{userId}/avatar", content);
```

---

## Security Notes

⚠️ **Important**: The current implementation uses SixLabors.ImageSharp 3.1.6, which has known security vulnerabilities. For production use, consider:
1. Upgrading to the latest patched version when available
2. Implementing additional image validation
3. Running image processing in a sandboxed environment
4. Adding authentication/authorization to all endpoints
5. Implementing rate limiting for upload endpoints

---

## Future Enhancements

- [ ] Add authentication/authorization
- [ ] Implement image format conversion
- [ ] Add support for multiple avatar sizes
- [ ] Implement avatar history/versioning
- [ ] Add batch profile updates
- [ ] Implement profile picture moderation
