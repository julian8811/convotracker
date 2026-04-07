import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, setToken } from '../services/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const result = await register({ email, password, nombre });
      setToken(result.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: '#1e293b',
        borderRadius: 16,
        padding: '32px 28px',
        border: '1px solid rgba(148,163,184,0.1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#f9fafb',
            marginBottom: 8,
          }}>
            Crear Cuenta
          </h1>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
              Inicia Sesión
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171',
              fontSize: 13,
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Nombre (opcional)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Email
            </label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Contraseña
            </label>
            <input
              type="password"
              required
              minLength={8}
              className="input-field"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Confirmar Contraseña
            </label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: 8, opacity: loading ? 0.65 : 1 }}
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
}
