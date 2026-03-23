import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, X, ChevronLeft, ChevronRight, Download,
  Clock, MapPin, Building2, Tag, DollarSign, ExternalLink, SlidersHorizontal
} from 'lucide-react';
import { getConvocatorias, getFilterOptions, downloadAllPdf } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';

const ESTADO_COLORS = {
  abierta:  { bg: 'rgba(34,197,94,0.14)',  color: '#4ade80', border: 'rgba(34,197,94,0.35)' },
  cerrada:  { bg: 'rgba(239,68,68,0.14)',  color: '#f87171', border: 'rgba(239,68,68,0.35)' },
  'próxima':{ bg: 'rgba(249,115,22,0.14)', color: '#fb923c', border: 'rgba(249,115,22,0.35)' },
};

const tipoLabels = {
  emprendimiento: 'Emprendimiento', investigación: 'Investigación', innovación: 'Innovación',
  transferencia_tecnológica: 'Transfer. Tec.', desarrollo: 'Desarrollo',
  cooperación_internacional: 'Cooperación Int.', otro: 'Otro',
};

export default function ConvocatoriasList() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, page_size: 20 });
  const [filters, setFilters] = useState({
    search: '', pais: '', tipo: '', estado: '', sector: '',
    page: 1, page_size: 20, sort_by: 'created_at', sort_order: 'desc',
  });
  const [options, setOptions] = useState({ paises: [], tipos: [], sectores: [], entidades: [] });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { getFilterOptions().then(setOptions).catch(() => {}); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      setData(await getConvocatorias(params));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateFilter = (key, val) => setFilters(p => ({ ...p, [key]: val, page: 1 }));
  const clearFilters = () => setFilters({ search: '', pais: '', tipo: '', estado: '', sector: '', page: 1, page_size: 20, sort_by: 'created_at', sort_order: 'desc' });

  const totalPages = Math.ceil(data.total / filters.page_size);
  const hasActive = filters.pais || filters.tipo || filters.estado || filters.sector;

  const formatMonto = (min, max, moneda) => {
    if (!max) return null;
    const f = (n) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : n.toFixed(0);
    const s = { USD: '$', EUR: '€', COP: 'COP$', GBP: '£' }[moneda] || (moneda + ' ');
    return min ? `${s}${f(min)} – ${s}${f(max)}` : `Hasta ${s}${f(max)}`;
  };

  return (
    <div className="mx-auto flex flex-col gap-4 sm:gap-6" style={{ maxWidth: 900, padding: '0 12px' }}>

      {/* Encabezado */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8, width: 'fit-content' }}>
            <span className="eyebrow-dot" />Convocatorias
          </div>
          <p className="panel-title" style={{ color: '#4b5563', fontSize: 11 }}>
            {loading ? '…' : data.total.toLocaleString()} resultados encontrados
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary"
            style={{ position: 'relative' }}
          >
            <SlidersHorizontal style={{ width: 14, height: 14 }} />
            Filtros
            {hasActive && (
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#06b6d4',
                boxShadow: '0 0 0 3px rgba(6,182,212,0.25)',
              }} />
            )}
          </button>
          <button onClick={downloadAllPdf} className="btn-primary">
            <Download style={{ width: 14, height: 14 }} />
            PDF
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#4b5563' }} />
        <input
          className="input-field"
          style={{ paddingLeft: 42, paddingRight: filters.search ? 42 : 14 }}
          placeholder="Buscar por título, entidad, descripción…"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
        {filters.search && (
          <button
            onClick={() => updateFilter('search', '')}
            style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}
          >
            <X style={{ width: 15, height: 15 }} />
          </button>
        )}
      </div>

      {/* Filtros avanzados */}
      {showFilters && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#e5e7eb', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              <Filter style={{ width: 14, height: 14, color: '#4f46e5' }} />
              Filtros avanzados
            </span>
            {hasActive && (
              <button onClick={clearFilters} style={{ fontSize: 11, fontWeight: 600, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Limpiar filtros
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
            {[
              { label: 'País',    key: 'pais',   opts: options.paises,   placeholder: 'Todos los países' },
              { label: 'Tipo',    key: 'tipo',   opts: options.tipos,    placeholder: 'Todos los tipos', map: tipoLabels },
              { label: 'Sector',  key: 'sector', opts: options.sectores, placeholder: 'Todos los sectores' },
            ].map(({ label, key, opts, placeholder, map }) => (
              <div key={key}>
                <p className="panel-title" style={{ marginBottom: 6, fontSize: 10 }}>{label}</p>
                <select className="select-field" value={filters[key]} onChange={(e) => updateFilter(key, e.target.value)}>
                  <option value="">{placeholder}</option>
                  {opts.map(o => <option key={o} value={o}>{map ? (map[o] || o) : o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <p className="panel-title" style={{ marginBottom: 6, fontSize: 10 }}>Estado</p>
              <select className="select-field" value={filters.estado} onChange={(e) => updateFilter('estado', e.target.value)}>
                <option value="">Todos</option>
                <option value="abierta">Abierta</option>
                <option value="próxima">Próxima</option>
                <option value="cerrada">Cerrada</option>
              </select>
            </div>
          </div>

          {/* Chips de estado rápido */}
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['abierta','próxima','cerrada'].map((e) => (
              <button
                key={e}
                onClick={() => updateFilter('estado', filters.estado === e ? '' : e)}
                className={`chip${filters.estado === e ? ' active' : ''}`}
              >
                <span className="chip-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                {e}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            <div>
              <p className="panel-title" style={{ marginBottom: 6, fontSize: 10 }}>Ordenar por</p>
              <select className="select-field" value={filters.sort_by} onChange={(e) => updateFilter('sort_by', e.target.value)}>
                <option value="created_at">Fecha de registro</option>
                <option value="fecha_cierre">Fecha de cierre</option>
                <option value="titulo">Título</option>
                <option value="monto_maximo">Monto</option>
              </select>
            </div>
            <div>
              <p className="panel-title" style={{ marginBottom: 6, fontSize: 10 }}>Orden</p>
              <select className="select-field" value={filters.sort_order} onChange={(e) => updateFilter('sort_order', e.target.value)}>
                <option value="desc">Más reciente primero</option>
                <option value="asc">Más antiguo primero</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Resultados */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(148,163,184,0.2)', borderTopColor: '#4f46e5', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : data.items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Search style={{ width: 48, height: 48, color: '#374151', margin: '0 auto 14px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: '#9ca3af' }}>Sin resultados</p>
          <p style={{ fontSize: 13, color: '#4b5563', marginTop: 6 }}>Ajusta los filtros de búsqueda</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.items.map((c) => {
            const est = ESTADO_COLORS[c.estado] || ESTADO_COLORS.cerrada;
            return (
              <Link key={c.id} to={`/convocatorias/${c.id}`} className="card" style={{ padding: '18px 20px', textDecoration: 'none', display: 'block' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 7 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 999,
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                        background: est.bg, color: est.color, border: `1px solid ${est.border}`,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                        {c.estado}
                      </span>
                      <span style={{
                        padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        background: 'rgba(148,163,184,0.08)', color: '#6b7280',
                        border: '1px solid rgba(148,163,184,0.2)',
                      }}>
                        {tipoLabels[c.tipo] || c.tipo}
                      </span>
                    </div>
                    <FavoriteButton convocatoriaId={c.id} size="small" />
                  </div>

                  {/* Título */}
                  <p style={{
                    margin: 0, fontSize: 14, fontWeight: 700, color: '#f9fafb',
                    lineHeight: 1.4,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {c.titulo}
                  </p>

                  {/* Descripción */}
                  {c.descripcion && (
                    <p style={{
                      margin: 0, fontSize: 12, color: '#4b5563', lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {c.descripcion}
                    </p>
                  )}

                  {/* Meta */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', fontSize: 11, color: '#6b7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Building2 style={{ width: 12, height: 12 }} />{c.entidad}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin style={{ width: 12, height: 12 }} />{c.pais}
                    </span>
                    {c.sector && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Tag style={{ width: 12, height: 12 }} />{c.sector}
                      </span>
                    )}
                    {c.fecha_cierre && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock style={{ width: 12, height: 12 }} />
                        Cierre: {new Date(c.fecha_cierre).toLocaleDateString('es-CO')}
                      </span>
                    )}
                    {formatMonto(c.monto_minimo, c.monto_maximo, c.moneda) && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#06b6d4', fontWeight: 600 }}>
                        <DollarSign style={{ width: 12, height: 12 }} />
                        {formatMonto(c.monto_minimo, c.monto_maximo, c.moneda)}
                      </span>
                    )}
                    <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: '#4f46e5', fontWeight: 600, opacity: 0.8 }}>
                      Ver detalle <ExternalLink style={{ width: 11, height: 11 }} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#4b5563', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Página {filters.page} de {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-secondary"
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
              disabled={filters.page <= 1}
              style={{ padding: '8px 12px', opacity: filters.page <= 1 ? 0.4 : 1 }}
            >
              <ChevronLeft style={{ width: 16, height: 16 }} />
            </button>
            <button
              className="btn-secondary"
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              disabled={filters.page >= totalPages}
              style={{ padding: '8px 12px', opacity: filters.page >= totalPages ? 0.4 : 1 }}
            >
              <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
