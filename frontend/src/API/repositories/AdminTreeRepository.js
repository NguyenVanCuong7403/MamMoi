import ApiClient from "../ApiClient";

export default class AdminTreeRepository {
  // ========== Tree Types ==========

  /**
   * Get all tree types with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Page size (default: 20)
   * @param {string} searchTerm - Search term
   * @param {boolean} isActive - Active status filter
   */
  static async getAllTreeTypes(page = 1, pageSize = 20, searchTerm = null, isActive = null) {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", pageSize);
    if (searchTerm) params.append("searchTerm", searchTerm);
    if (isActive !== null) params.append("isActive", isActive);

    const response = await ApiClient.get(`/api/admin/tree-types?${params.toString()}`);
    return response;
  }

  /**
   * Get tree type by ID
   * @param {number} id - Tree type ID
   */
  static async getTreeTypeById(id) {
    const response = await ApiClient.get(`/api/admin/tree-types/${id}`);
    return response.data;
  }

  /**
   * Create a new tree type
   * @param {Object} data - CreateTreeTypeDto
   */
  static async createTreeType(data) {
    const response = await ApiClient.post("/api/admin/tree-types", data);
    return response.data;
  }

  /**
   * Update an existing tree type
   * @param {number} id - Tree type ID
   * @param {Object} data - UpdateTreeTypeDto
   */
  static async updateTreeType(id, data) {
    const response = await ApiClient.put(`/api/admin/tree-types/${id}`, data);
    return response.data;
  }

  /**
   * Delete a tree type (soft delete)
   * @param {number} id - Tree type ID
   */
  static async deleteTreeType(id) {
    const response = await ApiClient.delete(`/api/admin/tree-types/${id}`);
    return response;
  }

  /**
   * Activate a tree type
   * @param {number} id - Tree type ID
   */
  static async activateTreeType(id) {
    const response = await ApiClient.post(`/api/admin/tree-types/${id}/activate`, {});
    return response;
  }

  // ========== Tree Varieties ==========

  /**
   * Get all tree varieties with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Page size (default: 20)
   * @param {string} searchTerm - Search term
   * @param {number} treeTypeId - Tree type ID filter
   */
  static async getAllTreeVarieties(page = 1, pageSize = 20, searchTerm = null, treeTypeId = null) {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", pageSize);
    if (searchTerm) params.append("searchTerm", searchTerm);
    if (treeTypeId) params.append("treeTypeId", treeTypeId);

    const response = await ApiClient.get(`/api/admin/tree-varieties?${params.toString()}`);
    return response;
  }

  /**
   * Get tree variety by ID
   * @param {number} id - Tree variety ID
   */
  static async getTreeVarietyById(id) {
    const response = await ApiClient.get(`/api/admin/tree-varieties/${id}`);
    return response.data;
  }

  /**
   * Get varieties by tree type ID
   * @param {number} treeTypeId - Tree type ID
   */
  static async getVarietiesByTreeTypeId(treeTypeId) {
    const response = await ApiClient.get(`/api/admin/tree-varieties/by-tree-type/${treeTypeId}`);
    return response.data;
  }

  /**
   * Create a new tree variety
   * @param {Object} data - CreateTreeVarietyDto
   */
  static async createTreeVariety(data) {
    const response = await ApiClient.post("/api/admin/tree-varieties", data);
    return response.data;
  }

  /**
   * Update an existing tree variety
   * @param {number} id - Tree variety ID
   * @param {Object} data - UpdateTreeVarietyDto
   */
  static async updateTreeVariety(id, data) {
    const response = await ApiClient.put(`/api/admin/tree-varieties/${id}`, data);
    return response.data;
  }

  /**
   * Delete a tree variety
   * @param {number} id - Tree variety ID
   */
  static async deleteTreeVariety(id) {
    const response = await ApiClient.delete(`/api/admin/tree-varieties/${id}`);
    return response;
  }
}
