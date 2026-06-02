import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ─────────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────────

const getBaseURL = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  // Strip trailing slashes, then append /api if it doesn't end with /api
  const cleanedUrl = url.trim().replace(/\/$/, '');
  if (!cleanedUrl.endsWith('/api')) {
    return `${cleanedUrl}/api`;
  }
  return cleanedUrl;
};

// 30s timeout — accounts for cold starts on free-tier hosting (e.g. Render)
// where the server may take up to ~30s to wake up after inactivity
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ─────────────────────────────────────────────
// Request Interceptor
// Injects the JWT Bearer token on every outgoing request
// ─────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Token may have been set by AuthContext on the defaults
    // This interceptor ensures it's always present if the cookie exists
    if (!config.headers['Authorization']) {
      // Try reading from cookie as a fallback (for SSR-adjacent calls)
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(/(?:^|; )vaultz_token=([^;]*)/);
        const token = match ? decodeURIComponent(match[1]) : null;
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// Response Interceptor
// Handles global 401 → redirect to /login
// ─────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear the stale cookie
      if (typeof document !== 'undefined') {
        document.cookie = 'vaultz_token=; Max-Age=0; path=/';
      }
      // Redirect to login (client-side)
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    // ── Retry once on timeout or network errors (handles cold starts) ──
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
    const isNetworkError = !error.response && error.code !== 'ERR_CANCELED';

    if ((isTimeout || isNetworkError) && config && !config._retryCount) {
      config._retryCount = 1;
      console.warn('[api] Request timed out or failed — retrying once...');
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;

// ─────────────────────────────────────────────
// Typed API helpers (scaffold — business logic added in Phase 2)
// ─────────────────────────────────────────────

export const apiService = {
  // Health
  checkHealth: () => api.get('/health'),

  // Auth (WordPress JWT)
  wpLogin: (email: string, password: string) =>
    api.post('/auth/wp-login', { email, password }),

  // Links
  getLinks: (params?: Record<string, unknown>) =>
    api.get('/links', { params }),
  getLinkById: (id: string) => api.get(`/links/${id}`),
  createLink: (payload: Record<string, unknown>) => api.post('/links', payload),
  updateLink: (id: string, payload: Record<string, unknown>) =>
    api.patch(`/links/${id}`, payload),
  deleteLink: (id: string) => api.delete(`/links/${id}`),

  // Analytics
  getAnalytics: (params?: Record<string, unknown>) =>
    api.get('/analytics', { params }),

  // QR Codes
  getQrCodes: (params?: Record<string, unknown>) =>
    api.get('/qr', { params }),
};
