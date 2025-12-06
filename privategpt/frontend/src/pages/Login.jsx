import { useState } from 'react';
import { Mail, Sparkles } from 'lucide-react';
import { authAPI } from '../api';

function Login({ setIsAuthenticated }) {
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
      setError(err.response?.data?.detail || 'Fehler beim Senden des Links');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo">
          <Sparkles size={48} />
          <h1>Dabrock PrivateGxT</h1>
          <p>DSGVO-konforme KI mit deinen Dokumenten</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <Mail size={20} />
              <input
                type="email"
                placeholder="deine@email.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Wird gesendet...' : '🔐 Login-Link senden'}
            </button>

            <p className="info">
              <small>
                Du erhältst einen einmaligen Login-Link per E-Mail.
                <br />
                Kein Passwort erforderlich!
              </small>
            </p>
          </form>
        ) : (
          <div className="success-message">
            <h2>📧 E-Mail versendet!</h2>
            <p>Prüfe dein Postfach: <strong>{email}</strong></p>
            <p>Klicke auf den Link in der E-Mail, um dich anzumelden.</p>
            <p className="small">Der Link ist 15 Minuten gültig.</p>

            <button onClick={() => setSent(false)} className="btn-secondary">
              Neue E-Mail senden
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
