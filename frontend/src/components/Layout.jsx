import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Globe, BarChart3, Bot, Menu, X, ChevronRight, Radar } from 'lucide-react';

const navItems = [
  { path: '/',              label: 'Inicio',         icon: Globe,    color: '#06b6d4' },
  { path: '/convocatorias', label: 'Convocatorias',   icon: Search,   color: '#22c55e' },
  { path: '/dashboard',     label: 'Dashboard',       icon: BarChart3,color: '#a855f7' },
  { path: '/scraping',      label: 'Scraping',        icon: Bot,      color: '#f97316' },
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen">
      {/* Overlay móvil */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(2,6,23,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-60 transform transition-transform duration-300 ease-out lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'radial-gradient(circle at top, rgba(12,15,30,0.99), rgba(2,6,23,1))',
          borderRight: '1px solid rgba(148,163,184,0.14)',
          boxShadow: '4px 0 40px rgba(0,0,0,0.7)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}
        >
          <div
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'radial-gradient(circle at 30% 20%, rgba(79,70,229,0.6), rgba(6,182,212,0.3))',
              border: '1px solid rgba(148,163,184,0.4)',
              boxShadow: '0 0 0 4px rgba(79,70,229,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Radar style={{ width: 20, height: 20, color: '#a5b4fc' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: 15, fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.02em', margin: 0 }}>
              ConvoTracker
            </p>
            <p style={{ fontSize: 10, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 1 }}>
              Vigilancia global
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden"
            style={{ padding: 6, borderRadius: 8, color: '#6b7280', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Navegación */}
        <nav style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 12,
                  textDecoration: 'none',
                  background: isActive ? `rgba(${item.color === '#06b6d4' ? '6,182,212' : item.color === '#22c55e' ? '34,197,94' : item.color === '#a855f7' ? '168,85,247' : '249,115,22'},0.1)` : 'transparent',
                  border: `1px solid ${isActive ? `${item.color}33` : 'transparent'}`,
                  transition: 'all 200ms ease-out',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(148,163,184,0.05)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span
                  style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: isActive ? `${item.color}22` : 'rgba(148,163,184,0.06)',
                    border: `1px solid ${isActive ? item.color + '44' : 'rgba(148,163,184,0.12)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <Icon style={{ width: 16, height: 16, color: isActive ? item.color : '#6b7280' }} />
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, color: isActive ? '#f9fafb' : '#9ca3af', flex: 1 }}>
                  {item.label}
                </span>
                {isActive && <ChevronRight style={{ width: 13, height: 13, color: item.color }} />}
              </Link>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '12px 12px 16px',
            borderTop: '1px solid rgba(148,163,184,0.1)',
          }}
        >
          <div
            style={{
              padding: '10px 12px', borderRadius: 12,
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(148,163,184,0.14)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
              <span
                style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 0 3px rgba(34,197,94,0.25)',
                  animation: 'pulseDot 2.5s ease-in-out infinite',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af' }}>Sistema activo</span>
            </div>
            <p style={{ fontSize: 10, color: '#4b5563', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
              ConvoTracker v1.0 — Scraping diario
            </p>
          </div>
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <div className="lg:ml-60">
        {/* Topbar */}
        <header
          style={{
            position: 'sticky', top: 0, zIndex: 30,
            background: 'rgba(6,7,20,0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(148,163,184,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px' }}>
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden"
              style={{
                padding: '7px', borderRadius: 9,
                background: 'rgba(148,163,184,0.06)',
                border: '1px solid rgba(148,163,184,0.18)',
                color: '#9ca3af', cursor: 'pointer',
              }}
            >
              <Menu style={{ width: 18, height: 18 }} />
            </button>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 0 3px rgba(34,197,94,0.25)',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12, color: '#6b7280', letterSpacing: '0.06em' }}>
                Monitoreo activo
              </span>
            </div>
          </div>
        </header>

        <main style={{ padding: '28px 28px 48px', minHeight: 'calc(100vh - 52px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
