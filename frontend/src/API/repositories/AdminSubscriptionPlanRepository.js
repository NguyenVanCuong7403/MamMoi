import ApiClient from "../ApiClient";

export default class AdminSubscriptionPlanRepository {
  /**
   * Get all subscription plans (admin view with pagination)
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Page size (default: 20)
   * @param {boolean} isActive - Active status filter
   * @param {string} searchTerm - Search term
   */
  static async getAllSubscriptionPlans(page = 1, pageSize = 20, isActive = null, searchTerm = null) {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", pageSize);
    if (isActive !== null) params.append("isActive", isActive);
    if (searchTerm) params.append("searchTerm", searchTerm);

    const response = await ApiClient.get(`/api/admin/subscription-plans?${params.toString()}`);
    return response;
  }

  /**
   * Get subscription plan by ID
   * @param {number} id - Plan ID
   */
  static async getSubscriptionPlanById(id) {
    const response = await ApiClient.get(`/api/admin/subscription-plans/${id}`);
    return response.data;
  }

  /**
   * Create a new subscription plan
   * @param {Object} data - CreateSubscriptionPlanDto
   */
  static async createSubscriptionPlan(data) {
    const response = await ApiClient.post("/api/admin/subscription-plans", data);
    return response.data;
  }

  /**
   * Update an existing subscription plan
   * @param {number} id - Plan ID
   * @param {Object} data - UpdateSubscriptionPlanDto
   */
  static async updateSubscriptionPlan(id, data) {
    const response = await ApiClient.put(`/api/admin/subscription-plans/${id}`, data);
    return response.data;
  }

  /**
   * Delete a subscription plan (soft delete)
   * @param {number} id - Plan ID
   */
  static async deleteSubscriptionPlan(id) {
    const response = await ApiClient.delete(`/api/admin/subscription-plans/${id}`);
    return response;
  }

  /**
   * Activate a subscription plan
   * @param {number} id - Plan ID
   */
  static async activateSubscriptionPlan(id) {
    const response = await ApiClient.post(`/api/admin/subscription-plans/${id}/activate`, {});
    return response;
  }

  /**
   * Deactivate a subscription plan
   * @param {number} id - Plan ID
   */
  static async deactivateSubscriptionPlan(id) {
    const response = await ApiClient.post(`/api/admin/subscription-plans/${id}/deactivate`, {});
    return response;
  }
}
