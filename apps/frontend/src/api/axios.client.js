import axios from 'axios';

// Create an Axios instance pointing to the backend API
const axiosClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token if present
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized gracefully
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (e.g., clear token, redirect to login)
      console.warn('Unauthorized access - 401. Clearing token.');
      localStorage.removeItem('jwt_token');
      // Optionally trigger a custom event to notify the UI to redirect to /login
      window.dispatchEvent(new CustomEvent('unauthorized_access'));
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
