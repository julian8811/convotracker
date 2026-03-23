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
      window.location.href = '/login';
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

  const iconSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';
  const buttonPadding = size === 'small' ? 'p-1' : 'p-2';

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${buttonPadding} rounded-full hover:bg-yellow-50 transition-colors ${
        isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
      } ${loading ? 'opacity-50 cursor-wait' : ''}`}
      title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Star className={`${iconSize} ${isFavorite ? 'fill-current' : ''}`} />
    </button>
  );
}
