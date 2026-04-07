import axios from 'axios';

/**
 * URL base de la API.
 * - En producción/GitHub Pages: usa VITE_API_URL si está definido.
 * - En desarrollo local: siempre usa ruta relativa (/api/v1) para que el proxy
 *   de Vite reenvíe las peticiones al backend. Esto evita cualquier problema de CORS.
 */
function getApiBase() {
  if (import.meta.env.VITE_API_URL) {
    return `${String(import.meta.env.VITE_API_URL).replace(/\/$/, '')}/api/v1`;
  }
  return '/api/v1';
}

const api = axios.create({
  baseURL: getApiBase(),
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Token storage keys
const TOKEN_KEY = 'convotracker_token';

// Get token from localStorage
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Set token in localStorage
export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Clear token (logout)
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Axios interceptor to add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios interceptor to handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      // Optionally redirect to login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getConvocatorias = (params = {}) =>
  api.get('/convocatorias', { params }).then(r => r.data);

export const getConvocatoria = (id) =>
  api.get(`/convocatorias/${id}`).then(r => r.data);

export const getFilterOptions = () =>
  api.get('/filters/options').then(r => r.data);

export const getDashboardStats = () =>
  api.get('/dashboard/stats').then(r => r.data);

export const getScrapingLogs = (limit = 50) =>
  api.get('/scraping/logs', { params: { limit } }).then(r => r.data);

export const triggerScraping = () =>
  api.post('/scraping/run').then(r => r.data);

export const cleanupExpiredConvocatorias = () =>
  api.post('/admin/cleanup-expired').then(r => r.data);

export const getScrapingSources = () =>
  api.get('/scraping/sources').then(r => r.data);

/**
 * Comprueba si el backend está en marcha.
 * En producción (VITE_API_URL definido) usa esa base + /health.
 * En local usa http://127.0.0.1:8000/health para no depender del proxy.
 */
export const checkHealth = () => {
  const base = getApiBase();
  const healthUrl = base.startsWith('http')
    ? base.replace(/\/api\/v1\/?$/, '') + '/health'
    : 'http://127.0.0.1:8000/health';
  return axios.get(healthUrl, { timeout: 8000 }).then(r => r.data);
};

export const downloadConvocatoriaPdf = (id) => {
  const base = api.defaults.baseURL || getApiBase();
  const url = base.startsWith('http')
    ? `${base}/reports/convocatoria/${id}`
    : `${window.location.origin}${base}/reports/convocatoria/${id}`;
  window.open(url, '_blank');
};

export const downloadAllPdf = () => {
  const base = api.defaults.baseURL || getApiBase();
  const url = base.startsWith('http')
    ? `${base}/reports/all`
    : `${window.location.origin}${base}/reports/all`;
  window.open(url, '_blank');
};

// ============ Auth API ============

export const register = (userData) =>
  api.post('/auth/register', userData).then(r => r.data);

export const login = (credentials) =>
  api.post('/auth/login', credentials).then(r => r.data);

export const getMe = () =>
  api.get('/auth/me').then(r => r.data);

export const logout = () => {
  clearToken();
};

// ============ Favorites API ============

export const getFavorites = () =>
  api.get('/favorites').then(r => r.data);

export const addFavorite = (convocatoriaId) =>
  api.post('/favorites', { convocatoria_id: convocatoriaId }).then(r => r.data);

export const removeFavorite = (favoriteId) =>
  api.delete(`/favorites/${favoriteId}`).then(r => r.data);

export default api;
