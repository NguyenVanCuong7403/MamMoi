import ApiClient from "../ApiClient";

export default class UserRepository {
  /**
   * Get all users
   */
  static async getAll() {
    return ApiClient.get("/api/users");
  }

  /**
   * Get user by ID
   * @param {string} id - User GUID
   */
  static async getById(id) {
    return ApiClient.get(`/api/users/${id}`);
  }

  /**
   * Create new user
   * @param {Object} data - CreateUserDto
   */
  static async create(data) {
    return ApiClient.post("/api/users", data);
  }

  /**
   * Update user basic info
   * @param {string} id - User GUID
   * @param {Object} data - UpdateUserDto
   */
  static async update(id, data) {
    return ApiClient.put(`/api/users/${id}`, data);
  }

  /**
   * Delete user
   * @param {string} id - User GUID
   */
  static async delete(id) {
    return ApiClient.delete(`/api/users/${id}`);
  }

  // #region User Profile Endpoints

  /**
   * Get user profile
   * @param {number} userId
   */
  static async getProfile(userId) {
    return ApiClient.get(`/api/users/profile/${userId}`);
  }

  /**
   * Edit user profile
   * @param {number} userId
   * @param {Object} data - EditProfileDto
   */
  static async editProfile(userId, data) {
    return ApiClient.put(`/api/users/profile/${userId}`, data);
  }

  /**
   * Upload or update user avatar
   * @param {number} userId
   * @param {File} file - Image file (max 5MB, allowed: jpeg, png, webp)
   */
  static async uploadAvatar(userId, file) {
    const formData = new FormData();
    formData.append("file", file);

    return ApiClient.post(`/api/users/${userId}/avatar`, formData, true);
  }

  /**
   * Delete user avatar
   * @param {number} userId
   */
  static async deleteAvatar(userId) {
    return ApiClient.delete(`/api/users/${userId}/avatar`);
  }

  // #endregion

  // #region Ban Account Endpoints

  /**
   * Ban user account
   * @param {number} userId
   * @param {Object} data - BanAccountDto
   * @param {string} data.reason - Ban reason (required)
   * @param {number} [data.durationDays] - Ban duration in days (optional, null for permanent)
   */
  static async banAccount(userId, data) {
    return ApiClient.post(`/api/users/${userId}/ban`, data);
  }

  /**
   * Unban user account
   * @param {number} userId
   */
  static async unbanAccount(userId) {
    return ApiClient.post(`/api/users/${userId}/unban`);
  }

  /**
   * Get user ban status and information
   * @param {number} userId
   */
  static async getBanInfo(userId) {
    return ApiClient.get(`/api/users/${userId}/ban-info`);
  }

  /**
   * Check if account is currently banned
   * @param {number} userId
   */
  static async isAccountBanned(userId) {
    return ApiClient.get(`/api/users/${userId}/is-banned`);
  }

  // #endregion
}
