import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api';

function VerifyMagicLink({ setIsAuthenticated }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setError('Kein Token gefunden');
        return;
      }

      try {
        const response = await authAPI.verifyMagicLink(token);
        localStorage.setItem('token', response.data.access_token);
        setIsAuthenticated(true);
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.detail || 'Ungültiger oder abgelaufener Link');
      }
    };

    verify();
  }, [searchParams, navigate, setIsAuthenticated]);

  if (error) {
    return (
      <div className="verify-page">
        <div className="error-container">
          <h2>❌ Fehler</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Zurück zum Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-page">
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verifiziere Login-Link...</p>
      </div>
    </div>
  );
}

export default VerifyMagicLink;
