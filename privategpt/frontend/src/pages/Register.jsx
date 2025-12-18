import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, Sparkles, Lock, UserPlus } from 'lucide-react';
import { authAPI } from '../api';
import LanguageSwitcher from '../components/LanguageSwitcher';
import DarkModeToggle from '../components/DarkModeToggle';

function Register({ setIsAuthenticated }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (password !== passwordConfirm) {
      setError('Passwörter stimmen nicht überein');
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register(email, password);
      localStorage.setItem('token', response.data.access_token);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
          <LanguageSwitcher />
          <DarkModeToggle />
        </div>

        <div className="logo">
          <UserPlus size={48} />
          <h1>Registrierung</h1>
          <p>Erstelle deinen PrivateGPT Account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <Mail size={20} />
            <input
              type="email"
              placeholder="E-Mail Adresse"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={20} />
            <input
              type="password"
              placeholder="Passwort (min. 8 Zeichen)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="input-group">
            <Lock size={20} />
            <input
              type="password"
              placeholder="Passwort wiederholen"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Registriere...' : '✨ Account erstellen'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            <small>
              Schon einen Account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Jetzt anmelden</Link>
            </small>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
