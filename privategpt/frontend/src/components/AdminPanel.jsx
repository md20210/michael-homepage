import { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import './AdminPanel.css';

function AdminPanel({ onClose }) {
  const [models, setModels] = useState([]);
  const [currentModel, setCurrentModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load available models and current model
      const [modelsRes, currentRes] = await Promise.all([
        adminAPI.getModels(),
        adminAPI.getCurrentModel()
      ]);

      setModels(modelsRes.data);
      setCurrentModel(currentRes.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('Fehler beim Laden der Admin-Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleModelChange = async (modelId) => {
    try {
      setSwitching(true);
      setError('');
      setSuccess('');

      const response = await adminAPI.setModel(modelId);

      setSuccess(response.data.message);

      // Reload current model info
      const currentRes = await adminAPI.getCurrentModel();
      setCurrentModel(currentRes.data);

      // Auto-close success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error switching model:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Fehler beim Wechseln des Modells';
      setError(`Fehler: ${errorMessage}`);
    } finally {
      setSwitching(false);
    }
  };

  const handleClose = (e) => {
    if (e.target.className === 'admin-modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={handleClose}>
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h2>⚙️ Admin Panel</h2>
          <button className="admin-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="admin-modal-body">
          {loading ? (
            <div className="admin-loading">Laden...</div>
          ) : (
            <>
              {/* Current Model Info */}
              <div className="admin-current-model">
                <h3>Aktuelles Modell</h3>
                {currentModel && (
                  <div className="current-model-info">
                    <div className="model-name">{currentModel.model_name}</div>
                    <div className="model-details">
                      <span>📦 {currentModel.model_info.filename}</span>
                      <span>💾 {currentModel.model_info.size_gb} GB</span>
                      <span>🔢 {currentModel.model_info.params}</span>
                      <span className={`quality quality-${currentModel.model_info.quality.toLowerCase()}`}>
                        {currentModel.model_info.quality}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Model Selection */}
              <div className="admin-model-selection">
                <h3>Verfügbare Modelle</h3>
                <div className="model-list">
                  {models.map((model) => (
                    <div
                      key={model.id}
                      className={`model-card ${currentModel?.model_id === model.id ? 'active' : ''}`}
                    >
                      <div className="model-card-header">
                        <h4>{model.name}</h4>
                        <span className={`quality quality-${model.quality.toLowerCase()}`}>
                          {model.quality}
                        </span>
                      </div>
                      <div className="model-card-body">
                        <p className="model-description">{model.description}</p>
                        <div className="model-specs">
                          <span>📦 {model.filename}</span>
                          <span>💾 {model.size_gb} GB</span>
                          <span>🔢 {model.params} Parameter</span>
                        </div>
                      </div>
                      <div className="model-card-footer">
                        {currentModel?.model_id === model.id ? (
                          <button className="btn-active" disabled>
                            ✓ Aktiv
                          </button>
                        ) : (
                          <button
                            className="btn-select"
                            onClick={() => handleModelChange(model.id)}
                            disabled={switching}
                          >
                            {switching ? 'Wechsle...' : 'Auswählen'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Messages */}
              {error && <div className="admin-error">{error}</div>}
              {success && <div className="admin-success">{success}</div>}
            </>
          )}
        </div>

        <div className="admin-modal-footer">
          <p className="admin-note">
            ℹ️ Der Modellwechsel wird beim nächsten Chat-Request aktiv.
          </p>
          <button className="btn-close" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
