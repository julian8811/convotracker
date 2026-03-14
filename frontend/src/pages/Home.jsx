import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, TrendingUp, Clock, Search, ArrowRight, Sparkles, Target, FileText } from 'lucide-react';
import { getDashboardStats } from '../services/api';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const features = [
    { icon: Globe, title: 'Cobertura Global', desc: 'Monitoreamos convocatorias en Colombia y a nivel mundial de fuentes oficiales.' },
    { icon: Target, title: 'Clasificación Inteligente', desc: 'Organización automática por sector, tipo, país y montos disponibles.' },
    { icon: Clock, title: 'Actualización Diaria', desc: 'Web scraping automatizado cada 24 horas para mantener los datos frescos.' },
    { icon: FileText, title: 'Reportes PDF', desc: 'Genera reportes profesionales con información detallada de cada convocatoria.' },
  ];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero p-8 lg:p-12 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium text-blue-100">Plataforma de Vigilancia Tecnológica</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            Encuentra las mejores<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
              convocatorias del mundo
            </span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl">
            Rastrea convocatorias de emprendimiento, investigación, innovación y transferencia
            tecnológica de fuentes oficiales nacionales e internacionales.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/convocatorias" className="inline-flex items-center gap-2 bg-white text-brand-800 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-all shadow-lg">
              <Search className="w-5 h-5" />
              Explorar convocatorias
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/20 transition-all border border-white/20">
              <TrendingUp className="w-5 h-5" />
              Ver Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Convocatorias', value: stats.total_convocatorias, color: 'from-blue-500 to-blue-600', icon: Globe },
            { label: 'Abiertas', value: stats.abiertas, color: 'from-emerald-500 to-emerald-600', icon: Sparkles },
            { label: 'Próximas', value: stats.proximas, color: 'from-amber-500 to-amber-600', icon: Clock },
            { label: 'Países', value: Object.keys(stats.por_pais).length, color: 'from-purple-500 to-purple-600', icon: Target },
          ].map((s, i) => (
            <div key={i} className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">{s.label}</span>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Features */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Funcionalidades Principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div key={i} className="card p-6 group hover:border-brand-200">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                <f.icon className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent */}
      {stats?.ultimas_agregadas?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Últimas Convocatorias</h2>
            <Link to="/convocatorias" className="text-brand-600 hover:text-brand-700 text-sm font-medium flex items-center gap-1">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stats.ultimas_agregadas.slice(0, 6).map((c) => (
              <Link key={c.id} to={`/convocatorias/${c.id}`} className="card p-5 group hover:border-brand-200">
                <div className="flex items-start justify-between mb-3">
                  <span className={`badge ${c.estado === 'abierta' ? 'badge-open' : c.estado === 'próxima' ? 'badge-upcoming' : 'badge-closed'}`}>
                    {c.estado}
                  </span>
                  <span className="text-xs text-gray-400">{c.pais}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
                  {c.titulo}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{c.entidad}</p>
                {c.fecha_cierre && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Cierre: {new Date(c.fecha_cierre).toLocaleDateString('es-CO')}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
