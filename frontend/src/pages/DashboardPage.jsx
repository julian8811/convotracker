import { useState, useEffect } from 'react';
import { Globe, TrendingUp, Clock, BarChart3, PieChart, Building2 } from 'lucide-react';
import { getDashboardStats } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, AreaChart, Area
} from 'recharts';

const PALETTE = ['#4f46e5','#06b6d4','#22c55e','#a855f7','#f97316','#3b82f6','#eab308','#ec4899'];
const TT_STYLE = { borderRadius: 12, border: '1px solid rgba(148,163,184,0.25)', backgroundColor: '#0c0f1e', fontSize: 12 };
const TICK = { fontSize: 11, fill: '#6b7280' };

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getDashboardStats().then(setStats).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(148,163,184,0.15)', borderTopColor: '#4f46e5', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!stats) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <BarChart3 style={{ width: 48, height: 48, color: '#374151', margin: '0 auto 14px' }} />
      <p style={{ fontSize: 15, fontWeight: 600, color: '#9ca3af' }}>No hay datos disponibles</p>
      <p style={{ fontSize: 13, color: '#4b5563', marginTop: 6 }}>Ejecuta el scraping primero</p>
    </div>
  );

  const paisData   = Object.entries(stats.por_pais).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name,value])=>({name,value}));
  const tipoLabels = { emprendimiento:'Emprend.',investigación:'Investig.',innovación:'Innovac.',transferencia_tecnológica:'Transfer.',desarrollo:'Desarrollo',cooperación_internacional:'Cooperac.',otro:'Otro' };
  const tipoData   = Object.entries(stats.por_tipo).map(([name,value])=>({name:tipoLabels[name]||name,value}));
  const sectorData = Object.entries(stats.por_sector).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,value])=>({name,value}));
  const mesData    = Object.entries(stats.por_mes).sort().slice(-12).map(([name,value])=>({name,value}));

  const kpis = [
    { label:'Total',        value: stats.total_convocatorias, icon: Globe,     color:'#06b6d4', bg:'rgba(6,182,212,0.12)',   border:'rgba(6,182,212,0.25)' },
    { label:'Abiertas',     value: stats.abiertas,            icon: TrendingUp, color:'#22c55e', bg:'rgba(34,197,94,0.12)',  border:'rgba(34,197,94,0.25)' },
    { label:'Cerradas',     value: stats.cerradas,            icon: Clock,      color:'#ef4444', bg:'rgba(239,68,68,0.12)',  border:'rgba(239,68,68,0.25)' },
    { label:'Monto prom.',  value: stats.monto_promedio ? `$${(stats.monto_promedio/1000).toFixed(0)}K` : 'N/A', icon: BarChart3, color:'#a855f7', bg:'rgba(168,85,247,0.12)', border:'rgba(168,85,247,0.25)' },
  ];

  return (
    <div className="mx-auto flex flex-col gap-5 sm:gap-6" style={{ maxWidth: 1200, padding: '0 12px' }}>

      {/* Header */}
      <div>
        <div className="eyebrow" style={{ marginBottom: 10, width: 'fit-content' }}>
          <span className="eyebrow-dot" />Dashboard · Análisis
        </div>
        <p style={{ fontSize: 12, color: '#4b5563', letterSpacing: '0.06em' }}>
          Visualización y estadísticas de convocatorias rastreadas
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {kpis.map((k, i) => (
          <div key={i} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="panel-title">{k.label}</span>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: k.bg, border: `1px solid ${k.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.icon style={{ width: 17, height: 17, color: k.color }} />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#f9fafb', letterSpacing: '-0.03em' }}>
              {typeof k.value === 'number' ? k.value.toLocaleString() : k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Gráficos fila 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        <ChartPanel title="Por país (top 10)" Icon={Globe}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={paisData} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={TICK} />
              <YAxis dataKey="name" type="category" width={90} tick={{ ...TICK, fontSize: 10 }} />
              <Tooltip contentStyle={TT_STYLE} cursor={{ fill: 'rgba(79,70,229,0.08)' }} />
              <Bar dataKey="value" fill="#4f46e5" radius={[0, 7, 7, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Distribución por tipo" Icon={PieChart}>
          <ResponsiveContainer width="100%" height={280}>
            <RechartsPie>
              <Pie
                data={tipoData} cx="50%" cy="50%"
                innerRadius={55} outerRadius={95}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                labelLine={{ stroke: 'rgba(148,163,184,0.2)' }}
              >
                {tipoData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={TT_STYLE} />
            </RechartsPie>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      {/* Gráficos fila 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        <ChartPanel title="Tendencia mensual" Icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={mesData}>
              <defs>
                <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={TICK} />
              <YAxis tick={TICK} />
              <Tooltip contentStyle={TT_STYLE} cursor={{ stroke: 'rgba(79,70,229,0.4)' }} />
              <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} fill="url(#gv)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Por sector (top 8)" Icon={BarChart3}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ ...TICK, fontSize: 9 }} angle={-20} textAnchor="end" height={55} />
              <YAxis tick={TICK} />
              <Tooltip contentStyle={TT_STYLE} cursor={{ fill: 'rgba(79,70,229,0.08)' }} />
              <Bar dataKey="value" radius={[7, 7, 0, 0]}>
                {sectorData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      {/* Top entidades */}
      {Object.keys(stats.por_entidad).length > 0 && (
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Building2 style={{ width: 16, height: 16, color: '#4f46e5' }} />
            <span className="panel-title">Top entidades</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(stats.por_entidad).slice(0, 10).map(([name, count], i) => {
              const max = Math.max(...Object.values(stats.por_entidad));
              const pct = (count / max) * 100;
              const color = PALETTE[i % PALETTE.length];
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ width: 150, fontSize: 12, color: '#e5e7eb', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {name}
                  </span>
                  <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(148,163,184,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: color, transition: 'width 600ms ease-out' }} />
                  </div>
                  <span style={{ width: 28, fontSize: 12, fontWeight: 700, color: color, textAlign: 'right', flexShrink: 0 }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ChartPanel({ title, Icon, children }) {
  return (
    <div className="card" style={{ padding: '20px 20px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Icon style={{ width: 15, height: 15, color: '#4f46e5' }} />
        <span className="panel-title">{title}</span>
      </div>
      {children}
    </div>
  );
}
