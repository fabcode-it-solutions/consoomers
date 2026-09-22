"use client";

import { useState, useEffect, useCallback } from "react";

interface CSRFToken {
  token: string;
  expiresAt: number;
}

/**
 * Custom hook to manage CSRF tokens
 * Automatically fetches and refreshes tokens
 */
export function useCSRFToken() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch a new CSRF token from the server
   */
  const fetchToken = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/csrf-token", {
        method: "GET",
        credentials: "include", // Include cookies
      });

      if (!response.ok) {
        throw new Error("Failed to fetch CSRF token");
      }

      const data = await response.json();

      // Store token with expiration time
      const tokenData: CSRFToken = {
        token: data.token,
        expiresAt: Date.now() + (data.expiresIn - 60) * 1000, // Refresh 1 minute before expiry
      };

      // Store in memory
      setCSRFToken(data.token);

      // Also store in sessionStorage for persistence across components
      sessionStorage.setItem("csrf_token", JSON.stringify(tokenData));

      return data.token;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching CSRF token:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get current token or fetch a new one if expired
   */
  const getToken = useCallback(async (): Promise<string | null> => {
    // Try to get from sessionStorage first
    const storedToken = sessionStorage.getItem("csrf_token");

    if (storedToken) {
      try {
        const tokenData: CSRFToken = JSON.parse(storedToken);

        // Check if token is still valid
        if (Date.now() < tokenData.expiresAt) {
          setCSRFToken(tokenData.token);
          setLoading(false);
          return tokenData.token;
        }
      } catch (err) {
        console.error("Error parsing stored token:", err);
      }
    }

    // Fetch new token if none exists or expired
    return await fetchToken();
  }, [fetchToken]);

  /**
   * Refresh the CSRF token manually
   */
  const refreshToken = useCallback(async () => {
    sessionStorage.removeItem("csrf_token");
    return await fetchToken();
  }, [fetchToken]);

  // Fetch token on mount
  useEffect(() => {
    getToken();
  }, [getToken]);

  // Set up automatic token refresh
  useEffect(() => {
    if (!csrfToken) return;

    const storedToken = sessionStorage.getItem("csrf_token");
    if (!storedToken) return;

    try {
      const tokenData: CSRFToken = JSON.parse(storedToken);
      const timeUntilExpiry = tokenData.expiresAt - Date.now();

      // Set up refresh timer
      if (timeUntilExpiry > 0) {
        const refreshTimer = setTimeout(() => {
          refreshToken();
        }, timeUntilExpiry);

        return () => clearTimeout(refreshTimer);
      }
    } catch (err) {
      console.error("Error setting up token refresh:", err);
    }
  }, [csrfToken, refreshToken]);

  return {
    token: csrfToken,
    loading,
    error,
    getToken,
    refreshToken,
  };
}