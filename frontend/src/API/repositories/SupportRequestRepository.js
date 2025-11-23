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

    const response = await ApiClient.get(`/api/support-requests?${params.toString()}`);
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

  /**
   * Submit feedback for resolved support request
   * @param {number} id - Request ID
   * @param {object} data - Feedback data { satisfactionRating, feedback }
   */
  static async submitFeedback(id, data) {
    const response = await ApiClient.post(`/api/support-requests/${id}/feedback`, data);
    return response.data;
  }
}

