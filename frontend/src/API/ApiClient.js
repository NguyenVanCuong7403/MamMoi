const API_BASE = import.meta.env.VITE_API_BASE || "https://localhost:7237";

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
      let errorMessage = res.statusText;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.Message || errorMessage;
      } catch {
        // If not JSON, use text
        errorMessage = await res.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }
    if (res.status === 204) return null;
    return await res.json();
  }
}
