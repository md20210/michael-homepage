import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Send, Trash2, FileText, LogOut, Sparkles } from 'lucide-react';
import { assistantAPI, documentAPI, chatAPI, userAPI } from '../api';

function Dashboard() {
  const navigate = useNavigate();
  const [assistant, setAssistant] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadAssistant();
  }, []);

  useEffect(() => {
    if (assistant) {
      loadDocuments();
      loadMessages();
    }
  }, [assistant]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAssistant = async () => {
    try {
      const response = await assistantAPI.getAll();
      if (response.data.length > 0) {
        setAssistant(response.data[0]);
      } else {
        // Create new assistant
        const newAssistant = await assistantAPI.create();
        setAssistant(newAssistant.data);
      }
    } catch (error) {
      console.error('Error loading assistant:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await documentAPI.getAll(assistant.id);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getMessages(assistant.id);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await documentAPI.upload(assistant.id, file);
      await loadDocuments();
      alert('Dokument erfolgreich hochgeladen und verarbeitet!');
    } catch (error) {
      alert(error.response?.data?.detail || 'Fehler beim Hochladen');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const messageText = inputMessage;
    setInputMessage('');
    setSending(true);

    try {
      const response = await chatAPI.sendMessage(assistant.id, messageText);
      await loadMessages();
    } catch (error) {
      alert(error.response?.data?.detail || 'Fehler beim Senden');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (!confirm('Wirklich ALLE deine Daten löschen? Dies kann nicht rückgängig gemacht werden!')) {
      return;
    }

    try {
      await userAPI.deleteMyData();
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      alert('Fehler beim Löschen der Daten');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!assistant) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Lade Workspace...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo-small">
          <Sparkles size={24} />
          <h2>PrivateGPT</h2>
        </div>
        <div className="header-actions">
          <button onClick={handleLogout} className="btn-icon" title="Ausloggen">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3>📚 Dokumente ({documents.length})</h3>

          <div className="upload-section">
            <label className="upload-btn">
              <Upload size={18} />
              <span>{uploading ? 'Lädt hoch...' : 'PDF hochladen'}</span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="documents-list">
            {documents.map((doc) => (
              <div key={doc.id} className="document-item">
                <FileText size={16} />
                <div className="document-info">
                  <div className="document-name">{doc.filename}</div>
                  <div className="document-meta">
                    {Math.round(doc.file_size / 1024)} KB
                    {doc.processed ? ' ✅' : ' ⏳'}
                  </div>
                </div>
              </div>
            ))}
            {documents.length === 0 && (
              <p className="empty-state">Noch keine Dokumente hochgeladen</p>
            )}
          </div>

          <div className="danger-zone">
            <button onClick={handleDeleteAllData} className="btn-danger">
              <Trash2 size={18} />
              Alle Daten löschen
            </button>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="chat-area">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <Sparkles size={48} />
                <h2>Hallo! 👋</h2>
                <p>
                  Lade ein PDF hoch und stelle mir Fragen dazu.
                  <br />
                  Oder chatte einfach mit mir!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{msg.content}</div>
                    <div className="message-time">
                      {new Date(msg.created_at).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input">
            <input
              type="text"
              placeholder="Stelle eine Frage..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={sending}
            />
            <button type="submit" disabled={sending || !inputMessage.trim()}>
              <Send size={20} />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
