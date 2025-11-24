const API_BASE = import.meta.env.VITE_API_BASE || "https://localhost:7237";

export default class ApiClient {
  static async get(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  static async post(path, body, isFormData = false) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: this.getHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });
    return this.handleResponse(res);
  }

  static async put(path, body, raw = false) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: raw ? body : JSON.stringify(body),
    });
    return this.handleResponse(res);
  }

  static async patch(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PATCH",
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

  static getHeaders(isFormData = false) {
    const token = localStorage.getItem("token");
    const headers = {
    };

    if (!isFormData) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  static async handleResponse(res) {
    if (!res.ok) {
      let errorMessage = res.statusText;
      // Clone the response so we can read it multiple times
      const clonedRes = res.clone();
      try {
        const errorData = await clonedRes.json();
        console.log(errorData);
        errorMessage = errorData.message || errorData.Message || errorMessage;
      } catch {
        // If not JSON, try to read as text from the original response
        try {
          errorMessage = await res.text() || errorMessage;
        } catch {
          // If reading text also fails, use status text
          errorMessage = res.statusText;
        }
      }
      const error = new Error(errorMessage);
      error.status = res.status;
      error.statusText = res.statusText;
      throw error;
    }
    if (res.status === 204) return null;
    return await res.json();
  }
}
