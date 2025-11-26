import ApiClient from "../ApiClient";

export default class PaymentRepository {
  /**
   * Get payment history for the current user with pagination
   * @param {number} [page=1] - Page number (1-based)
   * @param {number} [pageSize=10] - Number of records per page (max 100)
   */
  static async getPaymentHistory(page = 1, pageSize = 10) {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", pageSize);

    return ApiClient.get(`/api/payments/history?${params.toString()}`);
  }

  /**
   * Get all payment history for the current user
   */
  static async getAllPaymentHistory() {
    return ApiClient.get("/api/payments/history/all");
  }

  /**
   * Get specific payment details
   * @param {number} paymentId - Payment ID
   */
  static async getPaymentDetail(paymentId) {
    return ApiClient.get(`/api/payments/${paymentId}`);
  }

  /**
   * Get filtered payment history
   * @param {Object} options - Filter options
   * @param {string} [options.status] - Transaction status filter (Completed, Failed, Pending, etc.)
   * @param {Date|string} [options.startDate] - Start date filter (yyyy-MM-dd)
   * @param {Date|string} [options.endDate] - End date filter (yyyy-MM-dd)
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.pageSize=10] - Page size (max 100)
   */
  static async getFilteredPaymentHistory({
    status,
    startDate,
    endDate,
    page = 1,
    pageSize = 10,
  } = {}) {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", pageSize);

    if (status) params.append("status", status);

    if (startDate) {
      const dateStr =
        startDate instanceof Date
          ? startDate.toISOString().split("T")[0]
          : startDate;
      params.append("startDate", dateStr);
    }

    if (endDate) {
      const dateStr =
        endDate instanceof Date ? endDate.toISOString().split("T")[0] : endDate;
      params.append("endDate", dateStr);
    }

    return ApiClient.get(`/api/payments/filtered?${params.toString()}`);
  }

  /**
   * Get payment statistics for the current user
   */
  static async getPaymentStatistics() {
    return ApiClient.get("/api/payments/statistics");
  }

  /**
   * Get recent payments summary
   * @param {number} [limit=5] - Number of recent payments to retrieve (max 20)
   */
  static async getRecentPayments(limit = 5) {
    const params = new URLSearchParams();
    params.append("limit", limit);

    return ApiClient.get(`/api/payments/recent?${params.toString()}`);
  }

  /**
   * Check if user has completed payments
   * @returns {Promise<{hasCompletedPayments: boolean}>}
   */
  static async hasCompletedPayments() {
    return ApiClient.get("/api/payments/has-completed");
  }

  /**
   * Get total amount paid by user
   * @returns {Promise<{totalAmountPaid: number}>}
   */
  static async getTotalAmountPaid() {
    return ApiClient.get("/api/payments/total-amount");
  }

  // #region PayOS Checkout

  /**
   * Create a checkout session for subscription payment
   * @param {Object} data - Checkout request
   * @param {number} data.planId - Subscription plan ID
   * @param {string} [data.returnUrl] - Return URL after payment
   * @param {string} [data.cancelUrl] - Cancel URL
   * @returns {Promise<Object>} Checkout response with QR code and bank info
   */
  static async createCheckout(data) {
    return ApiClient.post("/api/payments/checkout", data);
  }

  /**
   * Check payment status by order code
   * @param {string} orderCode - Order code to check
   * @returns {Promise<Object>} Payment status
   */
  static async checkPaymentStatus(orderCode) {
    return ApiClient.get(`/api/payments/status/${orderCode}`);
  }

  /**
   * Cancel a pending payment
   * @param {string} orderCode - Order code to cancel
   * @returns {Promise<Object>} Result
   */
  static async cancelPayment(orderCode) {
    return ApiClient.post(`/api/payments/cancel/${orderCode}`);
  }

  /**
   * Simulate payment completion (for demo/testing)
   * @param {string} orderCode - Order code to complete
   * @returns {Promise<Object>} Result
   */
  static async demoCompletePayment(orderCode) {
    return ApiClient.post(`/api/payments/demo-complete/${orderCode}`);
  }

  // #endregion
}

