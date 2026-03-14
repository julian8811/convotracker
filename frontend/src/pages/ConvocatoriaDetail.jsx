import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, MapPin, Building2, Tag, DollarSign,
  Download, Calendar, Globe, FileText, Users, ExternalLink
} from 'lucide-react';
import { getConvocatoria, downloadConvocatoriaPdf } from '../services/api';
import { ensureAbsoluteUrl } from '../utils/urls';

const ESTADO = {
  abierta:  { bg: 'rgba(34,197,94,0.14)',  color: '#4ade80', border: 'rgba(34,197,94,0.35)' },
  cerrada:  { bg: 'rgba(239,68,68,0.14)',  color: '#f87171', border: 'rgba(239,68,68,0.35)' },
  'próxima':{ bg: 'rgba(249,115,22,0.14)', color: '#fb923c', border: 'rgba(249,115,22,0.35)' },
};

export default function ConvocatoriaDetail() {
  const { id } = useParams();
  const [conv, setConv] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConvocatoria(id).then(setConv).catch(() => setConv(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(148,163,184,0.15)', borderTopColor: '#4f46e5', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!conv) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <p style={{ fontSize: 16, fontWeight: 600, color: '#9ca3af', marginBottom: 14 }}>Convocatoria no encontrada</p>
      <Link to="/convocatorias" style={{ fontSize: 13, color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>
        ← Volver a la lista
      </Link>
    </div>
  );

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const formatMonto = (min, max, moneda) => {
    if (!max) return null;
    const sym = { USD: '$', EUR: '€', COP: 'COP$', GBP: '£', MXN: 'MX$', BRL: 'R$' }[moneda] || (moneda + ' ');
    return min ? `${sym}${min.toLocaleString()} – ${sym}${max.toLocaleString()}` : `Hasta ${sym}${max.toLocaleString()}`;
  };

  const getUrl = (raw) => {
    if (!raw) return null;
    const t = String(raw).trim().split(/\s+/)[0];
    if (!t) return null;
    return ensureAbsoluteUrl(t) || (t.startsWith('http') ? t : `https://${t.replace(/^\/+/, '')}`);
  };

  const urlFuente   = getUrl(conv.url_fuente ?? conv.urlFuente);
  const urlTerminos = getUrl(conv.url_terminos ?? conv.urlTerminos);
  const estado      = ESTADO[conv.estado] || ESTADO.cerrada;

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Back */}
      <Link to="/convocatorias" style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        fontSize: 12, fontWeight: 600, color: '#6b7280', textDecoration: 'none',
        letterSpacing: '0.06em', textTransform: 'uppercase',
        transition: 'color 200ms',
      }}>
        <ArrowLeft style={{ width: 14, height: 14 }} />
        Convocatorias
      </Link>

      {/* Main card */}
      <div className="card" style={{ padding: '28px 32px' }}>

        {/* Estado + Tipo badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 13px', borderRadius: 999,
            fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
            background: estado.bg, color: estado.color, border: `1px solid ${estado.border}`,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
            {conv.estado}
          </span>
          <span style={{
            padding: '4px 13px', borderRadius: 999,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            background: 'rgba(148,163,184,0.08)', color: '#6b7280',
            border: '1px solid rgba(148,163,184,0.22)',
          }}>
            {conv.tipo}
          </span>
        </div>

        {/* Título */}
        <h1 style={{ margin: '0 0 28px', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, color: '#f9fafb', letterSpacing: '-0.03em', lineHeight: 1.25 }}>
          {conv.titulo}
        </h1>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
          <InfoCard Icon={Building2} label="Entidad"   value={conv.entidad} />
          <InfoCard Icon={MapPin}    label="País"      value={conv.pais} />
          {conv.region    && <InfoCard Icon={Globe}     label="Región"    value={conv.region} />}
          {conv.sector    && <InfoCard Icon={Tag}       label="Sector"    value={conv.sector} />}
          {conv.fecha_apertura && <InfoCard Icon={Calendar} label="Apertura" value={formatDate(conv.fecha_apertura)} />}
          {conv.fecha_cierre   && <InfoCard Icon={Clock}    label="Cierre"   value={formatDate(conv.fecha_cierre)} color="#fb923c" />}
          {formatMonto(conv.monto_minimo, conv.monto_maximo, conv.moneda) && (
            <InfoCard Icon={DollarSign} label="Monto" value={formatMonto(conv.monto_minimo, conv.monto_maximo, conv.moneda)} color="#06b6d4" />
          )}
        </div>

        {/* Secciones de texto */}
        {conv.descripcion && <TextSection Icon={FileText} title="Descripción" text={conv.descripcion} />}
        {conv.requisitos  && <TextSection Icon={FileText} title="Requisitos"  text={conv.requisitos} />}
        {conv.beneficiarios && <TextSection Icon={Users}  title="Beneficiarios" text={conv.beneficiarios} />}

        {/* Tags */}
        {conv.tags && (
          <div style={{ marginTop: 24 }}>
            <p className="panel-title" style={{ marginBottom: 10 }}>Etiquetas</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {conv.tags.split(',').map((tag, i) => (
                <span key={i} style={{
                  padding: '3px 10px', borderRadius: 999,
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                  background: 'rgba(79,70,229,0.1)', color: '#818cf8',
                  border: '1px solid rgba(79,70,229,0.28)',
                }}>
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(148,163,184,0.1)' }}>
          {urlFuente && (
            <a href={urlFuente} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>
              <ExternalLink style={{ width: 15, height: 15 }} />
              Ver convocatoria original
            </a>
          )}
          {urlTerminos && urlTerminos !== urlFuente && (
            <a href={urlTerminos} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ textDecoration: 'none' }}>
              <FileText style={{ width: 14, height: 14 }} />
              Términos de referencia
            </a>
          )}
          <button onClick={() => downloadConvocatoriaPdf(conv.id)} className="btn-secondary">
            <Download style={{ width: 14, height: 14 }} />
            Descargar PDF
          </button>
        </div>

        {!urlFuente && (
          <p style={{ marginTop: 12, fontSize: 11, color: '#4b5563', fontStyle: 'italic' }}>
            No hay URL de fuente disponible para esta convocatoria.
          </p>
        )}
      </div>

      <p style={{ fontSize: 11, color: '#374151', textAlign: 'center', letterSpacing: '0.04em' }}>
        Fuente: {conv.fuente_scraping} · Registrado: {formatDate(conv.created_at)}
      </p>
    </div>
  );
}

function InfoCard({ Icon, label, value, color = '#e5e7eb' }) {
  return (
    <div style={{
      padding: '12px 14px', borderRadius: 12,
      background: 'rgba(15,23,42,0.6)',
      border: '1px solid rgba(148,163,184,0.14)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <Icon style={{ width: 13, height: 13, color: '#4b5563' }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color }}>{value}</p>
    </div>
  );
}

function TextSection({ Icon, title, text }) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Icon style={{ width: 14, height: 14, color: '#4f46e5' }} />
        <span className="panel-title">{title}</span>
      </div>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: '#9ca3af', whiteSpace: 'pre-line' }}>{text}</p>
    </div>
  );
}
