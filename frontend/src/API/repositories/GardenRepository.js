import ApiClient from "../ApiClient";

export default class GardenRepository {
  /**
   * Create a new garden
   * @param {Object} data - CreateGardenDto
   */
  static async createGarden(data) {
    return ApiClient.post("/api/gardens", data);
  }

  /**
   * Get list of gardens with optional pagination and search
   * @param {number} pageNumber
   * @param {number} pageSize
   * @param {string} searchTerm
   */
  static async getGardens(pageNumber = 1, pageSize = 10, searchTerm = "") {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber);
    params.append("pageSize", pageSize);
    if (searchTerm) params.append("searchTerm", searchTerm);

    return ApiClient.get(`/api/gardens?${params.toString()}`);
  }

  /**
   * Get garden details by id
   * @param {number} id
   */
  static async getGardenById(id) {
    return ApiClient.get(`/api/gardens/${id}`);
  }

    /**
   * Upload a garden image file
   * @param {File} file
   * @returns {Promise<{success: boolean, url: string}>}
   */
  static async uploadGardenImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    return ApiClient.post("/api/gardens/upload", formData, true);
  }
  

  /**
   * Update a garden
   * @param {number} id
   * @param {Object} data - UpdateGardenDto
   */
  static async updateGarden(id, data) {
    return ApiClient.put(`/api/gardens/${id}`, data);
  }

  /**
   * Update only the status of a garden
   * @param {number} id
   * @param {string} status
   */
  static async updateGardenStatus(id, status) {
    // Wrap in object for future extensibility
    return ApiClient.put(`/api/gardens/${id}/status`, JSON.stringify(status), true);
  }

}
