import { useState, useEffect } from 'react';
import {
  Bot, Play, CheckCircle2, XCircle, Clock, RefreshCw,
  AlertCircle, Loader2, Wifi, WifiOff
} from 'lucide-react';
import { getScrapingLogs, triggerScraping, checkHealth } from '../services/api';

export default function ScrapingPage() {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [backendOk, setBackendOk] = useState(null);

  const isDemoSite = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

  const fetchData = async () => {
    setLoading(true);
    try {
      setLogs(await getScrapingLogs(30));
      setBackendOk(true);
    } catch { setBackendOk(false); }
    setLoading(false);
  };

  const pingBackend = async () => {
    try { await checkHealth(); setBackendOk(true); return true; }
    catch { setBackendOk(false); return false; }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRunScraping = async () => {
    if (isDemoSite) {
      setResult({ type: 'warning', message: 'La demo en línea no tiene backend. Ejecuta run-backend.bat + el frontend en tu PC para usar el scraping en local.' });
      return;
    }
    setRunning(true); setResult(null);
    if (!(await pingBackend())) {
      setResult({ type: 'error', message: 'El backend no responde en http://127.0.0.1:8000. Ejecuta run-backend.bat y deja esa ventana abierta, luego recarga (F5).' });
      setRunning(false); return;
    }
    try {
      const res = await triggerScraping();
      setResult({ type: 'success', message: `Scraping completado: ${res.result?.new ?? 0} nuevas convocatorias, ${res.result?.updated ?? 0} actualizadas.` });
      await fetchData();
    } catch (e) {
      setResult({ type: 'error', message: `Error: ${e?.response?.data?.detail || e?.message || 'error desconocido'}.` });
    }
    setRunning(false);
  };

  const alertStyle = (type) => {
    if (type === 'success') return { bg: 'rgba(34,197,94,0.1)', color: '#4ade80',  border: 'rgba(34,197,94,0.3)' };
    if (type === 'warning') return { bg: 'rgba(249,115,22,0.1)', color: '#fb923c', border: 'rgba(249,115,22,0.3)' };
    return                         { bg: 'rgba(239,68,68,0.1)',  color: '#f87171', border: 'rgba(239,68,68,0.3)' };
  };

  const backendStyle = () => {
    if (backendOk === true)  return { bg: 'rgba(34,197,94,0.08)', color: '#4ade80',  border: 'rgba(34,197,94,0.28)' };
    if (backendOk === false) return { bg: 'rgba(239,68,68,0.08)', color: '#f87171',  border: 'rgba(239,68,68,0.28)' };
    return                          { bg: 'rgba(148,163,184,0.06)', color: '#9ca3af', border: 'rgba(148,163,184,0.2)' };
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Estado del backend */}
      {!isDemoSite && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          padding: '14px 18px', borderRadius: 14,
          background: backendStyle().bg, border: `1px solid ${backendStyle().border}`,
          color: backendStyle().color,
        }}>
          {backendOk === true  && <Wifi     style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2 }} />}
          {backendOk === false && <WifiOff  style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2 }} />}
          {backendOk === null  && <Loader2  style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2, animation: 'spin 1s linear infinite' }} />}

          <div style={{ flex: 1, minWidth: 0 }}>
            {backendOk === true && (
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                Backend conectado —{' '}
                <span style={{ fontWeight: 400, color: '#9ca3af' }}>Todo listo para ejecutar el scraping.</span>
              </p>
            )}
            {backendOk === false && (
              <>
                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700 }}>Backend no detectado</p>
                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>
                  1) Ejecuta <strong style={{ color: '#e5e7eb' }}>run-backend.bat</strong> y deja esa ventana abierta.{' '}
                  2) Verifica en{' '}
                  <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', textDecoration: 'underline' }}>
                    127.0.0.1:8000/docs
                  </a>.{' '}
                  3) Recarga esta página (F5).
                </p>
              </>
            )}
            {backendOk === null && (
              <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>Verificando conexión con el backend…</p>
            )}
          </div>
          {backendOk !== null && (
            <button
              onClick={() => { setBackendOk(null); fetchData(); }}
              className="btn-secondary"
              style={{ padding: '6px 10px', flexShrink: 0 }}
            >
              <RefreshCw style={{ width: 13, height: 13 }} />
            </button>
          )}
        </div>
      )}

      {/* Banner demo */}
      {isDemoSite && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px', borderRadius: 14, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.28)', color: '#fb923c' }}>
          <AlertCircle style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#f9fafb' }}>Demo en línea (GitHub Pages)</p>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>
              El scraping en vivo requiere el backend local. Descarga el proyecto y ejecuta{' '}
              <strong style={{ color: '#e5e7eb' }}>run-backend.bat</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Encabezado + botón */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8, width: 'fit-content' }}>
            <span className="eyebrow-dot" />Web Scraping
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#4b5563', letterSpacing: '0.04em' }}>
            Gestión y monitoreo del scraping automatizado de convocatorias
          </p>
        </div>
        <button
          onClick={handleRunScraping}
          disabled={running}
          className="btn-primary"
          style={{ opacity: running ? 0.65 : 1 }}
        >
          {running
            ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />
            : <Play style={{ width: 15, height: 15 }} />}
          {running ? 'Ejecutando…' : 'Ejecutar Scraping'}
        </button>
      </div>

      {/* Resultado */}
      {result && (() => {
        const s = alertStyle(result.type);
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', borderRadius: 14, background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
            {result.type === 'success'
              ? <CheckCircle2 style={{ width: 17, height: 17, flexShrink: 0, marginTop: 1 }} />
              : <AlertCircle  style={{ width: 17, height: 17, flexShrink: 0, marginTop: 1 }} />}
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{result.message}</p>
          </div>
        );
      })()}

      {/* Historial */}
      <div className="card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock style={{ width: 15, height: 15, color: '#4f46e5' }} />
            <span className="panel-title">Historial de ejecuciones</span>
          </div>
          <button onClick={fetchData} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <RefreshCw style={{ width: 13, height: 13 }} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(148,163,184,0.15)', borderTopColor: '#4f46e5', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Bot style={{ width: 44, height: 44, color: '#374151', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Sin registros de scraping.</p>
            <p style={{ fontSize: 11, color: '#4b5563', marginTop: 5 }}>Pulsa "Ejecutar Scraping" para la primera ejecución.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(148,163,184,0.14)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.1)', background: 'rgba(15,23,42,0.5)' }}>
                  {['Fuente','Estado','Encontrados','Nuevos','Actualiz.','Duración','Fecha'].map((h, i) => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: i > 1 ? 'center' : i === 6 ? 'right' : 'left',
                      fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4b5563', fontWeight: 700,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                    <td style={{ padding: '10px 14px', color: '#e5e7eb', fontWeight: 600 }}>{log.fuente}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 999,
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                        background: log.estado === 'exitoso' ? 'rgba(34,197,94,0.14)' : 'rgba(239,68,68,0.14)',
                        color:      log.estado === 'exitoso' ? '#4ade80' : '#f87171',
                        border:     `1px solid ${log.estado === 'exitoso' ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
                      }}>
                        {log.estado === 'exitoso'
                          ? <CheckCircle2 style={{ width: 11, height: 11 }} />
                          : <XCircle      style={{ width: 11, height: 11 }} />}
                        {log.estado}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#6b7280' }}>{log.registros_encontrados}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#06b6d4', fontWeight: 700 }}>{log.registros_nuevos}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#a855f7', fontWeight: 600 }}>{log.registros_actualizados}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#4b5563' }}>{log.duracion_segundos?.toFixed(1)}s</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#4b5563', fontSize: 11 }}>
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
