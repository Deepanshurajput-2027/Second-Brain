import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      // 1. If the failing request is the refresh endpoint itself
      if (originalRequest.url?.includes('/auth/refresh')) {
        localStorage.clear();
        window.location.href = '/login';
        // Returning a pending promise halts the execution chain immediately. 
        // This stops React from catching the error and re-rendering/re-fetching.
        return new Promise(() => {}); 
      }

      // 2. Prevent race conditions: If already refreshing, just reject this specific request
      if (isRefreshing) {
        return Promise.reject(error);
      }

      // 3. If we haven't retried yet, lock and attempt refresh
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt the refresh
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
          const accessToken = response.data?.data?.accessToken || response.data?.accessToken;
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          }

          isRefreshing = false; // Unlock on success
          
          // Re-fire the original request
          return apiClient(originalRequest);
        } catch (refreshError) {
          isRefreshing = false; // Unlock on failure
          localStorage.clear();
          window.location.href = '/login';
          return new Promise(() => {}); // Halt execution immediately
        }
      }
    }

    // Reject any non-401 errors normally
    return Promise.reject(error);
  }
);
