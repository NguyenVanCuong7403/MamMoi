import ApiClient from "../ApiClient";

export default class AdminSoilMasterRepository {
  /**
   * Get all soil masters with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} pageSize - Page size (default: 20)
   * @param {string} searchTerm - Search term
   */
  static async getAllSoilMasters(page = 1, pageSize = 20, searchTerm = null) {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("pageSize", pageSize);
      if (searchTerm) params.append("searchTerm", searchTerm);

      const response = await ApiClient.get(
        `/api/admin/soil-masters?${params.toString()}`
      );
      // Backend returns: { success: true, data: [...], pagination: {...} }
      if (response && response.success && response.data) {
        return response;
      }
      // Fallback for old format
      return { success: true, data: response.data || response, pagination: {} };
    } catch (error) {
      // If endpoint doesn't exist (404), return empty array
      if (error.status === 404 || error.message?.includes("404")) {
        console.warn(
          "Soil masters endpoint not yet implemented in backend. Returning empty array."
        );
        return {
          data: [],
          success: false,
          message: "Endpoint not implemented",
        };
      }
      throw error;
    }
  }

  /**
   * Get soil master by ID
   * @param {number} id - Soil master ID
   */
  static async getSoilMasterById(id) {
    try {
      const response = await ApiClient.get(`/api/admin/soil-masters/${id}`);
      // Backend returns: { success: true, data: {...} }
      if (response && response.success && response.data) {
        return response.data;
      }
      // Fallback for old format
      return response.data || response;
    } catch (error) {
      if (error.status === 404 || error.message?.includes("404")) {
        console.warn("Soil masters endpoint not yet implemented in backend.");
        throw new Error("Endpoint not implemented in backend");
      }
      throw error;
    }
  }

  /**
   * Create a new soil master
   * @param {Object} data - CreateSoilMasterDto
   */
  static async createSoilMaster(data) {
    try {
      const response = await ApiClient.post("/api/admin/soil-masters", data);
      // Backend returns: { success: true, message: "...", data: {...} }
      if (response && response.success && response.data) {
        return response.data;
      }
      // Fallback for old format
      return response.data || response;
    } catch (error) {
      // Handle validation errors from backend
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.status === 404 || error.message?.includes("404")) {
        throw new Error(
          "Soil master endpoint not yet implemented in backend. Please contact administrator."
        );
      }
      throw error;
    }
  }

  /**
   * Update an existing soil master
   * @param {number} id - Soil master ID
   * @param {Object} data - UpdateSoilMasterDto
   */
  static async updateSoilMaster(id, data) {
    try {
      const response = await ApiClient.put(
        `/api/admin/soil-masters/${id}`,
        data
      );
      // Backend returns: { success: true, message: "...", data: {...} }
      if (response && response.success && response.data) {
        return response.data;
      }
      // Fallback for old format
      return response.data || response;
    } catch (error) {
      // Handle validation errors from backend
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.status === 404 || error.message?.includes("404")) {
        throw new Error(
          "Soil master endpoint not yet implemented in backend. Please contact administrator."
        );
      }
      throw error;
    }
  }

  /**
   * Delete a soil master
   * @param {number} id - Soil master ID
   */
  static async deleteSoilMaster(id) {
    try {
      const response = await ApiClient.delete(`/api/admin/soil-masters/${id}`);
      return response;
    } catch (error) {
      // Handle validation errors from backend (e.g., cannot delete if in use)
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.status === 404 || error.message?.includes("404")) {
        throw new Error(
          "Soil master endpoint not yet implemented in backend. Please contact administrator."
        );
      }
      throw error;
    }
  }
}
