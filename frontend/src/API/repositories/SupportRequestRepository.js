import ApiClient from "../ApiClient";

export default class SupportRequestRepository {
  /**
   * Create a new support request
   * @param {object} data - Support request data { subject, description, category, priority, attachmentUrls }
   */
  static async createRequest(data) {
    const response = await ApiClient.post("/api/support-requests", data);
    return response.data;
  }

  /**
   * Upload image for support request
   * @param {File} file - Image file to upload
   * @returns {Promise<string>} - Image URL
   */
  static async uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    // ApiClient.post(path, body, isFormData)
    const response = await ApiClient.post(
      "/api/support-requests/upload-image",
      formData,
      true // isFormData flag
    );
    return response;
  }

  /**
   * Get user's own support requests
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Page size (default: 20)
   * @param {string} status - Status filter
   */
  static async getUserRequests(page = 1, pageSize = 20, status = null) {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", pageSize);
    if (status) params.append("status", status);

    const response = await ApiClient.get(
      `/api/support-requests?${params.toString()}`
    );
    return response;
  }

  /**
   * Get support request by ID
   * @param {number} id - Request ID
   */
  static async getRequestById(id) {
    const response = await ApiClient.get(`/api/support-requests/${id}`);
    return response.data;
  }

  static async getAdminRequests(
    page = 1,
    pageSize = 20,
    status = null,
    priority = null,
    category = null,
    userId = null,
    startDate = null,
    endDate = null
  ) {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", pageSize);
    if (status) params.append("status", status);
    if (priority) params.append("priority", priority);
    if (category) params.append("category", category);
    if (userId) params.append("userId", userId);
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());

    const response = await ApiClient.get(
      `/api/admin/support-requests?${params.toString()}`
    );
    return response;
  }

  static async getAdminRequestById(id) {
    const response = await ApiClient.get(`/api/admin/support-requests/${id}`);
    return response.data;
  }

  /**
   * Submit feedback for resolved support request
   * @param {number} id - Request ID
   * @param {object} data - Feedback data { satisfactionRating, feedback }
   */
  static async submitFeedback(id, data) {
    const response = await ApiClient.post(
      `/api/support-requests/${id}/feedback`,
      data
    );
    return response.data;
  }
}
