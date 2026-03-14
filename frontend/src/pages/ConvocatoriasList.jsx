import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, X, ChevronLeft, ChevronRight, Download,
  Clock, MapPin, Building2, Tag, DollarSign, ExternalLink, SlidersHorizontal
} from 'lucide-react';
import { getConvocatorias, getFilterOptions, downloadAllPdf } from '../services/api';

export default function ConvocatoriasList() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 20 });
  const [filters, setFilters] = useState({
    search: '', pais: '', tipo: '', estado: '', sector: '',
    page: 1, page_size: 20, sort_by: 'created_at', sort_order: 'desc',
  });
  const [options, setOptions] = useState({ paises: [], tipos: [], sectores: [], entidades: [] });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getFilterOptions().then(setOptions).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const result = await getConvocatorias(params);
      setData(result);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', pais: '', tipo: '', estado: '', sector: '', page: 1, page_size: 20, sort_by: 'created_at', sort_order: 'desc' });
  };

  const totalPages = Math.ceil(data.total / filters.page_size);
  const hasActiveFilters = filters.pais || filters.tipo || filters.estado || filters.sector;

  const tipoLabels = {
    emprendimiento: 'Emprendimiento', investigación: 'Investigación', innovación: 'Innovación',
    transferencia_tecnológica: 'Transferencia Tec.', desarrollo: 'Desarrollo',
    cooperación_internacional: 'Cooperación Int.', otro: 'Otro',
  };

  const formatMonto = (min, max, moneda) => {
    if (!max) return null;
    const fmt = (n) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : n.toFixed(0);
    const symbol = { USD: '$', EUR: '€', COP: 'COP $', GBP: '£' }[moneda] || moneda + ' ';
    return min ? `${symbol}${fmt(min)} - ${symbol}${fmt(max)}` : `Hasta ${symbol}${fmt(max)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Convocatorias</h1>
          <p className="text-sm text-gray-500 mt-1">{data.total} resultados encontrados</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {hasActiveFilters && <span className="w-2 h-2 bg-brand-500 rounded-full" />}
          </button>
          <button onClick={downloadAllPdf} className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar convocatorias por título, entidad, descripción..."
          className="input-field pl-12 pr-10"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
        {filters.search && (
          <button onClick={() => updateFilter('search', '')} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filtros Avanzados
            </h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700">Limpiar filtros</button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">País</label>
              <select className="select-field" value={filters.pais} onChange={(e) => updateFilter('pais', e.target.value)}>
                <option value="">Todos los países</option>
                {options.paises.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipo</label>
              <select className="select-field" value={filters.tipo} onChange={(e) => updateFilter('tipo', e.target.value)}>
                <option value="">Todos los tipos</option>
                {options.tipos.map(t => <option key={t} value={t}>{tipoLabels[t] || t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Estado</label>
              <select className="select-field" value={filters.estado} onChange={(e) => updateFilter('estado', e.target.value)}>
                <option value="">Todos</option>
                <option value="abierta">Abierta</option>
                <option value="cerrada">Cerrada</option>
                <option value="próxima">Próxima</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Sector</label>
              <select className="select-field" value={filters.sector} onChange={(e) => updateFilter('sector', e.target.value)}>
                <option value="">Todos los sectores</option>
                {options.sectores.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Ordenar por</label>
              <select className="select-field" value={filters.sort_by} onChange={(e) => updateFilter('sort_by', e.target.value)}>
                <option value="created_at">Fecha de registro</option>
                <option value="fecha_cierre">Fecha de cierre</option>
                <option value="titulo">Título</option>
                <option value="monto_maximo">Monto</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Orden</label>
              <select className="select-field" value={filters.sort_order} onChange={(e) => updateFilter('sort_order', e.target.value)}>
                <option value="desc">Más reciente primero</option>
                <option value="asc">Más antiguo primero</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : data.items.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No se encontraron convocatorias</h3>
          <p className="text-gray-400 mt-2">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((c) => (
            <Link key={c.id} to={`/convocatorias/${c.id}`} className="card p-5 block group hover:border-brand-200">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`badge ${c.estado === 'abierta' ? 'badge-open' : c.estado === 'próxima' ? 'badge-upcoming' : 'badge-closed'}`}>
                      {c.estado}
                    </span>
                    <span className="badge bg-blue-50 text-blue-700">{tipoLabels[c.tipo] || c.tipo}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mb-2 line-clamp-2">
                    {c.titulo}
                  </h3>
                  {c.descripcion && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{c.descripcion}</p>
                  )}
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{c.entidad}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{c.pais}</span>
                    {c.sector && <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{c.sector}</span>}
                    {c.fecha_cierre && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Cierre: {new Date(c.fecha_cierre).toLocaleDateString('es-CO')}
                      </span>
                    )}
                    {formatMonto(c.monto_minimo, c.monto_maximo, c.moneda) && (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <DollarSign className="w-3.5 h-3.5" />
                        {formatMonto(c.monto_minimo, c.monto_maximo, c.moneda)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">Ver detalle</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Página {filters.page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
              disabled={filters.page <= 1}
              className="btn-secondary p-2 disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              disabled={filters.page >= totalPages}
              className="btn-secondary p-2 disabled:opacity-40"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
