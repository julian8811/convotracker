import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/v1`
  : '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
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

export const downloadConvocatoriaPdf = (id) => {
  window.open(`${API_BASE}/reports/convocatoria/${id}`, '_blank');
};

export const downloadAllPdf = () => {
  window.open(`${API_BASE}/reports/all`, '_blank');
};

export default api;
