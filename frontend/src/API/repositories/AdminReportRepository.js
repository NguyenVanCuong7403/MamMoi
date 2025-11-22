import ApiClient from "../ApiClient";

export default class AdminReportRepository {
  /**
   * Get all reports with filters
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Page size (default: 20)
   * @param {string} status - Status filter: "in_progress", "resolved", "rejected"
   * @param {string} priority - Priority filter: "low", "medium", "high", "urgent"
   * @param {string} category - Category filter
   * @param {number} userId - User ID filter
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   */
  static async getReports(
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

    const response = await ApiClient.get(`/api/admin/reports?${params.toString()}`);
    return response;
  }

  /**
   * Get report by ID
   * @param {number} id - Report ID
   */
  static async getReportById(id) {
    const response = await ApiClient.get(`/api/admin/reports/${id}`);
    return response.data;
  }

  /**
   * Update report
   * @param {number} id - Report ID
   * @param {object} data - Update data { status, resolution, priority, category }
   */
  static async updateReport(id, data) {
    const response = await ApiClient.put(`/api/admin/reports/${id}`, data);
    return response.data;
  }

  /**
   * Get report statistics
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   */
  static async getReportStatistics(startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());

    const response = await ApiClient.get(`/api/admin/reports/statistics?${params.toString()}`);
    return response.data;
  }
}

