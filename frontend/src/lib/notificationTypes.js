/**
 * Notification Types Constants
 * Đồng bộ các loại thông báo giữa Admin và User
 */

/**
 * Danh sách tất cả các loại thông báo được hỗ trợ trong hệ thống
 * Dựa trên các loại được sử dụng trong backend và frontend
 */
export const NOTIFICATION_TYPES = {
  BROADCAST: "Broadcast",
  SUPPORT_REQUEST: "SupportRequest",
  TASK_EXPIRATION: "TaskExpiration",
  PROMOTION: "Promotion",
  PAYMENT: "Payment",
  TREE: "Tree",
  SYSTEM: "System",
  ANNOUNCEMENT: "Announcement",
};

/**
 * Danh sách các loại thông báo có thể được admin tạo/gửi
 * Bao gồm các loại broadcast và promotion
 */
export const ADMIN_NOTIFICATION_TYPES = [
  { value: NOTIFICATION_TYPES.BROADCAST, label: "Thông báo chung" },
  { value: NOTIFICATION_TYPES.PROMOTION, label: "Khuyến mãi" },
  { value: NOTIFICATION_TYPES.SYSTEM, label: "Hệ thống" },
  { value: NOTIFICATION_TYPES.ANNOUNCEMENT, label: "Thông báo" },
];

/**
 * Danh sách tất cả các loại thông báo mà user có thể xem/lọc
 * Bao gồm tất cả các loại có thể xuất hiện trong hệ thống
 */
export const USER_NOTIFICATION_TYPES = [
  { value: NOTIFICATION_TYPES.SUPPORT_REQUEST, label: "Hỗ trợ" },
  { value: NOTIFICATION_TYPES.BROADCAST, label: "Thông báo chung" },
  { value: NOTIFICATION_TYPES.TASK_EXPIRATION, label: "Nhiệm vụ" },
  { value: NOTIFICATION_TYPES.PROMOTION, label: "Khuyến mãi" },
  { value: NOTIFICATION_TYPES.PAYMENT, label: "Thanh toán" },
  { value: NOTIFICATION_TYPES.TREE, label: "Cây" },
  { value: NOTIFICATION_TYPES.SYSTEM, label: "Hệ thống" },
];

/**
 * Hàm dịch loại thông báo sang tiếng Việt
 * @param {string} type - Loại thông báo
 * @returns {string} Tên tiếng Việt của loại thông báo
 */
export function translateNotificationType(type) {
  if (!type) return "Chung";

  const typeLower = type.toLowerCase();

  switch (typeLower) {
    case "supportrequest":
      return "Hỗ trợ";
    case "broadcast":
      return "Thông báo chung";
    case "taskexpiration":
    case "task":
      return "Nhiệm vụ";
    case "promotion":
      return "Khuyến mãi";
    case "payment":
    case "subscription":
      return "Thanh toán";
    case "tree":
      return "Cây";
    case "auth":
      return "Đăng nhập & Đăng ký";
    case "system":
      return "Hệ thống";
    case "announcement":
      return "Thông báo";
    default:
      return type;
  }
}

/**
 * Lấy label từ value cho admin
 * @param {string} value - Giá trị notification type
 * @returns {string} Label tương ứng
 */
export function getAdminNotificationTypeLabel(value) {
  const option = ADMIN_NOTIFICATION_TYPES.find((opt) => opt.value === value);
  return option ? option.label : value || "N/A";
}

/**
 * Lấy label từ value cho user
 * @param {string} value - Giá trị notification type
 * @returns {string} Label tương ứng
 */
export function getUserNotificationTypeLabel(value) {
  const option = USER_NOTIFICATION_TYPES.find((opt) => opt.value === value);
  return option ? option.label : translateNotificationType(value);
}

