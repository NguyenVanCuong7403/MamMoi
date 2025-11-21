import ApiClient from "../ApiClient";

export default class TreeTypeRepository {
  /**
   * Get all tree types (Business Admin)
   */
  static async getAllTreeTypes() {
    return ApiClient.get("/api/business-admin/tree-types");
  }

  /**
   * Get tree type by ID (Business Admin)
   * @param {number} id - Tree type ID
   */
  static async getTreeTypeById(id) {
    return ApiClient.get(`/api/business-admin/tree-types/${id}`);
  }

  /**
   * Create a new tree type (Business Admin)
   * @param {Object} data - TreeTypeCreateUpdateDto
   * @param {string} data.treeTypeName - Required
   * @param {string} data.scientificName - Required
   * @param {string} data.description - Optional
   * @param {number} data.soilId - Required
   * @param {string} data.optimalConditions - Optional
   * @param {string} data.careInstructions - Optional
   */
  static async createTreeType(data) {
    return ApiClient.post("/api/business-admin/tree-types", data);
  }

  /**
   * Update an existing tree type (Business Admin)
   * @param {number} id - Tree type ID
   * @param {Object} data - TreeTypeCreateUpdateDto
   */
  static async updateTreeType(id, data) {
    return ApiClient.put(`/api/business-admin/tree-types/${id}`, data);
  }

  /**
   * Delete a tree type (Business Admin)
   * @param {number} id - Tree type ID
   */
  static async deleteTreeType(id) {
    return ApiClient.delete(`/api/business-admin/tree-types/${id}`);
  }
}