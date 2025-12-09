import ApiClient from "../ApiClient";

export default class NotificationRepository {
  /**
   * Get user's notifications
   * @param {number} page
   * @param {number} pageSize
   * @param {boolean|null} isRead
   * @param {string|null} notificationType
   */
  static async getUserNotifications(
    page = 1,
    pageSize = 20,
    isRead = null,
    notificationType = null
  ) {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", pageSize);
    if (isRead !== null) params.append("isRead", isRead);
    if (notificationType) params.append("notificationType", notificationType);

    return ApiClient.get(`/api/notifications?${params.toString()}`);
  }

  /**
   * Get notification by ID
   * @param {number} id
   */
  static async getNotificationById(id) {
    return ApiClient.get(`/api/notifications/${id}`);
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount() {
    return ApiClient.get("/api/notifications/unread-count");
  }

  /**
   * Mark notifications as read
   * @param {number[]} notificationIds
   */
  static async markNotificationsAsRead(notificationIds) {
    return ApiClient.put("/api/notifications/mark-read", { notificationIds });
  }

  /**
   * Mark all notifications as read
   */
  static async markAllNotificationsAsRead() {
    return ApiClient.put("/api/notifications/mark-all-read", {});
  }

  /**
   * Broadcast notification to all users (SystemAdmin only)
   * @param {Object} data - BroadcastNotificationDto
   */
  static async broadcastNotification(data) {
    return ApiClient.post("/api/notifications/broadcast", data);
  }

  /**
   * Get list of broadcast notifications (SystemAdmin only)
   */
  static async getBroadcastNotifications() {
    return ApiClient.get("/api/notifications/broadcasts");
  }

  /**
   * Update broadcast notification by group ID (SystemAdmin only)
   * @param {string} groupId
   * @param {Object} data - UpdateBroadcastNotificationDto
   */
  static async updateBroadcastNotification(groupId, data) {
    return ApiClient.put(`/api/notifications/broadcasts/${groupId}`, data);
  }

  /**
   * Delete broadcast notification by group ID (SystemAdmin only)
   * @param {string} groupId
   */
  static async deleteBroadcastNotification(groupId) {
    return ApiClient.delete(`/api/notifications/broadcasts/${groupId}`);
  }

  /**
   * Get notifications by user ID (Admin only)
   * @param {number} userId
   * @param {number} page
   * @param {number} pageSize
   * @param {boolean|null} isRead
   * @param {string|null} notificationType
   */
  static async getUserNotificationsByUserId(
    userId,
    page = 1,
    pageSize = 20,
    isRead = null,
    notificationType = null
  ) {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", pageSize);
    if (isRead !== null) params.append("isRead", isRead);
    if (notificationType) params.append("notificationType", notificationType);

    return ApiClient.get(
      `/api/notifications/user/${userId}?${params.toString()}`
    );
  }

  /**
   * Send notification to specific users (SystemAdmin only)
   * @param {Object} data - Notification data with userIds array
   */
  static async sendNotificationToUsers(data) {
    return ApiClient.post("/api/notifications/send-to-users", data);
  }

  /**
   * Upload notification image (SystemAdmin only)
   * @param {File} file - Image file to upload
   * @returns {Promise<{success: boolean, url: string}>}
   */
  static async uploadNotificationImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    return ApiClient.post("/api/notifications/upload", formData, true);
  }

  /**
   * Get recipients of a broadcast notification by group ID (SystemAdmin only)
   * @param {string} groupId - The group ID of the broadcast notification
   * @returns {Promise<{success: boolean, data: Array, totalCount: number}>}
   */
  static async getBroadcastRecipients(groupId) {
    return ApiClient.get(`/api/notifications/broadcasts/${encodeURIComponent(groupId)}/recipients`);
  }
}
