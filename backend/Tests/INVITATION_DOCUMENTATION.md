# Module 9: Staff Management - Invitation System

## Tổng quan
Module này cho phép Farmer mời Staff vào vườn của mình. Staff nhận email với token, sau đó có thể accept hoặc decline lời mời.

## Database Schema Changes
Đã thêm các cột vào bảng `GardenMembers`:
- **Status** (NVARCHAR(20), NOT NULL, DEFAULT 'Active'): Trạng thái member (Active/Pending/Declined)
- **InvitationToken** (NVARCHAR(100), NULL, UNIQUE): Token bảo mật để accept invitation
- **InvitedByUserId** (INT, NULL, FK → Users): User ID của người mời
- **InvitedAt** (DATETIME, NULL): Thời điểm mời
- **TokenExpiresAt** (DATETIME, NULL): Thời điểm token hết hạn (7 ngày)

Đã sửa nullable:
- **UserId**: Nullable (NULL khi Status = Pending)
- **JoinedAt**: Nullable (NULL cho đến khi accept)

## Business Logic

### 1. Mời Staff (Invite)
**Endpoint**: `POST /api/gardens/{id}/invite`  
**Auth**: Farmer (owner of garden)

**Flow**:
1. Validate garden exists và inviter là owner
2. Check invitee email exists và là Staff role (RoleId = 4)
3. Check duplicate: không được mời user đã là member hoặc đã có pending invitation
4. Generate secure token (32 bytes, Base64, URL-safe)
5. Create GardenMember record với Status = "Pending", UserId = NULL
6. Send email với invitation link
7. Token hết hạn sau 7 ngày

**Request**:
```json
{
  "inviteeEmail": "staff@example.com",
  "roleId": 4
}
```

**Response**:
```json
{
  "memberId": 123,
  "gardenId": 1,
  "gardenName": "Vườn Cam Vinh",
  "inviteeEmail": "staff@example.com",
  "status": "Pending",
  "invitedAt": "2025-11-04T10:30:00",
  "tokenExpiresAt": "2025-11-11T10:30:00",
  "message": "Invitation sent successfully"
}
```

### 2. Accept Invitation
**Endpoint**: `POST /api/invitations/accept`  
**Auth**: Staff (authenticated)

**Flow**:
1. Find invitation by token
2. Validate token chưa hết hạn
3. Validate user là Staff role
4. Update GardenMember: UserId = current user, Status = "Active", JoinedAt = now, clear token
5. Return member details

**Request**:
```json
{
  "token": "abc123xyz..."
}
```

**Response**:
```json
{
  "memberId": 123,
  "gardenId": 1,
  "gardenName": "Vườn Cam Vinh",
  "userId": 456,
  "email": "staff@example.com",
  "fullName": "Nguyễn Văn A",
  "roleId": 4,
  "roleName": "Staff",
  "status": "Active",
  "joinedAt": "2025-11-04T14:20:00",
  "invitedAt": "2025-11-04T10:30:00",
  "invitedByUserId": 789,
  "invitedByName": "Farmer Nguyễn"
}
```

### 3. Decline Invitation
**Endpoint**: `POST /api/invitations/decline`  
**Auth**: Staff (authenticated)

**Flow**:
1. Find invitation by token
2. Validate token chưa hết hạn
3. Update Status = "Declined", clear token
4. Optional: Log reason

**Request**:
```json
{
  "token": "abc123xyz...",
  "reason": "I'm busy with other gardens"
}
```

**Response**:
```json
{
  "message": "Invitation declined successfully"
}
```

### 4. Get Garden Members
**Endpoint**: `GET /api/gardens/{id}/members`  
**Auth**: Any authenticated user

**Response**: Danh sách tất cả members (Active + Pending)
```json
[
  {
    "memberId": 123,
    "gardenId": 1,
    "gardenName": "Vườn Cam Vinh",
    "userId": 456,
    "email": "staff@example.com",
    "fullName": "Nguyễn Văn A",
    "roleId": 4,
    "roleName": "Staff",
    "status": "Active",
    "joinedAt": "2025-11-04T14:20:00"
  },
  {
    "memberId": 124,
    "gardenId": 1,
    "gardenName": "Vườn Cam Vinh",
    "userId": null,
    "email": "Pending",
    "fullName": null,
    "roleId": 4,
    "roleName": "Staff",
    "status": "Pending",
    "joinedAt": null,
    "invitedAt": "2025-11-04T10:30:00"
  }
]
```

### 5. Get Pending Invitations
**Endpoint**: `GET /api/gardens/{id}/pending-invitations`  
**Auth**: Any authenticated user

**Response**: Chỉ invitations đang Pending

### 6. Cancel Invitation
**Endpoint**: `DELETE /api/gardens/{gardenId}/invitations/{memberId}`  
**Auth**: Farmer (owner)

**Flow**:
1. Validate inviter là owner
2. Find pending invitation
3. Delete GardenMember record
4. Token tự động invalid

## Security

### Token Generation
```csharp
var randomBytes = new byte[32];
using (var rng = RandomNumberGenerator.Create())
{
    rng.GetBytes(randomBytes);
}
return Convert.ToBase64String(randomBytes)
    .Replace("+", "-")
    .Replace("/", "_")
    .Replace("=", "");
```

- **32 bytes** = 256 bits entropy
- **Base64 URL-safe** encoding
- **Single-use**: Token cleared sau khi accept/decline
- **Expiration**: 7 ngày

### Authorization
- **Invite**: Chỉ owner của garden
- **Accept/Decline**: Chỉ Staff role
- **Cancel**: Chỉ owner của garden
- **View members**: Authenticated users (có thể thêm check owner/member sau)

## Email Template
```html
<h2>Garden Invitation</h2>
<p>Hello {staffName},</p>
<p>{farmerName} has invited you to join <strong>{gardenName}</strong> as a Staff member.</p>
<p><a href="https://yourdomain.com/accept-invitation?token={token}">Click here to accept</a></p>
<p>This invitation expires on {expiryDate}</p>
```

## Error Handling

| HTTP Code | Scenario |
|-----------|----------|
| 400 Bad Request | Validation failed, duplicate invitation, token expired |
| 401 Unauthorized | Invalid JWT token |
| 403 Forbidden | User is not garden owner |
| 404 Not Found | Garden not found, user not found, invitation not found |

## Test Cases

### Happy Path
1. ✅ Farmer invites Staff → Email sent, Status = Pending
2. ✅ Staff accepts → Status = Active, UserId set, JoinedAt set
3. ✅ Staff declines → Status = Declined
4. ✅ Farmer cancels pending invitation → Record deleted

### Edge Cases
1. ✅ Invite user already member → 400 "already a member"
2. ✅ Invite user with existing pending → 400 "pending invitation exists"
3. ✅ Accept expired token → 400 "token expired"
4. ✅ Accept invalid token → 404 "not found"
5. ✅ Non-owner invites → 403 Forbidden
6. ✅ Non-Staff user accepts → 401 "only Staff can accept"

### Validation
1. ✅ Invalid email format → 400 validation error
2. ✅ Empty token → 400 validation error
3. ✅ RoleId not 4 → 400 validation error

## Performance Considerations

### Indexes Created
```sql
-- Unique constraint on token (fast lookup)
CREATE UNIQUE INDEX UQ_GardenMembers_Token 
ON GardenMembers(InvitationToken) 
WHERE InvitationToken IS NOT NULL;

-- Index on Status (filter Pending/Active)
CREATE INDEX IX_GardenMembers_Status 
ON GardenMembers(Status);

-- Composite index (query by garden + status)
CREATE INDEX IX_GardenMembers_Garden_Status 
ON GardenMembers(GardenId, Status);

-- Partial unique index (only active members)
CREATE UNIQUE INDEX UX_GardenMembers_Garden_User 
ON GardenMembers(GardenId, UserId)
WHERE UserId IS NOT NULL;
```

## Future Enhancements
- [ ] Resend invitation email
- [ ] Bulk invite (CSV import)
- [ ] Invitation history/audit log
- [ ] Custom role assignments (not just Staff)
- [ ] Invitation reminders (email after 3 days)
- [ ] Public accept link (no login required)
- [ ] QR code invitations

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/gardens/{id}/invite` | Farmer (owner) | Mời Staff vào vườn |
| POST | `/api/invitations/accept` | Staff | Accept invitation |
| POST | `/api/invitations/decline` | Staff | Decline invitation |
| GET | `/api/gardens/{id}/members` | Authenticated | Danh sách members |
| GET | `/api/gardens/{id}/pending-invitations` | Authenticated | Danh sách pending |
| DELETE | `/api/gardens/{id}/invitations/{memberId}` | Farmer (owner) | Cancel invitation |

## Dependencies
- **MamMoi.Application.DTOs.Invitation**: DTOs (5 files)
- **MamMoi.Application.Interfaces.IInvitationService**: Service interface
- **MamMoi.Infrastructure.Services.InvitationService**: Business logic
- **MamMoi.Infrastructure.Services.Auth.EmailService**: Email sending
- **MamMoi.Api.Controllers.InvitationsController**: Accept/Decline APIs
- **MamMoi.Api.Controllers.GardensController**: Invite/Members APIs

---
**Status**: ✅ Implementation Complete  
**Last Updated**: 2025-11-04  
**Next Module**: Module 8 - Tree Management
