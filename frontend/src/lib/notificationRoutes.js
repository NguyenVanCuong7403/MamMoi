/**
 * Maps notification type and user role to the appropriate route
 * @param {Object} notification - The notification object
 * @param {string} notification.notificationType - Type of notification (e.g., 'SupportRequest', 'Report')
 * @param {string} notification.relatedEntityType - Type of related entity (e.g., 'Report', 'SupportRequest')
 * @param {number} notification.relatedEntityId - ID of the related entity
 * @param {string} notification.actionUrl - Optional action URL from notification
 * @param {Object} user - The current user object
 * @param {string} user.role - User's role (e.g., 'SystemAdmin', 'BusinessAdmin', 'User')
 * @returns {string|null} The route path or null if no route found
 */
export function getNotificationRoute(notification, user) {
  const { notificationType, relatedEntityType, relatedEntityId, actionUrl } =
    notification || {};
  const userRole = user?.role?.toLowerCase() || "";

  // Nếu có actionUrl từ notification, ưu tiên sử dụng nó
  if (actionUrl) {
    return actionUrl;
  }

  // Map dựa trên notificationType hoặc relatedEntityType
  const entityType = relatedEntityType || notificationType;

  switch (entityType?.toLowerCase()) {
    case "report":
    case "supportrequest":
      // Admin routes
      if (userRole === "systemadmin") {
        return "/admin/reports";
      }
      if (userRole === "businessadmin") {
        return "/admin/business/reports";
      }
      // User route
      return "/reports";

    case "tree":
      // Navigate to tree detail if we have treeId
      if (relatedEntityId || notification.treeId) {
        return `/tree_detail/${relatedEntityId || notification.treeId}`;
      }
      return "/tree";

    case "garden":
      if (relatedEntityId) {
        return `/garden/${relatedEntityId}`;
      }
      return "/garden";

    case "payment":
    case "subscription":
      return "/paymenthistory";

    case "promotion":
      return "/price";

    default:
      // Mặc định trả về trang notifications
      return "/notifications";
  }
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
