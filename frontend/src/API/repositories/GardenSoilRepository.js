import ApiClient from "../ApiClient";

export default class GardenSoilRepository {
  /**
   * Get all garden soils
   * GET /api/gardensoils
   */
  static async getAllGardenSoils() {
    // Nếu backend của bạn dùng slugify thành /api/garden-soils
    // thì đổi path này thành "/api/garden-soils"
    return ApiClient.get("/api/gardensoils");
  }

  /**
   * Get garden soil detail by id
   * GET /api/gardensoils/{id}
   * @param {number} id
   */
  static async getGardenSoilById(id) {
    return ApiClient.get(`/api/gardensoils/${id}`);
  }

  /**
   * Get garden soils of a specific garden
   * GET /api/gardensoils/by-garden/{gardenId}
   * @param {number} gardenId
   */
  static async getGardenSoilsByGarden(gardenId) {
    return ApiClient.get(`/api/gardensoils/by-garden/${gardenId}`);
  }

  /**
   * Get garden soils for a specific tree
   * GET /api/gardensoils/by-tree/{treeId}
   * @param {number} treeId
   */
  static async getGardenSoilsByTree(treeId) {
    return ApiClient.get(`/api/gardensoils/by-tree/${treeId}`);
  }
}
