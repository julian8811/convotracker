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

export default api;
