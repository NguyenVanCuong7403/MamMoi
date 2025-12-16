/**
 * Maps notification type and user role to the appropriate route
 * @param {Object} notification - The notification object
 * @param {string} notification.notificationType - Type of notification (e.g., 'SupportRequest', 'Report', 'TaskExpiration')
 * @param {string} notification.relatedEntityType - Type of related entity (e.g., 'Report', 'SupportRequest', 'Task', 'Tree', 'CareSchedule')
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

  // Nếu có actionUrl từ notification, xử lý nó
  if (actionUrl) {
    // Nếu actionUrl là relative path (bắt đầu với /), xử lý đặc biệt
    if (actionUrl.startsWith("/")) {
      // Nếu là /tasks/{id} và có treeId, redirect đến tree detail
      if (actionUrl.startsWith("/tasks/") && treeId) {
        return `/tree_detail/${treeId}`;
      }
      // Nếu là /support-requests/{id}, sử dụng trực tiếp
      if (actionUrl.startsWith("/support-requests/")) {
        return actionUrl;
      }
      // Các routes khác sử dụng trực tiếp
      return actionUrl;
    }
    // Nếu là absolute URL, không xử lý (hoặc có thể redirect đến external URL)
    // Tạm thời bỏ qua absolute URLs
  }

  // Map dựa trên notificationType hoặc relatedEntityType
  const entityType = (
    relatedEntityType ||
    notificationType ||
    ""
  ).toLowerCase();
  const notifType = (notificationType || "").toLowerCase();

  // ===== REPORT & SUPPORT REQUEST =====
  // Admin có thông báo về report → chuyển đến màn quản lý report của admin
  if (
    entityType === "report" ||
    entityType === "supportrequest" ||
    notifType === "supportrequest"
  ) {
    // Nếu là support request cụ thể (có relatedEntityId) thì ưu tiên dẫn tới trang chi tiết
    if (entityType === "supportrequest" || notifType === "supportrequest") {
      if (relatedEntityId) {
        if (userRole === "systemadmin")
          return `/admin/support-requests/${relatedEntityId}`;
        if (userRole === "businessadmin")
          return `/admin/business/support-requests/${relatedEntityId}`;
        return `/support-requests/${relatedEntityId}`;
      }
      // Nếu không có ID, fallback về list
      if (userRole === "systemadmin") return "/admin/reports";
      if (userRole === "businessadmin") return "/admin/business/reports";
      return "/reports";
    }

    // Trường hợp là report (không phải support request)
    if (userRole === "systemadmin") {
      return "/admin/reports";
    }
    if (userRole === "businessadmin") {
      return "/admin/business/reports";
    }
    // User route - luôn đi đến trang danh sách reports (/reports)
    // User có thể xem chi tiết từ trang danh sách nếu cần
    return "/reports";
  }

  // ===== TASK & TASK EXPIRATION & CARE SCHEDULE =====
  // Thông báo về task/nhiệm vụ
  if (
    entityType === "task" ||
    entityType === "taskexpiration" ||
    entityType === "taskreminder" ||
    entityType === "careschedule" ||
    notifType === "taskexpiration"
  ) {
    // BusinessAdmin có thông báo về task → chuyển đến màn quản lý task
    if (userRole === "businessadmin") {
      return "/admin/business/tasks";
    }
    // User có thông báo về task → chuyển đến chi tiết cây (nếu có treeId) hoặc danh sách cây
    // Ưu tiên treeId từ notification, sau đó relatedEntityId nếu là tree
    if (treeId) {
      return `/tree_detail/${treeId}`;
    }
    // Nếu có relatedEntityId và không phải tree, có thể là task ID - nhưng vì không có trang task detail,
    // nên vẫn redirect về tree detail nếu có thể, hoặc tree list
    if (relatedEntityId && entityType === "careschedule") {
      // Với CareSchedule, cần lấy treeId từ task, nhưng vì không có API call ở đây,
      // nên redirect về tree list hoặc cố gắng dùng treeId nếu có
      // Tạm thời redirect về tree list
      return "/tree";
    }
    return "/tree";
  }

  // ===== TREE =====
  // Thông báo về cây → chuyển đến chi tiết cây
  if (entityType === "tree" || notifType === "tree") {
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
  if (
    entityType === "payment" ||
    entityType === "subscription" ||
    notifType === "payment"
  ) {
    return "/paymenthistory";
  }

  // ===== PROMOTION =====
  // Thông báo khuyến mãi
  if (entityType === "promotion" || notifType === "promotion") {
    return "/price";
  }

  // ===== BROADCAST & ANNOUNCEMENT & SYSTEM =====
  // Thông báo chung, thông báo hệ thống
  if (
    notifType === "broadcast" ||
    notifType === "announcement" ||
    notifType === "system"
  ) {
    // Nếu là SystemAdmin, đưa tới màn quản lý thông báo của admin
    if (userRole === "systemadmin") {
      if (actionUrl && actionUrl.startsWith("/")) return actionUrl;
      return "/admin/notifications";
    }
    // Các role khác: nếu có actionUrl (relative), ưu tiên actionUrl, còn lại về trang notifications
    if (actionUrl && actionUrl.startsWith("/")) {
      return actionUrl;
    }
    return "/notifications";
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
