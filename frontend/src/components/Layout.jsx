import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Search, Globe, BarChart3, Bot,
  Menu, X, ChevronRight, Radar
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Inicio', icon: Globe },
  { path: '/convocatorias', label: 'Convocatorias', icon: Search },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/scraping', label: 'Scraping', icon: Bot },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 gradient-hero text-white transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Radar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">ConvoTracker</h1>
            <p className="text-xs text-blue-200">Vigilancia Tecnológica</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 group
                  ${isActive
                    ? 'bg-white/20 text-white shadow-lg shadow-black/10'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'}`} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs text-blue-200 font-medium">ConvoTracker v1.0</p>
            <p className="text-xs text-blue-300/70 mt-1">Scraping automático diario</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between px-4 lg:px-8 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-500">Sistema activo</span>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
