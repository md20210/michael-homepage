import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Sparkles } from 'lucide-react';
import { authAPI } from '../api';
import LanguageSwitcher from '../components/LanguageSwitcher';
import DarkModeToggle from '../components/DarkModeToggle';

function Login({ setIsAuthenticated }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.requestMagicLink(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || t('login.error', 'Fehler beim Senden des Links'));
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

        {!sent ? (
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

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t('login.sending', 'Wird gesendet...') : `🔐 ${t('login.sendLink')}`}
            </button>

            <p className="info">
              <small>
                {t('login.info')}
              </small>
            </p>
          </form>
        ) : (
          <div className="success-message">
            <h2>📧 {t('login.checkEmail')}</h2>
            <p>{t('login.linkSent', { email })}</p>
            <p>{t('login.clickLink', 'Klicke auf den Link in der E-Mail, um dich anzumelden.')}</p>
            <p className="small">{t('login.linkValid', 'Der Link ist 15 Minuten gültig.')}</p>

            <button onClick={() => setSent(false)} className="btn-secondary">
              {t('login.backToLogin')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
