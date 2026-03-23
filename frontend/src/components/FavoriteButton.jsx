import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { getFavorites, addFavorite, removeFavorite, getToken } from '../services/api';

export default function FavoriteButton({ convocatoriaId, size = 'default' }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfFavorite();
  }, [convocatoriaId]);

  const checkIfFavorite = async () => {
    if (!getToken()) return;
    
    try {
      const favorites = await getFavorites();
      const existing = favorites.find(f => f.convocatoria_id === Number(convocatoriaId));
      if (existing) {
        setIsFavorite(true);
        setFavoriteId(existing.id);
      }
    } catch (err) {
      // Silently fail - user might not be logged in
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!getToken()) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setLoading(true);
    try {
      if (isFavorite && favoriteId) {
        await removeFavorite(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
      } else {
        const result = await addFavorite(convocatoriaId);
        setIsFavorite(true);
        setFavoriteId(result.id);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === 'small' ? 14 : 18;
  const buttonPadding = size === 'small' ? 6 : 8;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        padding: buttonPadding,
        borderRadius: 8,
        transition: 'all 200ms ease',
        background: isFavorite ? 'rgba(234,179,8,0.12)' : 'rgba(148,163,184,0.06)',
        border: `1px solid ${isFavorite ? 'rgba(234,179,8,0.3)' : 'rgba(148,163,184,0.15)'}`,
        color: isFavorite ? '#eab308' : '#6b7280',
        cursor: loading ? 'wait' : 'pointer',
        opacity: loading ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Star 
        style={{ 
          width: iconSize, 
          height: iconSize,
          fill: isFavorite ? 'currentColor' : 'none',
        }} 
      />
    </button>
  );
}
