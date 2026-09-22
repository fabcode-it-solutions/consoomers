"use client";

interface CSRFToken {
  token: string;
  expiresAt: number;
}

/**
 * Get CSRF token from sessionStorage or fetch a new one
 */
async function getCSRFToken(): Promise<string | null> {
  // Try to get from sessionStorage
  const storedToken = sessionStorage.getItem("csrf_token");

  if (storedToken) {
    try {
      const tokenData: CSRFToken = JSON.parse(storedToken);

      // Check if token is still valid
      if (Date.now() < tokenData.expiresAt) {
        return tokenData.token;
      }
    } catch (err) {
      console.error("Error parsing stored CSRF token:", err);
    }
  }

  // Fetch new token
  try {
    const response = await fetch("/api/csrf-token", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch CSRF token");
    }

    const data = await response.json();

    // Store token
    const tokenData: CSRFToken = {
      token: data.token,
      expiresAt: Date.now() + (data.expiresIn - 60) * 1000,
    };

    sessionStorage.setItem("csrf_token", JSON.stringify(tokenData));

    return data.token;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    return null;
  }
}

/**
 * Secure fetch wrapper that automatically includes CSRF tokens
 * for state-changing requests (POST, PUT, DELETE, PATCH)
 */
export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method?.toUpperCase() || "GET";
  const stateChangingMethods = ["POST", "PUT", "DELETE", "PATCH"];

  // For state-changing requests, add CSRF token
  if (stateChangingMethods.includes(method)) {
    const csrfToken = await getCSRFToken();

    if (!csrfToken) {
      throw new Error(
        "Failed to obtain CSRF token. Please refresh the page and try again."
      );
    }

    // Add CSRF token to headers
    const headers = new Headers(options.headers);
    headers.set("X-CSRF-Token", csrfToken);

    // Ensure credentials are included
    options = {
      ...options,
      headers,
      credentials: "include",
    };
  }

  // Make the request
  const response = await fetch(url, options);

  // If CSRF validation fails, try refreshing token and retry once
  if (response.status === 403) {
    const data = await response.json().catch(() => ({}));

    if (data.error?.includes("CSRF")) {
      console.log("CSRF token expired or invalid, fetching new token...");

      // Clear stored token
      sessionStorage.removeItem("csrf_token");

      // Get new token
      const newToken = await getCSRFToken();

      if (newToken && stateChangingMethods.includes(method)) {
        // Retry request with new token
        const headers = new Headers(options.headers);
        headers.set("X-CSRF-Token", newToken);

        return fetch(url, {
          ...options,
          headers,
          credentials: "include",
        });
      }
    }
  }

  return response;
}

/**
 * Helper functions for common HTTP methods with CSRF protection
 */
export const secureAPI = {
  /**
   * Secure GET request
   */
  get: async (url: string, options: RequestInit = {}) => {
    return secureFetch(url, { ...options, method: "GET" });
  },

  /**
   * Secure POST request
   */
  post: async (url: string, body?: unknown, options: RequestInit = {}) => {
    return secureFetch(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * Secure PUT request
   */
  put: async (url: string, body?: unknown, options: RequestInit = {}) => {
    return secureFetch(url, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * Secure PATCH request
   */
  patch: async (url: string, body?: unknown, options: RequestInit = {}) => {
    return secureFetch(url, {
      ...options,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * Secure DELETE request
   */
  delete: async (url: string, options: RequestInit = {}) => {
    return secureFetch(url, { ...options, method: "DELETE" });
  },
};