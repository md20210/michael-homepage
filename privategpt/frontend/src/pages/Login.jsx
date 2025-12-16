import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Sparkles, Lock } from 'lucide-react';
import { authAPI } from '../api';
import LanguageSwitcher from '../components/LanguageSwitcher';
import DarkModeToggle from '../components/DarkModeToggle';

function Login({ setIsAuthenticated }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.data.access_token);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.response?.data?.detail || t('login.error', 'Falsche E-Mail oder Passwort'));
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
          <Sparkles size={48} />
          <h1>{t('login.title')}</h1>
          <p>{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <Mail size={20} />
            <input
              type="email"
              placeholder={t('login.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={20} />
            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? t('login.sending', 'Anmelden...') : `🔐 ${t('login.login', 'Anmelden')}`}
          </button>

          <p className="info">
            <small>
              {t('login.info')}
            </small>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
