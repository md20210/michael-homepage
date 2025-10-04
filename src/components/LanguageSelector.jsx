// src/components/LanguageSelector.jsx
import React from 'react';

const LanguageSelector = ({ currentLang, onLanguageChange }) => {
    const languages = [
        { code: 'en', label: 'EN' },
        { code: 'de', label: 'DE' },
        { code: 'es', label: 'ES' }
    ];

    return (
        <div className="language-switcher">
            {languages.map(lang => (
                <button
                    key={lang.code}
                    className={currentLang === lang.code ? 'active' : ''}
                    onClick={() => onLanguageChange(lang.code)}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
};

export default LanguageSelector;