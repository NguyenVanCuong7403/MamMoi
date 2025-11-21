# Frontend API Integration - Tree & Tree Variety Management

## 🚀 Quick Start

### Import các functions tiện ích:

```javascript
import {
  // Tree operations
  addTree,
  updateTree,
  deleteTree,

  // Tree Variety operations (Business Admin)
  addTreeVariety,
  updateTreeVariety,
  deleteTreeVariety,
  getAllTreeVarieties,
  getTreeVarietiesByTreeType
} from '../API';
```

## 🌳 Tree Management (Cho Farmers/Users)

### Thêm cây mới:
```javascript
const result = await addTree({
  gardenId: 1,                    // Required
  treeTypeId: 1,                  // Required
  varietyId: 5,                   // Optional
  treeName: "My Apple Tree",      // Required
  description: "Planted in backyard", // Optional
  plantDate: "2025-11-21T00:00:00Z" // Optional
});

if (result.success) {
  console.log("✅ Tree added:", result.data);
} else {
  console.error("❌ Error:", result.error);
}
```

### Cập nhật cây:
```javascript
const result = await updateTree(treeId, {
  treeName: "Updated Name",
  description: "Updated description"
});
```

### Xóa cây:
```javascript
const result = await deleteTree(treeId);
```

## 🌱 Tree Variety Management (Cho Business Admin)

### Thêm giống cây mới:
```javascript
const result = await addTreeVariety({
  treeTypeId: 1,                    // Required
  varietyName: "Golden Apple",      // Required
  varietyDescription: "Sweet variety" // Optional
});

if (result.success) {
  console.log("✅ Variety added:", result.data);
} else {
  console.error("❌ Error:", result.error);
}
```

### Lấy tất cả giống cây:
```javascript
const result = await getAllTreeVarieties();
if (result.success) {
  console.log("All varieties:", result.data);
}
```

### Lấy giống cây theo loại:
```javascript
const result = await getTreeVarietiesByTreeType(treeTypeId);
```

### Cập nhật giống cây:
```javascript
const result = await updateTreeVariety(varietyId, {
  treeTypeId: 1,
  varietyName: "Updated Name",
  varietyDescription: "Updated description"
});
```

### Xóa giống cây:
```javascript
const result = await deleteTreeVariety(varietyId);
```

## 📋 Return Format

Tất cả functions đều return object với format:
```javascript
{
  success: true/false,
  data: {...},        // Chỉ có khi success = true
  message: "string",  // Thông báo thành công
  error: "string",    // Chỉ có khi success = false
  details: {...}      // Chi tiết lỗi gốc
}
```

## 🔧 Advanced Usage

### Sử dụng với React Context:
```javascript
import { useBusinessAdmin } from '../API/context/BusinessAdminContext';

function MyComponent() {
  const {
    treeVarieties,
    loading,
    createTreeVariety,
    updateTreeVariety,
    deleteTreeVariety
  } = useBusinessAdmin();

  // Component logic here
}
```

### Sử dụng trực tiếp Repository:
```javascript
import { TreeVarietyRepository } from '../API';

const response = await TreeVarietyRepository.getAllTreeVarieties();
// response.data chứa array of tree varieties
```

## 📁 File Structure

```
src/API/
├── ApiClient.js              # Base API client
├── QuickActions.js           # Convenient functions ⭐
├── QuickActionsExample.js    # Usage examples ⭐
├── index.js                  # Main exports
├── models/
│   ├── Tree.js
│   └── TreeVariety.js        # Tree variety model ⭐
├── repositories/
│   ├── TreeRepository.js
│   └── TreeVarietyRepository.js # Tree variety API calls ⭐
└── context/
    ├── AuthContext.jsx
    └── BusinessAdminContext.jsx # Business admin context ⭐
```

## 🎯 API Endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Get all varieties | GET | `/api/business-admin/tree-varieties` |
| Get variety by ID | GET | `/api/business-admin/tree-varieties/{id}` |
| Get varieties by type | GET | `/api/business-admin/tree-varieties/tree-type/{treeTypeId}` |
| Create variety | POST | `/api/business-admin/tree-varieties` |
| Update variety | PUT | `/api/business-admin/tree-varieties/{id}` |
| Delete variety | DELETE | `/api/business-admin/tree-varieties/{id}` |
| Create tree | POST | `/api/trees` |
| Update tree | PUT | `/api/trees/{id}` |
| Delete tree | DELETE | `/api/trees/{id}` |

## 🔐 Authentication

- Tree operations: Cần JWT token (Farmers/Users)
- Tree Variety operations: Cần JWT token với role "Business Admin"

Token được tự động thêm vào headers bởi `ApiClient`.