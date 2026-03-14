import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ConvocatoriasList from './pages/ConvocatoriasList';
import ConvocatoriaDetail from './pages/ConvocatoriaDetail';
import DashboardPage from './pages/DashboardPage';
import ScrapingPage from './pages/ScrapingPage';

const basename = import.meta.env.BASE_URL || '/';
export default function App() {
  return (
    <Router basename={basename}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/convocatorias" element={<ConvocatoriasList />} />
          <Route path="/convocatorias/:id" element={<ConvocatoriaDetail />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/scraping" element={<ScrapingPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
