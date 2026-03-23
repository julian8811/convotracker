import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ExternalLink, Clock, MapPin, DollarSign, Trash2, LogIn, Search } from 'lucide-react';
import { getFavorites, removeFavorite, getToken } from '../services/api';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const isLoggedIn = !!getToken();

  useEffect(() => {
    if (isLoggedIn) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch (err) {
      setError('Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (favoriteId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeFavorite(favoriteId);
      setFavorites(favorites.filter(f => f.id !== favoriteId));
    } catch (err) {
      alert('Error al eliminar favorito');
    }
  };

  const formatDiasRestantes = (fechaCierre) => {
    if (!fechaCierre) return null;
    const cierre = new Date(fechaCierre);
    const ahora = new Date();
    const dias = Math.ceil((cierre - ahora) / (1000 * 60 * 60 * 24));
    if (dias < 0) return { text: `Venció hace ${Math.abs(dias)} días`, urgent: false, vencida: true };
    if (dias === 0) return { text: 'Vence hoy', urgent: true, vencida: false };
    if (dias === 1) return { text: 'Vence mañana', urgent: true, vencida: false };
    if (dias <= 7) return { text: `${dias} días restantes`, urgent: true, vencida: false };
    return { text: `${dias} días restantes`, urgent: false, vencida: false };
  };

  if (!isLoggedIn) {
    return (
      <div className="mx-auto flex flex-col gap-6" style={{ maxWidth: 600, padding: '0 12px' }}>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
            background: 'rgba(234,179,8,0.12)',
            border: '1px solid rgba(234,179,8,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Star style={{ width: 36, height: 36, color: '#eab308' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb', marginBottom: 10 }}>
            Inicia sesión para ver tus favoritos
          </h2>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>
            Guarda las convocatorias que te interesen y accede a ellas rápidamente desde cualquier dispositivo.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
              <LogIn style={{ width: 16, height: 16 }} />
              Iniciar sesión
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(148,163,184,0.15)', borderTopColor: '#4f46e5', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex flex-col gap-5" style={{ maxWidth: 900, padding: '0 12px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8, width: 'fit-content' }}>
            <span className="eyebrow-dot" />
            Mis Favoritos
          </div>
          <p style={{ fontSize: 12, color: '#6b7280' }}>
            {favorites.length} {favorites.length === 1 ? 'convocatoria guardada' : 'convocatorias guardadas'}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card" style={{ padding: '14px 18px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}>
          <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Empty state */}
      {favorites.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
            background: 'rgba(148,163,184,0.08)',
            border: '1px solid rgba(148,163,184,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Star style={{ width: 36, height: 36, color: '#6b7280' }} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#f9fafb', marginBottom: 8 }}>
            No tienes favoritos aún
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
            Agrega convocatorias a favoritos desde la lista o el detalle.
          </p>
          <Link to="/convocatorias" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            <Search style={{ width: 16, height: 16 }} />
            Explorar convocatorias
          </Link>
        </div>
      )}

      {/* Lista de favoritos */}
      {favorites.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {favorites.map((fav) => {
            const diasInfo = formatDiasRestantes(fav.fecha_cierre);
            
            return (
              <Link
                key={fav.id}
                to={`/convocatorias/${fav.convocatoria_id}`}
                className="card"
                style={{
                  padding: '16px 18px',
                  textDecoration: 'none',
                  display: 'block',
                  borderLeft: diasInfo?.urgent && !diasInfo?.vencida ? '3px solid #facc15' :
                            diasInfo?.vencida ? '3px solid #f87171' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Badges */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 8px', borderRadius: 999,
                        fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                        background: fav.estado === 'abierta' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        color: fav.estado === 'abierta' ? '#4ade80' : '#f87171',
                        border: `1px solid ${fav.estado === 'abierta' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      }}>
                        {fav.estado}
                      </span>
                      {diasInfo && !diasInfo.vencida && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '2px 8px', borderRadius: 999,
                          fontSize: 10, fontWeight: 600,
                          background: diasInfo.urgent ? 'rgba(250,204,21,0.12)' : 'rgba(34,197,94,0.1)',
                          color: diasInfo.urgent ? '#facc15' : '#4ade80',
                        }}>
                          <Clock style={{ width: 10, height: 10 }} />
                          {diasInfo.text}
                        </span>
                      )}
                    </div>

                    {/* Título */}
                    <p style={{
                      margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: '#f9fafb',
                      lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {fav.titulo}
                    </p>

                    {/* Meta */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 11, color: '#6b7280' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 10 }}>📍</span>
                        {fav.entidad} · {fav.pais}
                      </span>
                      {fav.fecha_cierre && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock style={{ width: 10, height: 10 }} />
                          {new Date(fav.fecha_cierre).toLocaleDateString('es-CO')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  <button
                    onClick={(e) => handleRemove(fav.id, e)}
                    style={{
                      padding: 8, borderRadius: 8, flexShrink: 0,
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      color: '#f87171', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    title="Quitar de favoritos"
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
