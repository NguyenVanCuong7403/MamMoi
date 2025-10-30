import ApiClient from "../ApiClient";
import User from "../models/User";

export default class UserRepository {
  static async getAll() {
    const data = await ApiClient.get("/api/users");
    return data.map((u) => new User(u));
  }

  static async getById(id) {
    const data = await ApiClient.get(`/api/users/${id}`);
    return new User(data);
  }

  static async register(fullName, email, password) {
    const data = await ApiClient.post("/api/auth/register", {
      fullName,
      email,
      password,
    });
    return data;
  }

  static async login(email, password) {
    const data = await ApiClient.post("/api/auth/login", { email, password });
    if (data.token) localStorage.setItem("token", data.token);
    return data.user ? new User(data.user) : null;
  }

  static logout() {
    localStorage.removeItem("token");
  }
}
