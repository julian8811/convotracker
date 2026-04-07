import { Component, React } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ConvocatoriasList from './pages/ConvocatoriasList';
import ConvocatoriaDetail from './pages/ConvocatoriaDetail';
import DashboardPage from './pages/DashboardPage';
import ScrapingPage from './pages/ScrapingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Favorites from './pages/Favorites';
import NotFound from './pages/NotFound';
import ErrorPage from './pages/ErrorPage';

const basename = import.meta.env.BASE_URL || '/';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#f9fafb',
          flexDirection: 'column',
          gap: 16,
          padding: 20,
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Algo salió mal</h1>
          <p style={{ color: '#9ca3af', maxWidth: 400, textAlign: 'center' }}>
            Ha ocurrido un error inesperado. Por favor, recarga la página o contacta soporte.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              background: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router basename={basename}>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/convocatorias" element={<ConvocatoriasList />} />
            <Route path="/convocatorias/:id" element={<ConvocatoriaDetail />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/scraping" element={<ScrapingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}
