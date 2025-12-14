// src/pages/Dashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Send, Trash2, FileText, LogOut, Sparkles, X, Settings, Loader2 } from 'lucide-react';
import { assistantAPI, documentAPI, chatAPI, userAPI, adminAPI } from '../api';
import AILogo from '../components/AILogo';
import AdminPanel from '../components/AdminPanel';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [assistant, setAssistant] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(null); // Track which document is being deleted
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [toasts, setToasts] = useState([]); // Toast notifications
  const messagesEndRef = useRef(null);

  // Auto-Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if user is admin
  useEffect(() => {
    checkAdminStatus();
  }, []);

  // Load Assistant → Docs → Messages
  useEffect(() => {
    loadAssistant();
  }, []);

  useEffect(() => {
    if (assistant) {
      loadDocuments();
      loadMessages();
    }
  }, [assistant]);

  // Toast helper
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const checkAdminStatus = async () => {
    try {
      const res = await adminAPI.isAdmin();
      setIsAdmin(res.data.is_admin);
    } catch (err) {
      console.error('Admin check failed:', err);
      setIsAdmin(false);
    }
  };

  const loadAssistant = async () => {
    try {
      const res = await assistantAPI.getAll();
      if (res.data.length > 0) setAssistant(res.data[0]);
      else {
        const newAss = await assistantAPI.create();
        setAssistant(newAss.data);
      }
    } catch (err) { console.error(err); }
  };

  const loadDocuments = async () => {
    if (!assistant) return;
    const res = await documentAPI.getAll(assistant.id);
    setDocuments(res.data || []);
  };

  const loadMessages = async () => {
    if (!assistant) return;
    const res = await chatAPI.getMessages(assistant.id);
    setMessages(res.data || []);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !assistant) return;
    setUploading(true);
    try {
      await documentAPI.upload(assistant.id, file);
      await loadDocuments();
      addToast('PDF erfolgreich hochgeladen & verarbeitet!', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Upload fehlgeschlagen', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (documentId, filename) => {
    if (!confirm(`Dokument "${filename}" wirklich löschen?`)) return;

    setDeleting(documentId); // Show loading state for this document
    try {
      await documentAPI.delete(assistant.id, documentId);
      await loadDocuments();
      addToast('Dokument erfolgreich gelöscht', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Löschen fehlgeschlagen', 'error');
    } finally {
      setDeleting(null); // Clear loading state
    }
  };

  const handleDeleteChat = async () => {
    if (messages.length === 0) {
      addToast('Keine Nachrichten zum Löschen', 'info');
      return;
    }

    if (!confirm('Chat-Verlauf wirklich löschen? (Dokumente bleiben erhalten)')) return;

    try {
      await chatAPI.deleteMessages(assistant.id);
      setMessages([]);
      addToast('Chat-Verlauf gelöscht', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Löschen fehlgeschlagen', 'error');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending || !assistant) return;

    const text = inputMessage;
    setInputMessage('');

    // Sofort User-Nachricht anzeigen (optimistic update)
    const tempUserMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMessage]);
    setSending(true);

    try {
      await chatAPI.sendMessage(assistant.id, text);
      await loadMessages(); // Lädt alle Nachrichten inkl. AI-Antwort
    } catch (err) {
      addToast(err.response?.data?.detail || 'Nachricht konnte nicht gesendet werden', 'error');
      // Bei Fehler die optimistische Nachricht wieder entfernen
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Wirklich ALLE Daten löschen? (inkl. Dokumente & Chats)')) return;
    await userAPI.deleteMyData();
    localStorage.removeItem('token');
    window.location.href = 'https://www.dabrock.eu/#kapitel-7-7';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Redirect zu Homepage Kapitel 7-7
    window.location.href = 'https://www.dabrock.eu/#kapitel-7-7';
  };

  if (!assistant) {
    return <div className="loading-screen"><div className="spinner"></div><p>Lade PrivateGxT...</p></div>;
  }

  return (
    <div className="privategpt-dashboard">
      {/* Header fixiert oben */}
      <header className="header">
        <div className="logo-small">
          <AILogo size="small" />
          <h1>PrivateGxT</h1>
        </div>
        <div className="header-actions">
          {isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="btn-icon"
              title="Admin Panel"
            >
              <Settings size={22} />
            </button>
          )}
          <button onClick={handleLogout} className="btn-icon" title="Abmelden">
            <LogOut size={22} />
          </button>
        </div>
      </header>

      {/* Hauptbereich horizontal geteilt */}
      <div className="dashboard-main">
        {/* LINKE SEITE: Dokumente */}
        <div className="documents-panel">
          <section className="documents-section">
            <h3>Dokumente ({documents.length})</h3>
            <label className="upload-btn">
              <Upload size={18} />
              {uploading ? 'Lädt hoch...' : 'PDF hochladen'}
              <input type="file" accept=".pdf" onChange={handleFileUpload} hidden disabled={uploading} />
            </label>
          </section>

          <div className="documents-container">
            <div className="documents-list">
              {documents.length === 0 ? (
                <div className="empty-state">Noch keine PDFs hochgeladen</div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="document-item">
                    <FileText size={16} />
                    <div className="document-info">
                      <div className="document-name">{doc.filename}</div>
                      <div className="document-meta">
                        {Math.round(doc.file_size / 1024)} KB
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(doc.id, doc.filename)}
                      className="btn-delete-doc"
                      title="Dokument löschen"
                      disabled={deleting === doc.id}
                    >
                      {deleting === doc.id ? (
                        <Loader2 size={16} className="spinner" />
                      ) : (
                        <X size={16} />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="documents-footer">
            <button onClick={handleDeleteAll} className="btn-danger">
              <Trash2 size={18} />
              Alle Daten löschen
            </button>
          </div>
        </div>

        {/* RECHTE SEITE: Chat */}
        <div className="chat-area">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <AILogo size="large" />
                <h2>Hallo! Ich bin Dein persönlicher DSGVO-konformer ChatBot.</h2>
                <div className="welcome-features">
                  <p className="welcome-intro">Ich kann:</p>
                  <ul className="features-list">
                    <li>📄 Deine Dokumente analysieren</li>
                    <li>🔍 Im Internet recherchieren (ohne Deine Daten preiszugeben)</li>
                    <li>💬 Fragen basierend auf hochgeladenen PDFs beantworten</li>
                  </ul>
                  <p className="privacy-note">
                    🔒 Deine Daten bleiben privat und werden nicht an Dritte weitergegeben.
                  </p>
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  <div className="message-avatar">{msg.role === 'user' ? 'Du' : 'AI'}</div>
                  <div className="message-content">
                    <div className="message-text">{msg.content}</div>
                    <div className="message-footer">
                      {msg.role === 'assistant' && msg.source_type && (
                        <div className={`source-badge source-${msg.source_type}`}>
                          {msg.source_type === 'llm_only' && '🤖 Direkt vom LLM'}
                          {msg.source_type === 'rag' && `📄 ${msg.source_details || 'Aus Dokumenten'}`}
                          {msg.source_type === 'hybrid' && `🌐 ${msg.source_details || 'Web-Suche + Dokumente'}`}
                        </div>
                      )}
                      <div className="message-time">
                        {new Date(msg.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="message assistant">
                <div className="message-avatar">AI</div>
                <div className="message-content">
                  <div className="typing-indicator"><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-footer">
            {messages.length > 0 && (
              <button
                onClick={handleDeleteChat}
                className="btn-delete-chat"
                title="Chat-Verlauf löschen"
              >
                <Trash2 size={18} />
              </button>
            )}
            <form onSubmit={handleSendMessage} className="chat-input">
              <input
                type="text"
                placeholder="Nachricht an PrivateGxT..."
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                disabled={sending}
              />
              <button type="submit" disabled={sending || !inputMessage.trim()}>
                <Send size={20} />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Admin Panel Modal */}
      {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} />}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
