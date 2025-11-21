import ApiClient from "../ApiClient";

export default class TreeVarietyRepository {
  /**
   * Get all tree varieties
   */
  static async getAllTreeVarieties() {
    return ApiClient.get("/api/business-admin/tree-varieties");
  }

  /**
   * Get tree variety by ID
   * @param {number} id - Tree variety ID
   */
  static async getTreeVarietyById(id) {
    return ApiClient.get(`/api/business-admin/tree-varieties/${id}`);
  }

  /**
   * Get tree varieties by tree type
   * @param {number} treeTypeId - Tree type ID
   */
  static async getTreeVarietiesByTreeType(treeTypeId) {
    return ApiClient.get(`/api/business-admin/tree-varieties/tree-type/${treeTypeId}`);
  }

  /**
   * Create a new tree variety
   * @param {Object} data - TreeVarietyCreateUpdateDto
   * @param {number} data.treeTypeId - Required
   * @param {string} data.varietyName - Required
   * @param {string} data.varietyDescription - Optional
   */
  static async createTreeVariety(data) {
    return ApiClient.post("/api/business-admin/tree-varieties", data);
  }

  /**
   * Update an existing tree variety
   * @param {number} id - Tree variety ID
   * @param {Object} data - TreeVarietyCreateUpdateDto
   * @param {number} data.treeTypeId - Required
   * @param {string} data.varietyName - Required
   * @param {string} data.varietyDescription - Optional
   */
  static async updateTreeVariety(id, data) {
    return ApiClient.put(`/api/business-admin/tree-varieties/${id}`, data);
  }

  /**
   * Delete a tree variety
   * @param {number} id - Tree variety ID
   */
  static async deleteTreeVariety(id) {
    return ApiClient.delete(`/api/business-admin/tree-varieties/${id}`);
  }
}