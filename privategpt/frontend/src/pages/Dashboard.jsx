// src/pages/Dashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Send, Trash2, FileText, LogOut, Sparkles } from 'lucide-react';
import { assistantAPI, documentAPI, chatAPI, userAPI } from '../api';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [assistant, setAssistant] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      alert('PDF erfolgreich hochgeladen & verarbeitet!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
      e.target.value = '';
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
      alert(err.response?.data?.detail || 'Nachricht konnte nicht gesendet werden');
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
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!assistant) {
    return <div className="loading-screen"><div className="spinner"></div><p>Lade PrivateGPT...</p></div>;
  }

  return (
    <div className="privategpt-dashboard">
      {/* Header fixiert oben */}
      <header className="header">
        <div className="logo-small">
          <Sparkles size={28} />
          <h1>PrivateGPT</h1>
        </div>
        <button onClick={handleLogout} className="btn-icon" title="Abmelden">
          <LogOut size={22} />
        </button>
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
                    <div>
                      <div className="document-name">{doc.filename}</div>
                      <div className="document-meta">
                        {Math.round(doc.file_size / 1024)} KB {doc.processed ? '✅' : '⏳'}
                      </div>
                    </div>
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
                <Sparkles size={56} />
                <h2>Willkommen bei PrivateGPT!</h2>
                <p>Lade PDFs hoch und stelle mir Fragen dazu – 100% privat & DSGVO-konform</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  <div className="message-avatar">{msg.role === 'user' ? 'Du' : 'AI'}</div>
                  <div className="message-content">
                    <div className="message-text">{msg.content}</div>
                    <div className="message-time">
                      {new Date(msg.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
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
            <form onSubmit={handleSendMessage} className="chat-input">
              <input
                type="text"
                placeholder="Nachricht an PrivateGPT..."
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
    </div>
  );
}
