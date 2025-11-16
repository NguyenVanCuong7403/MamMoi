import ApiClient from "../ApiClient";

export default class WeatherRepository {
  /**
   * Get current weather by coordinates
   * @param {number} lat
   * @param {number} lon
   */
  static async getCurrent(lat, lon) {
    const params = new URLSearchParams({ lat, lon });
    return ApiClient.get(`/api/weather/current?${params.toString()}`);
  }

  /**
   * Get weather forecast by coordinates
   * @param {number} lat
   * @param {number} lon
   * @param {number} range - in hours, default 72
   */
  static async getForecast(lat, lon, range = 72) {
    const params = new URLSearchParams({ lat, lon, range });
    return ApiClient.get(`/api/weather/forecast?${params.toString()}`);
  }

  /**
   * Get weather alerts by coordinates
   * @param {number} lat
   * @param {number} lon
   */
  static async getAlerts(lat, lon) {
    const params = new URLSearchParams({ lat, lon });
    return ApiClient.get(`/api/weather/alerts?${params.toString()}`);
  }

  /**
   * Set tree location
   * @param {number} treeId
   * @param {Object} data - SetTreeLocationRequest
   */
  static async setTreeLocation(treeId, data) {
    return ApiClient.put(`/api/weather/trees/${treeId}/location`, data);
  }

  /**
   * Save current weather to history
   * @param {number} treeId
   * @param {Object} data - CurrentWeatherDto
   */
  static async saveHistory(treeId, data) {
    const params = new URLSearchParams({ treeId });
    return ApiClient.post(`/api/weather/history/save?${params.toString()}`, data);
  }

  /**
   * Get current weather by location string
   * @param {string} location
   */
  static async getCurrentByLocation(location) {
    const params = new URLSearchParams({ location });
    return ApiClient.get(`/api/weather/current/by-location?${params.toString()}`);
  }

  /**
   * Get forecast by location string
   * @param {string} location
   * @param {number} range - in hours, default 72
   */
  static async getForecastByLocation(location, range = 72) {
    const params = new URLSearchParams({ location, range });
    return ApiClient.get(`/api/weather/forecast/by-location?${params.toString()}`);
  }

  /**
   * Get alerts by location string
   * @param {string} location
   */
  static async getAlertsByLocation(location) {
    const params = new URLSearchParams({ location });
    return ApiClient.get(`/api/weather/alerts/by-location?${params.toString()}`);
  }

  /**
   * Get current weather by gardenId
   * @param {number} gardenId
   */
  static async getCurrentByGarden(gardenId) {
    return ApiClient.get(`/api/weather/current/by-garden/${gardenId}`);
  }
}
