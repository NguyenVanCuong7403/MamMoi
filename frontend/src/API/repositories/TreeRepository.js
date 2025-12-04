import ApiClient from "../ApiClient";

export default class TreeRepository {
  /**
   * Get all tree types
   */
  static async getTreeTypes() {
    return ApiClient.get("/api/trees/types");
  }

  /**
   * Get AI recommendation(s) for a tree.
   * The API returns recommendations for the requested date and the next 2 days (3 days total).
   * @param {number} id - tree id
   * @param {string|Date} [forDate] - optional. If omitted, server will use today's UTC date.
   *                                   If a Date is passed, it will be converted to yyyy-MM-dd.
   * @returns {Promise} ApiClient.get promise
   */
  static async getAiRecommendation(id, forDate) {
    if (!id) throw new Error("Missing tree id");

    const params = new URLSearchParams();

    if (forDate) {
      if (forDate instanceof Date) {
        // convert to yyyy-MM-dd (UTC)
        const yyyy = forDate.getUTCFullYear();
        const mm = String(forDate.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(forDate.getUTCDate()).padStart(2, "0");
        params.append("forDate", `${yyyy}-${mm}-${dd}`);
      } else {
        // assume string like "2025-11-22"
        params.append("forDate", String(forDate));
      }
    }

    const qs = params.toString();
    return ApiClient.get(
      `/api/trees/${id}/recommendation${qs ? `?${qs}` : ""}`
    );
  }

  /**
   * Get AI recommendation for a single day (for progressive loading)
   * @param {number} id - tree id
   * @param {string} forDate - date string in yyyy-MM-dd format
   * @returns {Promise} ApiClient.get promise
   */
  static async getSingleDayRecommendation(id, forDate) {
    if (!id) throw new Error("Missing tree id");
    if (!forDate) throw new Error("Missing forDate");
    return ApiClient.get(
      `/api/trees/${id}/recommendation/single?forDate=${forDate}`
    );
  }

  /**
   * Refresh AI recommendations for a tree (triggers backend to regenerate)
   * @param {number} id - tree id
   * @returns {Promise} ApiClient.post promise
   */
  static async refreshAiRecommendations(id) {
    if (!id) throw new Error("Missing tree id");
    return ApiClient.post(`/api/trees/${id}/recommendation/refresh`);
  }

  /**
   * Get tree varieties
   * @param {number} [treeTypeId] - Optional tree type ID to filter varieties
   */
  static async getTreeVarieties(treeTypeId = null) {
    const url = treeTypeId
      ? `/api/trees/varieties?treeTypeId=${treeTypeId}`
      : "/api/trees/varieties";
    return ApiClient.get(url);
  }

  /**
   * Get tree type detail by id (for public PlantDetail page)
   * Falls back to admin API if available
   */
  static async getTreeTypeById(id) {
    try {
      // Try admin API first (if user is authenticated)
      const response = await ApiClient.get(`/api/admin/tree-types/${id}`);
      if (response?.data) {
        return response;
      }
    } catch (err) {
      // If admin API fails (no auth), fall back to getting from list
      console.log("Admin API not available, using public API");
    }

    // Fallback: get from list and find by id
    const treeTypes = await ApiClient.get("/api/trees/types");
    const found = Array.isArray(treeTypes)
      ? treeTypes.find((t) => t.treeTypeId === parseInt(id))
      : null;

    return found ? { data: found } : null;
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
  static async getMyTrees({
    userId,
    page = 1,
    pageSize = 20,
    sort = "createdAt_desc",
    gardenId,
    treeTypeId,
    isActive,
  } = {}) {
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
  static async searchTrees({
    q = "",
    gardenId,
    treeTypeId,
    page = 1,
    pageSize = 20,
  } = {}) {
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

  /**
   * Get tree lifecycle information (phase, stage, cycle count)
   * @param {number} id - Tree ID
   */
  static async getLifecycle(id) {
    return ApiClient.get(`/api/trees/${id}/lifecycle`);
  }

  /**
   * Update tree lifecycle phase
   * @param {number} id - Tree ID
   * @param {Object} data - UpdateTreeLifecycleRequest
   * @param {string} data.phaseId - Phase ID: "growth_development", "flowering", "fruiting", "pre_harvest", "post_harvest"
   * @param {number} [data.cycleCount] - Optional cycle count
   * @param {boolean} [data.phase1Completed] - Optional phase 1 completed flag
   * @param {boolean} [data.autoSyncEnabled] - Enable/disable automatic lifecycle sync
   * @param {string} [data.overrideReason] - Optional note when disabling auto sync
  * @param {number} [data.stageId] - Optional TreeGrowthStages.StageId to target a specific stage definition
   */
  static async updateLifecycle(id, data) {
    return ApiClient.patch(`/api/trees/${id}/lifecycle`, data);
  }

  /**
   * Get growth stages by tree type ID (for farmers)
   * @param {number} treeTypeId
   */
  static async getStagesByTreeType(treeTypeId) {
    return ApiClient.get(`/api/trees/types/${treeTypeId}/stages`);
  }

  /**
   * Get status change history for a tree
   * @param {number} id - Tree ID
   */
  static async getStatusHistory(id) {
    if (!id) throw new Error("Missing tree id");
    return ApiClient.get(`/api/trees/${id}/status-history`);
  }
}
