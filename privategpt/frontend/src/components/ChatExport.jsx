import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, FileJson } from 'lucide-react';
import { exportChatAsTXT, exportChatAsJSON } from '../utils/chatExport';
import './ChatExport.css';

export default function ChatExport({ messages }) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);

  const handleExportTXT = () => {
    exportChatAsTXT(messages);
    setShowMenu(false);
  };

  const handleExportJSON = () => {
    exportChatAsJSON(messages);
    setShowMenu(false);
  };

  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className="chat-export-container">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="btn-export"
        title={t('chat.export.title', 'Chat exportieren')}
      >
        <Download size={18} />
      </button>

      {showMenu && (
        <>
          <div className="export-backdrop" onClick={() => setShowMenu(false)} />
          <div className="export-menu">
            <button onClick={handleExportTXT} className="export-option">
              <FileText size={16} />
              <span>{t('chat.export.txt', 'Als TXT')}</span>
            </button>
            <button onClick={handleExportJSON} className="export-option">
              <FileJson size={16} />
              <span>{t('chat.export.json', 'Als JSON')}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
