import ApiClient from "../ApiClient";

export default class AdminGrowthStageRepository {
  /**
   * Get all tree growth stages with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Page size (default: 20)
   * @param {string} searchTerm - Search term
   * @param {number} treeTypeId - Tree type ID filter
   */
  static async getAllTreeGrowthStages(page = 1, pageSize = 20, searchTerm = null, treeTypeId = null) {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", pageSize);
    if (searchTerm) params.append("searchTerm", searchTerm);
    if (treeTypeId) params.append("treeTypeId", treeTypeId);

    const response = await ApiClient.get(`/api/admin/tree-growth-stages?${params.toString()}`);
    return response;
  }

  /**
   * Get tree growth stage by ID
   * @param {number} id - Growth stage ID
   */
  static async getTreeGrowthStageById(id) {
    const response = await ApiClient.get(`/api/admin/tree-growth-stages/${id}`);
    return response.data;
  }

  /**
   * Get stages by tree type ID
   * @param {number} treeTypeId - Tree type ID
   */
  static async getStagesByTreeTypeId(treeTypeId) {
    const response = await ApiClient.get(`/api/admin/tree-growth-stages/by-tree-type/${treeTypeId}`);
    return response.data;
  }

  /**
   * Create a new tree growth stage
   * @param {Object} data - CreateTreeGrowthStageDto
   */
  static async createTreeGrowthStage(data) {
    const response = await ApiClient.post("/api/admin/tree-growth-stages", data);
    return response.data;
  }

  /**
   * Update an existing tree growth stage
   * @param {number} id - Growth stage ID
   * @param {Object} data - UpdateTreeGrowthStageDto
   */
  static async updateTreeGrowthStage(id, data) {
    const response = await ApiClient.put(`/api/admin/tree-growth-stages/${id}`, data);
    return response.data;
  }

  /**
   * Delete a tree growth stage
   * @param {number} id - Growth stage ID
   */
  static async deleteTreeGrowthStage(id) {
    const response = await ApiClient.delete(`/api/admin/tree-growth-stages/${id}`);
    return response;
  }

  /**
   * Reorder stages for a tree type
   * @param {number} treeTypeId - Tree type ID
   * @param {Object} stageIdToNewOrder - Map of stageId to new order (e.g., { 1: 2, 2: 1 })
   */
  static async reorderStages(treeTypeId, stageIdToNewOrder) {
    const response = await ApiClient.put(`/api/admin/tree-growth-stages/reorder/${treeTypeId}`, stageIdToNewOrder);
    return response;
  }

  /**
   * Upload an icon/image for growth stages
   * @param {File} file - Image file
   */
  static async uploadStageImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    return ApiClient.post("/api/admin/tree-growth-stages/upload", formData, true);
  }
}
