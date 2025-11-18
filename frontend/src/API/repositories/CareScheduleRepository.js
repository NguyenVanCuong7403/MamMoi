import ApiClient from "../ApiClient";

export default class CareScheduleRepository {
  /**
   * Add new care task
   * POST: /api/careschedules/add
   * @param {Object} data - CreateCareTaskDto
   */
  static async addCareTask(data) {
    return ApiClient.post("/api/careschedules/add", data);
  }

  /**
   * Get task detail by ID
   * GET: /api/careschedules/{scheduleId}
   * @param {number} scheduleId
   */
  static async getTaskDetail(scheduleId) {
    return ApiClient.get(`/api/careschedules/${scheduleId}`);
  }

  /**
   * Edit care task
   * PUT: /api/careschedules/{scheduleId}
   * @param {number} scheduleId
   * @param {Object} data - EditCareTaskDto
   */
  static async editCareTask(scheduleId, data) {
    return ApiClient.put(`/api/careschedules/${scheduleId}`, data);
  }

  /**
   * Delete care task
   * DELETE: /api/careschedules/{scheduleId}
   * @param {number} scheduleId
   */
  static async deleteCareTask(scheduleId) {
    return ApiClient.delete(`/api/careschedules/${scheduleId}`);
  }

  /**
   * Mark task as complete
   * POST: /api/careschedules/{scheduleId}/complete
   * @param {number} scheduleId
   * @param {Object} data - MarkTaskCompleteDto
   */
  static async markTaskComplete(scheduleId, data) {
    return ApiClient.post(`/api/careschedules/${scheduleId}/complete`, data);
  }

  /**
   * Get all tasks for today (optional filter by treeId)
   * GET: /api/careschedules/today
   * @param {number} [treeId]
   */
  static async getTodayTasks(treeId) {
    const params = new URLSearchParams();
    if (typeof treeId === "number" && treeId > 0) {
      params.append("treeId", treeId);
      return ApiClient.get(`/api/careschedules/today?${params.toString()}`);
    }
    return ApiClient.get("/api/careschedules/today");
  }

  /**
   * Search care tasks with filters
   * GET: /api/careschedules/search
   * @param {Object} options
   * @param {number} [options.treeId]
   * @param {string} [options.taskType]
   * @param {string} [options.status]
   * @param {string} [options.priority]
   * @param {string} [options.dateFrom] - YYYY-MM-DD
   * @param {string} [options.dateTo] - YYYY-MM-DD
   * @param {string} [options.searchKeyword]
   * @param {number} [options.pageNumber=1]
   * @param {number} [options.pageSize=10]
   */
  static async searchTasks({
    treeId,
    taskType,
    status,
    priority,
    dateFrom,
    dateTo,
    searchKeyword,
    pageNumber = 1,
    pageSize = 10,
  } = {}) {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber);
    params.append("pageSize", pageSize);

    if (typeof treeId === "number" && treeId > 0) params.append("treeId", treeId);
    if (taskType) params.append("taskType", taskType);
    if (status) params.append("status", status);
    if (priority) params.append("priority", priority);
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    if (searchKeyword) params.append("searchKeyword", searchKeyword);

    return ApiClient.get(`/api/careschedules/search?${params.toString()}`);
  }

  /**
   * Get all tasks for a specific tree
   * GET: /api/careschedules/tree/{treeId}
   * @param {number} treeId
   */
  static async getTasksByTree(treeId) {
    return ApiClient.get(`/api/careschedules/tree/${treeId}`);
  }

  /**
   * Get all pending tasks
   * GET: /api/careschedules/pending
   */
  static async getPendingTasks() {
    return ApiClient.get("/api/careschedules/pending");
  }
}
