import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, MapPin, Building2, Tag, DollarSign,
  ExternalLink, Download, Calendar, Globe, FileText, Users
} from 'lucide-react';
import { getConvocatoria, downloadConvocatoriaPdf } from '../services/api';

export default function ConvocatoriaDetail() {
  const { id } = useParams();
  const [conv, setConv] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConvocatoria(id)
      .then(setConv)
      .catch(() => setConv(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!conv) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-600">Convocatoria no encontrada</h2>
        <Link to="/convocatorias" className="text-brand-600 hover:underline mt-4 inline-block">Volver a la lista</Link>
      </div>
    );
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

  const formatMonto = (min, max, moneda) => {
    if (!max) return null;
    const sym = { USD: '$', EUR: '€', COP: 'COP $', GBP: '£' }[moneda] || moneda + ' ';
    return min ? `${sym}${min.toLocaleString()} - ${sym}${max.toLocaleString()}` : `Hasta ${sym}${max.toLocaleString()}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/convocatorias" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a convocatorias
      </Link>

      <div className="card p-6 lg:p-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`badge text-sm px-3 py-1 ${conv.estado === 'abierta' ? 'badge-open' : conv.estado === 'próxima' ? 'badge-upcoming' : 'badge-closed'}`}>
            {conv.estado}
          </span>
          <span className="badge bg-blue-50 text-blue-700 text-sm px-3 py-1">{conv.tipo}</span>
        </div>

        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">{conv.titulo}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <InfoCard icon={Building2} label="Entidad" value={conv.entidad} />
          <InfoCard icon={MapPin} label="País" value={conv.pais} />
          {conv.region && <InfoCard icon={Globe} label="Región" value={conv.region} />}
          {conv.sector && <InfoCard icon={Tag} label="Sector" value={conv.sector} />}
          {conv.fecha_apertura && <InfoCard icon={Calendar} label="Apertura" value={formatDate(conv.fecha_apertura)} />}
          {conv.fecha_cierre && <InfoCard icon={Clock} label="Cierre" value={formatDate(conv.fecha_cierre)} color="text-red-600" />}
          {formatMonto(conv.monto_minimo, conv.monto_maximo, conv.moneda) && (
            <InfoCard icon={DollarSign} label="Monto" value={formatMonto(conv.monto_minimo, conv.monto_maximo, conv.moneda)} color="text-emerald-600" />
          )}
        </div>

        {conv.descripcion && (
          <Section title="Descripción" icon={FileText}>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{conv.descripcion}</p>
          </Section>
        )}

        {conv.requisitos && (
          <Section title="Requisitos" icon={FileText}>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{conv.requisitos}</p>
          </Section>
        )}

        {conv.beneficiarios && (
          <Section title="Beneficiarios" icon={Users}>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{conv.beneficiarios}</p>
          </Section>
        )}

        {conv.tags && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Etiquetas</h3>
            <div className="flex flex-wrap gap-2">
              {conv.tags.split(',').map((tag, i) => (
                <span key={i} className="badge bg-gray-100 text-gray-600">{tag.trim()}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t">
          {conv.url_fuente && (
            <a href={conv.url_fuente} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> Ver convocatoria original
            </a>
          )}
          {conv.url_terminos && (
            <a href={conv.url_terminos} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2">
              <FileText className="w-4 h-4" /> Términos de referencia
            </a>
          )}
          <button onClick={() => downloadConvocatoriaPdf(conv.id)} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Descargar PDF
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center">
        Fuente: {conv.fuente_scraping} | Registrado: {formatDate(conv.created_at)}
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, color = 'text-gray-900' }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <p className={`font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="mt-6">
      <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
        <Icon className="w-5 h-5 text-brand-500" /> {title}
      </h3>
      {children}
    </div>
  );
}
