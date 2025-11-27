import ApiClient from "../ApiClient";

export default class SubscriptionPlanRepository {
  /**
   * Get all subscription plans
   * @param {boolean} [isActive] - Filter by active status
   * @returns {Promise<Array>} List of subscription plans
   */
  static async getAll(isActive = null) {
    const params = isActive !== null ? `?isActive=${isActive}` : "";
    const response = await ApiClient.get(`/api/subscriptionplans${params}`);
    return response?.data || response || [];
  }

  /**
   * Get paid subscription plans (excluding free plan with ID 1)
   * @returns {Promise<Array>} List of paid subscription plans
   */
  static async getPaidPlans() {
    const plans = await this.getAll(true);
    // Filter out the free plan (ID 1) and return only paid plans
    return (plans || []).filter((plan) => plan.planId !== 1);
  }

  /**
   * Get subscription plan by ID
   * @param {number} id - Plan ID
   * @returns {Promise<Object>} Subscription plan
   */
  static async getById(id) {
    const response = await ApiClient.get(`/api/subscriptionplans/${id}`);
    return response?.data || response;
  }

  /**
   * Get subscription plan by name
   * @param {string} planName - Plan name
   * @returns {Promise<Object>} Subscription plan
   */
  static async getByName(planName) {
    const response = await ApiClient.get(`/api/subscriptionplans/name/${planName}`);
    return response?.data || response;
  }

  /**
   * Get current user's active subscription plan
   * @returns {Promise<Object|null>} Current user's subscription plan, or null if no active subscription
   */
  static async getCurrentUserSubscription() {
    try {
      const response = await ApiClient.get("/api/subscriptionplans/current");
      return response?.data || response || null;
    } catch (error) {
      // If 404, user has no active subscription
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

