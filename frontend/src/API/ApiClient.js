// Default API base — override with `VITE_API_BASE` in your env.
// Keep default as the local backend HTTPS dev URL used by this project.
const API_BASE = import.meta.env.VITE_API_BASE || "https://localhost:7237";

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let refreshPromise = null;

export default class ApiClient {
  static async get(path) {
    return this.requestWithRetry(path, {
      method: "GET",
      headers: this.getHeaders(),
    });
  }

  static async post(path, body, isFormData = false) {
    const options = {
      method: "POST",
      headers: this.getHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body),
    };
    // Store isFormData for retry
    options._isFormData = isFormData;
    return this.requestWithRetry(path, options);
  }

  static async put(path, body, raw = false) {
    return this.requestWithRetry(path, {
      method: "PUT",
      headers: this.getHeaders(),
      body: raw ? body : JSON.stringify(body),
    });
  }

  static async patch(path, body) {
    return this.requestWithRetry(path, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
  }

  static async delete(path) {
    return this.requestWithRetry(path, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
  }

  static async requestWithRetry(path, options) {
    // Debug: log the full URL being requested so we can diagnose malformed base URLs
    try {
      // Keep this as debug only to avoid noisy logs in production
      // eslint-disable-next-line no-console
      console.debug("ApiClient -> requesting:", `${API_BASE}${path}`);
    } catch {}

    let res = await fetch(`${API_BASE}${path}`, options);

    // If 401 and not already refreshing, try to refresh token
    if (res.status === 401 && !isRefreshing) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        // Retry the original request with new token
        const isFormData =
          options._isFormData || options.body instanceof FormData;
        options.headers = this.getHeaders(isFormData);
        // Remove internal flag
        delete options._isFormData;
        res = await fetch(`${API_BASE}${path}`, options);
      }
    }

    return this.handleResponse(res);
  }

  static async tryRefreshToken() {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing && refreshPromise) {
      return await refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const token = localStorage.getItem("token");

        // If no refresh token AND no token (guest user), don't redirect to auth
        // Just return false and let the error propagate normally
        if (!refreshToken) {
          console.warn("No refresh token available");
          // Only redirect if user WAS logged in (had a token)
          if (token) {
            this.handleAuthFailure();
          }
          return false;
        }

        // Import AuthRepository dynamically to avoid circular dependency
        const AuthRepository = (await import("./repositories/AuthRepository"))
          .default;
        const response = await AuthRepository.refreshToken(refreshToken);

        if (response?.success && response?.data?.accessToken) {
          // Update token in localStorage
          localStorage.setItem("token", response.data.accessToken);
          if (response.data.refreshToken) {
            localStorage.setItem("refreshToken", response.data.refreshToken);
          }
          console.log("Token refreshed successfully");
          return true;
        } else {
          console.warn("Token refresh failed:", response?.message);
          // Only redirect if user was logged in (had a token)
          const hadToken = localStorage.getItem("token");
          if (hadToken) {
            this.handleAuthFailure();
          }
          return false;
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
        // Only redirect if user was logged in (had a token)
        const hadToken = localStorage.getItem("token");
        if (hadToken) {
          this.handleAuthFailure();
        }
        return false;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return await refreshPromise;
  }

  static handleAuthFailure() {
    // Clear tokens and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Dispatch event to notify AuthContext
    window.dispatchEvent(new CustomEvent("auth:token-expired"));

    // Redirect to login page if not already there
    if (window.location.pathname !== "/auth") {
      window.location.href = "/auth";
    }
  }

  static getHeaders(isFormData = false) {
    const token = localStorage.getItem("token");
    const headers = {};

    if (!isFormData) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  static async handleResponse(res) {
    if (!res.ok) {
      let errorMessage = res.statusText || "Request failed";
      let errorDetails = "";

      // Clone the response so we can read it multiple times
      const clonedRes = res.clone();
      try {
        const errorData = await clonedRes.json();
        console.log(errorData);

        // Common API error shapes (ProblemDetails / custom)
        const candidates = [
          errorData?.message,
          errorData?.Message,
          errorData?.error,
          errorData?.title,
          errorData?.detail,
          errorData?.error_description,
        ].filter(Boolean);

        if (candidates.length > 0) {
          errorMessage = candidates[0];
        }

        // ASP.NET validation errors usually live under `errors`
        const errorsBag = errorData?.errors || errorData?.Errors;
        if (errorsBag && typeof errorsBag === "object") {
          const flattened = Object.values(errorsBag)
            .flat()
            .filter(Boolean)
            .join("\n");
          if (flattened) errorDetails = flattened;
        }

        // If the payload itself is a string/array, surface it
        if (!errorMessage && typeof errorData === "string") {
          errorMessage = errorData;
        } else if (
          !errorMessage &&
          Array.isArray(errorData) &&
          errorData.length > 0
        ) {
          errorMessage = errorData.join("\n");
        }
        // Preserve the raw errors object so callers can map field-level errors
        var validationObject = null;
        if (errorsBag && typeof errorsBag === "object") {
          validationObject = errorsBag;
        }
      } catch {
        // If not JSON, try to read as text from the original response
        try {
          const text = await res.text();
          if (text) errorMessage = text;
        } catch {
          // If reading text also fails, use status text
          errorMessage = res.statusText || "Request failed";
        }
      }

      // Combine base message + detailed validation errors if present
      if (errorDetails) {
        errorMessage = `${errorMessage}\n${errorDetails}`;
      }

      const error = new Error(errorMessage.trim());
      error.status = res.status;
      error.statusText = res.statusText;
      // Attach parsed validation object (if any) and raw error payload
      if (typeof validationObject === "object" && validationObject !== null) {
        error.validation = validationObject;
      }
      try {
        // also attach the full parsed payload for advanced handling
        error.errorData = validationObject || (await clonedRes.json());
      } catch {
        // ignore
      }
      throw error;
    }
    if (res.status === 204) return null;
    return await res.json();
  }
}
