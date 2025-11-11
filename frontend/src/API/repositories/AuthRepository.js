import ApiClient from "../ApiClient";

export default class AuthRepository {
  static async login(email, password) {
    const res = await ApiClient.post("/api/auth/login", { email, password });
    return res.data;
  }

  static async register(data) {
    return ApiClient.post("/api/auth/register", data);
  }

  static async verifyOtp(data) {
    return ApiClient.post("/api/auth/verify-otp", data);
  }

  static async resendOtp(data) {
    return ApiClient.post("/api/auth/resend-otp", data);
  }

  static async refreshToken(refreshToken) {
    return ApiClient.post("/api/auth/refresh-token", { refreshToken });
  }

  static async me() {
    return ApiClient.get("/api/auth/me");
  }

  static async logout() {
    return ApiClient.post("/api/auth/logout");
  }
};