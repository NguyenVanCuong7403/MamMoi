import ApiClient from "../ApiClient";

export default class SoilMasterRepository {
  /**
   * Get all soil masters
   */
  static async getAllSoilMasters() {
    return ApiClient.get("/api/business-admin/soil-masters");
  }

  /**
   * Get soil master by ID
   * @param {number} id - Soil master ID
   */
  static async getSoilMasterById(id) {
    return ApiClient.get(`/api/business-admin/soil-masters/${id}`);
  }

  /**
   * Get soil masters dropdown
   */
  static async getSoilMastersDropdown() {
    return ApiClient.get("/api/business-admin/soil-masters/dropdown");
  }

  /**
   * Create a new soil master
   * @param {Object} data - SoilMasterCreateUpdateDto
   * @param {string} data.soilName - Required
   * @param {string} data.texture - Optional
   * @param {string} data.drainage - Optional
   * @param {number} data.organicMatterPct - Optional
   * @param {number} data.ecDSM - Optional
   * @param {string} data.notes - Optional
   */
  static async createSoilMaster(data) {
    return ApiClient.post("/api/business-admin/soil-masters", data);
  }

  /**
   * Update an existing soil master
   * @param {number} id - Soil master ID
   * @param {Object} data - SoilMasterCreateUpdateDto
   * @param {string} data.soilName - Required
   * @param {string} data.texture - Optional
   * @param {string} data.drainage - Optional
   * @param {number} data.organicMatterPct - Optional
   * @param {number} data.ecDSM - Optional
   * @param {string} data.notes - Optional
   */
  static async updateSoilMaster(id, data) {
    return ApiClient.put(`/api/business-admin/soil-masters/${id}`, data);
  }

  /**
   * Delete a soil master
   * @param {number} id - Soil master ID
   */
  static async deleteSoilMaster(id) {
    return ApiClient.delete(`/api/business-admin/soil-masters/${id}`);
  }
}