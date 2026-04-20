import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',   // ← add this line
  },
});


// Request interceptor — attach JWT token when available (client-side only)
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      // headers can be AxiosHeaders or plain object; use string index assignment
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — handle 401 by attempting token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config?: InternalAxiosRequestConfig }) => {
    const status = error.response?.status;
    const originalConfig = error.config;

    if (status === 401 && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const resp = await axios.post(`${BASE_URL}/v1/auth/refresh`, { refreshToken });
          const newToken = resp.data?.data?.accessToken as string | undefined;
          if (newToken) {
            localStorage.setItem('accessToken', newToken);
            if (originalConfig) {
              originalConfig.headers = originalConfig.headers || {};
              (originalConfig.headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
              return api(originalConfig);
            }
          }
        } catch {
          // Refresh failed — clear storage and redirect to login
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
