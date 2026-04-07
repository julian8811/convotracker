import { Link } from 'react-router-dom';
import { AlertTriangle, Home, Search, RefreshCw } from 'lucide-react';

export default function ErrorPage({ error }) {
  return (
    <div className="mx-auto flex flex-col gap-6" style={{ maxWidth: 500, padding: '0 12px', textAlign: 'center' }}>
      <div style={{ padding: '60px 20px' }}>
        {/* Error visual */}
        <div style={{
          position: 'relative', marginBottom: 32,
        }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', margin: '0 auto',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(239,68,68,0.15)',
          }}>
            <AlertTriangle style={{ width: 48, height: 48, color: '#f87171' }} />
          </div>
        </div>

        <h1 style={{
          fontSize: 24, fontWeight: 700, color: '#f9fafb',
          marginBottom: 12, letterSpacing: '-0.02em',
        }}>
          Algo salió mal
        </h1>

        <p style={{
          fontSize: 14, color: '#6b7280', marginBottom: 32,
          lineHeight: 1.7,
        }}>
          {error || 'Ocurrió un error inesperado. Por favor intenta de nuevo.'}
          <br />
          <span style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
            Si el problema persiste, contacta al administrador.
          </span>
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 20px', borderRadius: 12,
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: '#3b82f6', fontSize: 13, fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <RefreshCw style={{ width: 16, height: 16 }} />
            Reintentar
          </button>
          
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>
            <Home style={{ width: 16, height: 16 }} />
            Ir al inicio
          </Link>
          
          <Link to="/convocatorias" className="btn-secondary" style={{ textDecoration: 'none' }}>
            <Search style={{ width: 16, height: 16 }} />
            Ver convocatorias
          </Link>
        </div>
      </div>
    </div>
  );
}
