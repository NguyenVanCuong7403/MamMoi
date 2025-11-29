/**
 * Maps notification type and user role to the appropriate route
 * @param {Object} notification - The notification object
 * @param {string} notification.notificationType - Type of notification (e.g., 'SupportRequest', 'Report', 'TaskExpiration')
 * @param {string} notification.relatedEntityType - Type of related entity (e.g., 'Report', 'SupportRequest', 'Task', 'Tree')
 * @param {number} notification.relatedEntityId - ID of the related entity
 * @param {number} notification.treeId - ID of the tree (if notification is related to a tree)
 * @param {string} notification.actionUrl - Optional action URL from notification
 * @param {Object} user - The current user object
 * @param {string} user.role - User's role (e.g., 'SystemAdmin', 'BusinessAdmin', 'User')
 * @returns {string|null} The route path or null if no route found
 */
export function getNotificationRoute(notification, user) {
  const {
    notificationType,
    relatedEntityType,
    relatedEntityId,
    actionUrl,
    treeId,
  } = notification || {};
  const userRole = user?.role?.toLowerCase() || "";

  // Nếu có actionUrl từ notification, ưu tiên sử dụng nó
  if (actionUrl) {
    return actionUrl;
  }

  // Map dựa trên notificationType hoặc relatedEntityType
  const entityType = (
    relatedEntityType ||
    notificationType ||
    ""
  ).toLowerCase();

  // ===== REPORT & SUPPORT REQUEST =====
  // Admin có thông báo về report → chuyển đến màn quản lý report của admin
  if (entityType === "report" || entityType === "supportrequest") {
    if (userRole === "systemadmin") {
      return "/admin/reports";
    }
    if (userRole === "businessadmin") {
      return "/admin/business/reports";
    }
    // User route
    return "/reports";
  }

  // ===== TASK & TASK EXPIRATION =====
  // Thông báo về task/nhiệm vụ
  if (
    entityType === "task" ||
    entityType === "taskexpiration" ||
    entityType === "taskreminder" ||
    notificationType?.toLowerCase() === "taskexpiration"
  ) {
    // BusinessAdmin có thông báo về task → chuyển đến màn quản lý task
    if (userRole === "businessadmin") {
      return "/admin/business/tasks";
    }
    // User có thông báo về task → chuyển đến chi tiết cây (nếu có treeId) hoặc danh sách cây
    if (treeId || relatedEntityId) {
      return `/tree_detail/${treeId || relatedEntityId}`;
    }
    return "/tree";
  }

  // ===== TREE =====
  // Thông báo về cây → chuyển đến chi tiết cây
  if (entityType === "tree") {
    if (relatedEntityId || treeId) {
      return `/tree_detail/${relatedEntityId || treeId}`;
    }
    return "/tree";
  }

  // ===== GARDEN =====
  // Thông báo về vườn → chuyển đến chi tiết vườn
  if (entityType === "garden") {
    if (relatedEntityId) {
      return `/garden/${relatedEntityId}`;
    }
    return "/garden";
  }

  // ===== PAYMENT & SUBSCRIPTION =====
  // Thông báo về thanh toán/đăng ký
  if (entityType === "payment" || entityType === "subscription") {
    return "/paymenthistory";
  }

  // ===== PROMOTION =====
  // Thông báo khuyến mãi
  if (entityType === "promotion") {
    return "/price";
  }

  // ===== USER MANAGEMENT (for SystemAdmin) =====
  // Thông báo về quản lý người dùng
  if (entityType === "user" || entityType === "usermanagement") {
    if (userRole === "systemadmin") {
      return "/admin/users";
    }
  }

  // ===== REVENUE (for SystemAdmin) =====
  // Thông báo về doanh thu
  if (entityType === "revenue") {
    if (userRole === "systemadmin") {
      return "/admin/revenue";
    }
  }

  // ===== SUBSCRIPTION MANAGEMENT (for SystemAdmin) =====
  // Thông báo về quản lý đăng ký
  if (entityType === "subscriptionmanagement") {
    if (userRole === "systemadmin") {
      return "/admin/subscriptions";
    }
  }

  // ===== DEFAULT =====
  // Mặc định trả về trang notifications
  return "/notifications";
}

/**
 * Normalize role name for comparison
 * @param {string} role - Role name
 * @returns {string} Normalized role name
 */
export function normalizeRole(role) {
  if (!role) return "";
  return role.toString().toLowerCase().trim();
}
