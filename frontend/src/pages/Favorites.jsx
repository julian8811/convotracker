import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ExternalLink, Calendar, MapPin, DollarSign } from 'lucide-react';
import { getFavorites, removeFavorite } from '../services/api';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFavorites();
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

  const getEstadoColor = (estado) => {
    const colors = {
      'abierta': 'bg-green-100 text-green-800',
      'cerrada': 'bg-red-100 text-red-800',
      'próxima': 'bg-blue-100 text-blue-800',
      'en_evaluación': 'bg-yellow-100 text-yellow-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mis Favoritos</h1>
        <span className="text-sm text-gray-500">{favorites.length} convocatorias</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Star className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Sin favoritos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Agrega convocatorias a favoritos desde la lista o detalle.
          </p>
          <Link
            to="/convocatorias"
            className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ver Convocatorias
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {favorites.map((fav) => (
            <Link
              key={fav.id}
              to={`/convocatorias/${fav.convocatoria_id}`}
              className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {fav.titulo}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{fav.entidad}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {fav.pais}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(fav.estado)}`}>
                      {fav.estado.charAt(0).toUpperCase() + fav.estado.slice(1)}
                    </span>
                    {fav.fecha_cierre && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Cierre: {new Date(fav.fecha_cierre).toLocaleDateString('es-CO')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleRemove(fav.id, e)}
                  className="p-2 text-yellow-500 hover:text-yellow-700"
                  title="Quitar de favoritos"
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
