const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5241";

export default class ApiClient {
  static async get(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  static async post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(res);
  }

  static async put(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(res);
  }

  static async delete(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  static getHeaders() {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  static async handleResponse(res) {
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || res.statusText);
    }
    if (res.status === 204) return null;
    return await res.json();
  }
}
