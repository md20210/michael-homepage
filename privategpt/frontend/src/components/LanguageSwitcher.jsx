// src/components/LanguageSwitcher.jsx
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'de', label: '🇩🇪 DE', name: 'Deutsch' },
    { code: 'en', label: '🇬🇧 EN', name: 'English' },
    { code: 'es', label: '🇪🇸 ES', name: 'Español' },
  ];

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="language-switcher">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`lang-btn ${i18n.language === lang.code ? 'active' : ''}`}
          title={lang.name}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
