import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, TrendingUp, Clock, Search, ArrowRight, Target, FileText, Zap, Shield } from 'lucide-react';
import { getDashboardStats } from '../services/api';

const ACCENTS = ['#06b6d4', '#22c55e', '#a855f7', '#f97316', '#4f46e5', '#3b82f6'];

export default function Home() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {});
  }, []);

  const features = [
    { icon: Globe,    color: '#06b6d4', title: 'Cobertura global',          desc: 'Monitoreamos convocatorias en Colombia y a nivel mundial de fuentes oficiales verificadas.' },
    { icon: Target,   color: '#22c55e', title: 'Clasificación inteligente', desc: 'Organización automática por sector, tipo, país y montos disponibles para tu perfil.' },
    { icon: Clock,    color: '#a855f7', title: 'Actualización diaria',      desc: 'Web scraping automatizado cada 24 horas para mantener la información siempre actualizada.' },
    { icon: FileText, color: '#f97316', title: 'Reportes PDF',              desc: 'Genera reportes profesionales con información detallada de cada convocatoria.' },
    { icon: Zap,      color: '#4f46e5', title: 'Filtros avanzados',         desc: 'Busca por país, sector, tipo, fechas, montos y más para encontrar exactamente lo que necesitas.' },
    { icon: Shield,   color: '#3b82f6', title: 'Fuentes oficiales',         desc: 'Solo rastreamos fuentes verificadas: Minciencias, NSF, Horizon Europe, BID, PNUD y más.' },
  ];

  const kpis = stats ? [
    { label: 'Convocatorias',  value: stats.total_convocatorias, color: '#06b6d4' },
    { label: 'Abiertas',       value: stats.abiertas,            color: '#22c55e' },
    { label: 'Próximas',       value: stats.proximas,            color: '#f97316' },
    { label: 'Países',         value: Object.keys(stats.por_pais).length, color: '#a855f7' },
  ] : [];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Hero ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.65fr) minmax(0,1fr)', gap: 20, alignItems: 'center' }}>

        {/* Hero card izquierda */}
        <div style={{
          position: 'relative', borderRadius: 22, padding: '32px 32px 28px',
          border: '1px solid rgba(148,163,184,0.28)',
          background: `
            radial-gradient(circle at 0% 0%, rgba(56,189,248,0.14), transparent 55%),
            radial-gradient(circle at 100% 0%, rgba(94,234,212,0.12), transparent 65%),
            radial-gradient(circle at 50% 100%, rgba(79,70,229,0.16), transparent 60%),
            linear-gradient(135deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))`,
          boxShadow: '0 0 0 1px rgba(148,163,184,0.12), 0 18px 45px rgba(15,23,42,0.9)',
          overflow: 'hidden',
        }}>
          {/* Glow overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(circle at 20% 0%, rgba(129,140,248,0.28), transparent 60%),
                         radial-gradient(circle at 80% 0%, rgba(52,211,153,0.14), transparent 60%)`,
            opacity: 0.55, mixBlendMode: 'screen',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Eyebrow */}
            <div className="eyebrow" style={{ marginBottom: 16, width: 'fit-content' }}>
              <span className="eyebrow-dot" />
              Plataforma de vigilancia tecnológica
            </div>

            <h1 style={{
              margin: '0 0 14px', fontSize: 'clamp(26px, 3vw, 38px)',
              fontWeight: 800, letterSpacing: '-0.04em',
              lineHeight: 1.1, color: '#f9fafb',
            }}>
              Rastrea las mejores<br />
              <span style={{
                background: 'linear-gradient(90deg, #06b6d4, #4f46e5, #a855f7)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                convocatorias del mundo
              </span>
            </h1>

            <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.7, color: '#9ca3af', maxWidth: 560 }}>
              Emprendimiento, investigación, innovación y transferencia tecnológica —
              fuentes oficiales de Colombia, Europa, Norteamérica y organismos multilaterales.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Link to="/convocatorias" className="btn-primary" style={{ textDecoration: 'none' }}>
                <Search style={{ width: 16, height: 16 }} />
                Explorar convocatorias
                <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
              <Link to="/dashboard" className="btn-secondary" style={{ textDecoration: 'none' }}>
                <TrendingUp style={{ width: 15, height: 15, color: '#a855f7' }} />
                Ver dashboard
              </Link>
            </div>

            {/* KPIs inline */}
            {kpis.length > 0 && (
              <div style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {kpis.map((k, i) => (
                  <div key={i} style={{
                    padding: '7px 14px', borderRadius: 11,
                    border: '1px solid rgba(148,163,184,0.4)',
                    background: 'linear-gradient(to bottom right, rgba(15,23,42,0.96), rgba(15,23,42,0.9))',
                    display: 'flex', alignItems: 'baseline', gap: 10,
                  }}>
                    <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6b7280' }}>
                      {k.label}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: k.color }}>
                      {k.value?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visualización derecha */}
        <div style={{
          position: 'relative', borderRadius: 22, padding: '20px 18px',
          border: '1px solid rgba(148,163,184,0.38)',
          background: `
            radial-gradient(circle at 0 0, rgba(56,189,248,0.2), transparent 55%),
            radial-gradient(circle at 100% 0, rgba(14,165,233,0.14), transparent 55%),
            radial-gradient(circle at 50% 115%, rgba(79,70,229,0.22), transparent 60%),
            linear-gradient(145deg, #020617, #020617)`,
          boxShadow: '0 18px 40px rgba(0,0,0,0.65)',
          overflow: 'hidden',
        }}>
          {/* Mesh grid */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4,
            backgroundImage: 'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }} />

          {/* Orbit */}
          <div style={{ position: 'relative', aspectRatio: '4/3' }}>
            {/* Anillos */}
            {[16, 38, 62].map((inset, i) => (
              <div key={i} style={{
                position: 'absolute', inset, borderRadius: '50%',
                border: i === 1 ? '1px solid rgba(148,163,184,0.18)' : '1px dashed rgba(148,163,184,0.28)',
              }} />
            ))}

            {/* Centro */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 90, height: 90, borderRadius: '50%',
              background: `radial-gradient(circle at 20% 0%, rgba(56,189,248,0.3), transparent 65%),
                           radial-gradient(circle at 80% 120%, rgba(79,70,229,0.6), transparent 65%),
                           rgba(15,23,42,0.95)`,
              border: '1px solid rgba(148,163,184,0.5)',
              boxShadow: '0 0 0 1px rgba(15,23,42,0.7), 0 0 50px rgba(56,189,248,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: 11, color: '#e5e7eb', lineHeight: 1.3 }}>
                88+<br />
                <span style={{ fontSize: 9, color: '#9ca3af', letterSpacing: '0.06em' }}>FUENTES</span>
              </span>
            </div>

            {/* Nodos orbitales */}
            {[
              { pos: { top: '6%', left: '8%' },   color: '#06b6d4', label: 'Colombia' },
              { pos: { top: '8%', right: '6%' },  color: '#3b82f6', label: 'Europa' },
              { pos: { bottom: '8%', left: '5%' },color: '#a855f7', label: 'Multilateral' },
              { pos: { bottom: '6%', right: '8%'},color: '#f97316', label: 'LATAM' },
            ].map((n, i) => (
              <div key={i} style={{
                position: 'absolute', ...n.pos,
                padding: '5px 10px', borderRadius: 999,
                border: '1px solid rgba(148,163,184,0.5)',
                background: 'radial-gradient(circle at 0 0, rgba(15,23,42,0.9), rgba(15,23,42,1))',
                color: n.color, fontSize: 11, whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 8px 20px rgba(15,23,42,0.8)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
                {n.label}
              </div>
            ))}
          </div>

          {/* Footer visual */}
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, color: '#4b5563', letterSpacing: '0.08em' }}>SCRAPING ACTIVO</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['NSF', 'Horizon', 'PNUD', 'BID'].map(t => (
                <span key={t} style={{
                  padding: '2px 8px', borderRadius: 999, fontSize: 10,
                  border: '1px solid rgba(148,163,184,0.32)',
                  background: 'rgba(15,23,42,0.9)', color: '#6b7280',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div className="eyebrow"><span className="eyebrow-dot" />Capacidades</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ padding: '20px 18px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 11, marginBottom: 14,
                background: `${f.color}18`,
                border: `1px solid ${f.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <f.icon style={{ width: 18, height: 18, color: f.color }} />
              </div>
              <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#f9fafb' }}>{f.title}</p>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: '#6b7280' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Últimas convocatorias ── */}
      {stats?.ultimas_agregadas?.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="eyebrow"><span className="eyebrow-dot" />Recientes</div>
            </div>
            <Link
              to="/convocatorias"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 12, fontWeight: 600, color: '#06b6d4',
                textDecoration: 'none', letterSpacing: '0.04em',
                transition: 'color 200ms',
              }}
            >
              Ver todas <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {stats.ultimas_agregadas.slice(0, 6).map((c, i) => (
              <Link
                key={c.id}
                to={`/convocatorias/${c.id}`}
                className="card"
                style={{ padding: '18px', textDecoration: 'none', display: 'block' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className={`badge ${c.estado === 'abierta' ? 'badge-open' : c.estado === 'próxima' ? 'badge-upcoming' : 'badge-closed'}`}>
                    {c.estado}
                  </span>
                  <span style={{ fontSize: 10, color: '#4b5563', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {c.pais}
                  </span>
                </div>
                <p style={{
                  margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: '#f9fafb',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {c.titulo}
                </p>
                <p style={{ margin: '0 0 10px', fontSize: 11, color: '#6b7280' }}>{c.entidad}</p>
                {c.fecha_cierre && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#4b5563' }}>
                    <Clock style={{ width: 11, height: 11 }} />
                    Cierre: {new Date(c.fecha_cierre).toLocaleDateString('es-CO')}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
