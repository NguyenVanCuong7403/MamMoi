import ApiClient from "../ApiClient";

export default class AdminUserRepository {
  /**
   * Get all users with pagination and filters
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Page size (default: 20)
   * @param {string} searchTerm - Search term
   * @param {number} roleId - Role ID filter
   * @param {boolean} isActive - Active status filter
   */
  static async getAllUsers(page = 1, pageSize = 20, searchTerm = null, roleId = null, isActive = null) {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", pageSize);
    if (searchTerm) params.append("searchTerm", searchTerm);
    if (roleId) params.append("roleId", roleId);
    if (isActive !== null) params.append("isActive", isActive);

    const response = await ApiClient.get(`/api/admin/users?${params.toString()}`);
    return response;
  }

  /**
   * Get user details by ID
   * @param {number} id - User ID
   */
  static async getUserById(id) {
    const response = await ApiClient.get(`/api/admin/users/${id}`);
    return response.data;
  }

  /**
   * Update user information
   * @param {number} id - User ID
   * @param {Object} data - AdminUpdateUserDto
   */
  static async updateUser(id, data) {
    const response = await ApiClient.put(`/api/admin/users/${id}`, data);
    return response.data;
  }

  /**
   * Activate user account
   * @param {number} id - User ID
   */
  static async activateUser(id) {
    const response = await ApiClient.post(`/api/admin/users/${id}/activate`, {});
    return response;
  }

  /**
   * Deactivate user account
   * @param {number} id - User ID
   */
  static async deactivateUser(id) {
    const response = await ApiClient.post(`/api/admin/users/${id}/deactivate`, {});
    return response;
  }
}
