import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex flex-col gap-6" style={{ maxWidth: 500, padding: '0 12px', textAlign: 'center' }}>
      <div style={{ padding: '60px 20px' }}>
        {/* 404 visual */}
        <div style={{
          position: 'relative', marginBottom: 32,
        }}>
          <span style={{
            fontSize: 120, fontWeight: 900, lineHeight: 1,
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4, #a855f7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(79,70,229,0.3))',
          }}>
            404
          </span>
        </div>

        <h1 style={{
          fontSize: 24, fontWeight: 700, color: '#f9fafb',
          marginBottom: 12, letterSpacing: '-0.02em',
        }}>
          Página no encontrada
        </h1>

        <p style={{
          fontSize: 14, color: '#6b7280', marginBottom: 32,
          lineHeight: 1.7,
        }}>
          La página que buscas no existe o fue movida.
          Puede que el enlace esté roto o la URL sea incorrecta.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 20px', borderRadius: 12,
              background: 'rgba(148,163,184,0.08)',
              border: '1px solid rgba(148,163,184,0.2)',
              color: '#9ca3af', fontSize: 13, fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Volver atrás
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
