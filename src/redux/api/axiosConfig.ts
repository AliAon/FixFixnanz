"use client";
import axios, { AxiosInstance } from "axios";
import {
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
} from "@/utils/auth";

// Types
interface RequestConfig {
  url: string;
  method: string;
  params?: Record<string, unknown>;
  data?: unknown;
}

// Cache for pending requests to prevent duplicates
const pendingRequests = new Map<string, Promise<unknown>>();

// Generate a unique key for request caching
const generateRequestKey = (config: RequestConfig): string => {
  const { url, method, params, data } = config;
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
};

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
    "ngrok-skip-browser-warning": "true",
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = getLocalStorage("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request deduplication for GET requests
    if (config.method === 'get') {
      const requestKey = generateRequestKey({
        url: config.url || '',
        method: config.method,
        params: config.params
      });

      // If the same request is already pending, return the existing promise
      if (pendingRequests.has(requestKey)) {
        return Promise.reject({
          isDeduped: true,
          originalRequest: pendingRequests.get(requestKey)
        });
      }
    }

    // Add a small delay for post-login requests to ensure tokens are properly set
    if (config.url?.includes('/customers/profile/') && !token) {
      // If making a profile request but no token exists, this might be a race condition
      // Return a rejected promise to prevent 401 errors during login flow
      return Promise.reject({
        isLoginFlow: true,
        message: 'Token not yet available, preventing race condition'
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    // Clear the pending request cache for this request
    if (response.config.method === 'get') {
      const requestKey = generateRequestKey({
        url: response.config.url || '',
        method: response.config.method,
        params: response.config.params
      });
      pendingRequests.delete(requestKey);
    }
    return response;
  },
  async (error) => {
    // Handle login flow race conditions
    if (error.isLoginFlow) {
      // This is a race condition during login flow, silently reject without causing logout
      return Promise.reject(error);
    }

    // Handle deduped requests
    if (error.isDeduped && error.originalRequest) {
      try {
        return await error.originalRequest;
      } catch (dedupedError) {
        return Promise.reject(dedupedError);
      }
    }

    const originalRequest = error.config;

    // Clear pending request on error
    if (originalRequest?.method === 'get') {
      const requestKey = generateRequestKey({
        url: originalRequest.url || '',
        method: originalRequest.method,
        params: originalRequest.params
      });
      pendingRequests.delete(requestKey);
    }

    // Check if this is a login request - don't interfere with login flow
    if (originalRequest?.url?.includes("/auth/login") || 
        originalRequest?.url?.includes("/auth/register") ||
        originalRequest?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // DISABLED: Token refresh logic to prevent automatic logout after login
    // This was causing immediate logout after successful login due to race conditions
    if (false && error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        // Get current token and refresh token
        const currentToken = getLocalStorage("token");
        const refreshToken = getLocalStorage("refreshToken");
        
        // If we have a fresh token (login just happened), don't redirect immediately
        if (!refreshToken) {
          // Only redirect to login if we're not in the middle of a login flow
          // and if we don't have a valid token that was just set
          if (typeof window !== "undefined" && 
              !currentToken && 
              !window.location.pathname.includes('/login')) {
            console.log('No refresh token found, redirecting to login');
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        // Update the stored tokens
        const newToken = response.data.access_token;
        setLocalStorage("token", newToken);
        if (response.data.refresh_token) {
          setLocalStorage("refreshToken", response.data.refresh_token);
        }

        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.log('Token refresh failed:', refreshError);
        
        // If token refresh fails, log out and redirect to login
        removeLocalStorage("token");
        removeLocalStorage("refreshToken");
        removeLocalStorage("user");
        
        // Only redirect if we're not already on login page
        if (typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
          console.log('Token refresh failed, redirecting to login');
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Enhanced API request method with caching
const makeRequest = async <T>(config: RequestConfig): Promise<T> => {
  if (config.method === 'GET') {
    const requestKey = generateRequestKey(config);
    
    // Check if request is already pending
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey) as Promise<T>;
    }

    // Create new request and cache it
    const request = api.request(config).then(response => response.data);
    pendingRequests.set(requestKey, request);
    
    try {
      const result = await request;
      pendingRequests.delete(requestKey);
      return result;
    } catch (error) {
      pendingRequests.delete(requestKey);
      throw error;
    }
  }

  // For non-GET requests, make normal request
  const response = await api.request(config);
  return response.data;
};

export default api;
export { makeRequest };
