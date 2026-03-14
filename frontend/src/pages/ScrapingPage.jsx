import { useState, useEffect } from 'react';
import {
  Bot, Play, CheckCircle2, XCircle, Clock, RefreshCw,
  Globe, AlertCircle, Loader2
} from 'lucide-react';
import { getScrapingLogs, triggerScraping, getScrapingSources } from '../services/api';

export default function ScrapingPage() {
  const [logs, setLogs] = useState([]);
  const [sources, setSources] = useState([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsData, sourcesData] = await Promise.all([
        getScrapingLogs(30),
        getScrapingSources(),
      ]);
      setLogs(logsData);
      setSources(sourcesData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleRunScraping = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await triggerScraping();
      setResult({ type: 'success', message: `Scraping completado: ${res.result?.new || 0} nuevas, ${res.result?.updated || 0} actualizadas` });
      await fetchData();
    } catch (e) {
      setResult({ type: 'error', message: 'Error al ejecutar el scraping' });
    }
    setRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Web Scraping</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión y monitoreo del scraping automatizado</p>
        </div>
        <button
          onClick={handleRunScraping}
          disabled={running}
          className="btn-primary flex items-center gap-2 disabled:opacity-60"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? 'Ejecutando...' : 'Ejecutar Scraping'}
        </button>
      </div>

      {result && (
        <div className={`rounded-lg p-4 flex items-center gap-3 ${result.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {result.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{result.message}</span>
        </div>
      )}

      {/* Sources */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-brand-500" /> Fuentes Configuradas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((s, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-1">{s.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{s.country}</p>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline truncate block">
                {s.url}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-500" /> Historial de Ejecuciones
          </h2>
          <button onClick={fetchData} className="btn-secondary p-2" title="Refrescar">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay registros de scraping todavía</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Fuente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Estado</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Encontrados</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Nuevos</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Actualiz.</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Duración</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{log.fuente}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${log.estado === 'exitoso' ? 'badge-open' : 'badge-closed'}`}>
                        {log.estado === 'exitoso' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {log.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">{log.registros_encontrados}</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-medium">{log.registros_nuevos}</td>
                    <td className="py-3 px-4 text-center text-amber-600">{log.registros_actualizados}</td>
                    <td className="py-3 px-4 text-right text-gray-500">{log.duracion_segundos?.toFixed(1)}s</td>
                    <td className="py-3 px-4 text-right text-gray-400 text-xs">
                      {new Date(log.ejecutado_en).toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
