import ApiClient from "../ApiClient";

export default class TreeRepository {
  /**
   * Get all tree types
   */
  static async getTreeTypes() {
    return ApiClient.get("/api/trees/types");
  }

  /**
   * Get all tree varieties
   */
  static async getTreeVarieties() {
    return ApiClient.get("/api/trees/varieties");
  }

  /**
   * Get my trees (with optional filters, pagination, and sort)
   * @param {Object} options
   * @param {number} options.userId - optional, fallback to JWT
   * @param {number} options.page
   * @param {number} options.pageSize
   * @param {string} options.sort
   * @param {number} options.gardenId
   * @param {number} options.treeTypeId
   * @param {boolean} options.isActive
   */
  static async getMyTrees({ userId, page = 1, pageSize = 20, sort = "createdAt_desc", gardenId, treeTypeId, isActive } = {}) {
    //console.log("getMyTrees");
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    params.append("page", page);
    params.append("pageSize", pageSize);
    params.append("sort", sort);
    if (gardenId) params.append("gardenId", gardenId);
    if (treeTypeId) params.append("treeTypeId", treeTypeId);
    if (typeof isActive === "boolean") params.append("isActive", isActive);

    return ApiClient.get(`/api/trees/my?${params.toString()}`);
  }

  /**
   * Search trees
   */
  static async searchTrees({ q = "", gardenId, treeTypeId, page = 1, pageSize = 20 } = {}) {
    const params = new URLSearchParams();
    params.append("q", q);
    params.append("page", page);
    params.append("pageSize", pageSize);
    if (gardenId) params.append("gardenId", gardenId);
    if (treeTypeId) params.append("treeTypeId", treeTypeId);

    return ApiClient.get(`/api/trees/search?${params.toString()}`);
  }

  /**
   * Get tree detail by id
   */
  static async getTreeDetail(id) {
    return ApiClient.get(`/api/trees/${id}`);
  }

  /**
   * Create a new tree
   * @param {Object} data - CreateTreeRequest
   * @param {number} [userId] - optional, fallback to JWT
   */
  static async createTree(data, userId) {
    const params = userId ? `?userId=${userId}` : "";
    return ApiClient.post(`/api/trees${params}`, data);
  }

  /**
   * Update a tree
   * @param {number} id
   * @param {Object} data - UpdateTreeRequest
   * @param {number} [userId] - optional, fallback to JWT
   */
  static async updateTree(id, data, userId) {
    const params = userId ? `?userId=${userId}` : "";
    return ApiClient.put(`/api/trees/${id}${params}`, data);
  }

  /**
   * Update only the status of a tree
   * @param {number} id
   * @param {Object} data - UpdateTreeStatusRequest
   * @param {number} [userId] - optional, fallback to JWT
   */
  static async updateTreeStatus(id, data, userId) {
    const params = userId ? `?userId=${userId}` : "";
    return ApiClient.patch(`/api/trees/${id}/status${params}`, data);
  }

  /**
   * Delete a tree
   */
  static async deleteTree(id, userId) {
    const params = userId ? `?userId=${userId}` : "";
    return ApiClient.delete(`/api/trees/${id}${params}`);
  }

  /**
   * Get tree images
   */
  static async getTreeImages(id) {
    return ApiClient.get(`/api/trees/${id}/images`);
  }

  /**
   * Upload tree image
   * @param {number} id
   * @param {Object} data - UploadTreeImageRequest
   */
  static async uploadTreeImage(id, data) {
    return ApiClient.post(`/api/trees/${id}/images`, data);
  }

  /**
   * Delete a tree image
   */
  static async deleteTreeImage(id, imageId) {
    return ApiClient.delete(`/api/trees/${id}/images/${imageId}`);
  }

  /**
   * Get growth history
   */
  static async getGrowthHistory(id) {
    return ApiClient.get(`/api/trees/${id}/growth-history`);
  }

  /**
   * Get growth chart
   */
  static async getGrowthChart(id, from, to) {
    const params = new URLSearchParams();
    if (from) params.append("from", from.toISOString());
    if (to) params.append("to", to.toISOString());
    return ApiClient.get(`/api/trees/${id}/growth-chart?${params.toString()}`);
  }

  /**
   * Get stages of a tree
   */
  static async getStages(id) {
    return ApiClient.get(`/api/trees/${id}/stages`);
  }
}
