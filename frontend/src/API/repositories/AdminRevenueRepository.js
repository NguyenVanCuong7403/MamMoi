import ApiClient from "../ApiClient";

export default class AdminRevenueRepository {
  /**
   * Get revenue statistics
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   */
  static async getRevenueStatistics(startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());

    const response = await ApiClient.get(`/api/admin/revenue/statistics?${params.toString()}`);
    return response.data;
  }

  /**
   * Get revenue by period
   * @param {string} periodType - Period type: "daily", "weekly", "monthly", "yearly" (default: "monthly")
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   */
  static async getRevenueByPeriod(periodType = "monthly", startDate = null, endDate = null) {
    const params = new URLSearchParams();
    params.append("periodType", periodType);
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());

    const response = await ApiClient.get(`/api/admin/revenue/by-period?${params.toString()}`);
    return response.data;
  }

  /**
   * Get revenue by subscription plan
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   */
  static async getRevenueByPlan(startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());

    const response = await ApiClient.get(`/api/admin/revenue/by-plan?${params.toString()}`);
    return response.data;
  }

  /**
   * Get revenue summary
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {number} recentPaymentsCount - Number of recent payments to include (default: 10)
   */
  static async getRevenueSummary(startDate = null, endDate = null, recentPaymentsCount = 10) {
    const params = new URLSearchParams();
    params.append("recentPaymentsCount", recentPaymentsCount);
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());

    const response = await ApiClient.get(`/api/admin/revenue/summary?${params.toString()}`);
    return response.data;
  }

  /**
   * Get payment list with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Page size (default: 20)
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {number} userId - User ID filter
   * @param {string} transactionStatus - Transaction status filter
   * @param {string} planId - Subscription plan filter
   */
  static async getPayments(page = 1, pageSize = 20, startDate = null, endDate = null, userId = null, transactionStatus = null, planId = null) {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", pageSize);
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());
    if (userId) params.append("userId", userId);
    if (transactionStatus) params.append("transactionStatus", transactionStatus);
    if (planId) params.append("planId", planId);

    const response = await ApiClient.get(`/api/admin/revenue/payments?${params.toString()}`);
    return response;
  }
}
