import ApiClient from "../ApiClient";

export default class AuthRepository {
  static async login(email, password) {
    return ApiClient.post("/api/auth/login", { email, password });
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

  static async forgotPassword(email) {
    return ApiClient.post("/api/auth/forgot-password", { email });
  }

  static async resetPassword(data) {
    return ApiClient.post("/api/auth/reset-password", data);
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

  static async loginWithGoogle(idToken) {
    return ApiClient.post("/api/auth/google-login", { idToken });
  }
};