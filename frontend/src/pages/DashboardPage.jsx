import { useState, useEffect } from 'react';
import { Globe, TrendingUp, Clock, BarChart3, PieChart } from 'lucide-react';
import { getDashboardStats } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend, LineChart, Line, Area, AreaChart
} from 'recharts';

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#4f46e5', '#be185d', '#065f46', '#9333ea'];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600">No hay datos disponibles</h3>
        <p className="text-gray-400 mt-2">Ejecuta el scraping primero para obtener datos</p>
      </div>
    );
  }

  const paisData = Object.entries(stats.por_pais)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const tipoLabels = {
    emprendimiento: 'Emprend.', investigación: 'Investig.', innovación: 'Innovac.',
    transferencia_tecnológica: 'Transfer.', desarrollo: 'Desarrollo',
    cooperación_internacional: 'Cooperac.', otro: 'Otro',
  };
  const tipoData = Object.entries(stats.por_tipo).map(([name, value]) => ({
    name: tipoLabels[name] || name, value
  }));

  const sectorData = Object.entries(stats.por_sector)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  const mesData = Object.entries(stats.por_mes)
    .sort()
    .slice(-12)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Análisis y visualización de convocatorias</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard label="Total" value={stats.total_convocatorias} icon={Globe} gradient="from-blue-500 to-blue-600" />
        <KPICard label="Abiertas" value={stats.abiertas} icon={TrendingUp} gradient="from-emerald-500 to-emerald-600" />
        <KPICard label="Cerradas" value={stats.cerradas} icon={Clock} gradient="from-red-400 to-red-500" />
        <KPICard label="Monto Promedio" value={stats.monto_promedio ? `$${(stats.monto_promedio/1000).toFixed(0)}K` : 'N/A'} icon={BarChart3} gradient="from-amber-500 to-amber-600" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Convocatorias por País" icon={Globe}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paisData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribución por Tipo" icon={PieChart}>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie data={tipoData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#94a3b8' }}>
                {tipoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            </RechartsPie>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Tendencia Mensual" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mesData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} fill="url(#colorVal)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Por Sector" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {sectorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top entities */}
      {Object.keys(stats.por_entidad).length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2Icon /> Top Entidades
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.por_entidad).slice(0, 10).map(([name, count], i) => {
              const max = Math.max(...Object.values(stats.por_entidad));
              const pct = (count / max) * 100;
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-40 text-sm text-gray-700 truncate font-medium">{name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3">
                    <div className="h-3 rounded-full bg-gradient-to-r from-brand-500 to-brand-600" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Building2Icon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>;
}

function KPICard({ label, value, icon: Icon, gradient }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  );
}

function ChartCard({ title, icon: Icon, children }) {
  return (
    <div className="card p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-brand-500" /> {title}
      </h3>
      {children}
    </div>
  );
}
