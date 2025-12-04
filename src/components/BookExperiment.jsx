// src/components/BookExperiment.jsx
import React from 'react';

const BookExperiment = ({ t, currentLang }) => {
    const API_BASE = 'https://michael-homepage-production.up.railway.app';

    const handleAudiobookClick = async (e) => {
        e.preventDefault();

        // Track the click
        try {
            await fetch(`${API_BASE}/api/track-audiobook-click`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language: currentLang,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                })
            });
            console.log('📖 Audiobook click tracked');
        } catch (error) {
            console.error('❌ Failed to track audiobook click:', error);
        }

        // Open audiobook link
        window.open('https://www.dabrock.eu/Michael_Dabrock_Audiobook.mp3', '_blank');
    };

    return (
        <section id="book" className="section">
            <div style={{ width: '100%' }}>
                <div className="step-indicator">
                    <div className="step-number">06</div>
                    <div className="step-line"></div>
                    <div className="step-number" style={{ color: '#ffd700' }}>06</div>
                </div>

                <h2 className="main-title" style={{ fontSize: '48px', marginBottom: '30px', textAlign: 'center' }}>
                    {t('book-title')}
                </h2>

                <div className="book-section">
                    <div className="book-content">
                        <div className="book-header-container">
                            <h3 style={{ fontSize: '28px', marginBottom: '20px', color: '#00ff00' }}>
                                {t('book-header')}
                            </h3>
                            <p style={{ fontSize: '18px', lineHeight: '1.8', marginBottom: '30px' }}>
                                {t('book-description')}
                            </p>
                        </div>

                        <div className="book-process">
                            <h4 style={{ fontSize: '24px', marginBottom: '15px', color: '#ffd700' }}>
                                {t('book-process-title')}
                            </h4>
                            <p style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '20px' }}>
                                {t('book-process-desc')}
                            </p>

                            <ul className="ai-tools-list" style={{
                                listStyle: 'none',
                                padding: '0',
                                marginBottom: '30px'
                            }}>
                                <li style={{
                                    marginBottom: '12px',
                                    fontSize: '16px',
                                    lineHeight: '1.6',
                                    paddingLeft: '0'
                                }} dangerouslySetInnerHTML={{ __html: `• ${t('book-grok')}` }} />
                                <li style={{
                                    marginBottom: '12px',
                                    fontSize: '16px',
                                    lineHeight: '1.6',
                                    paddingLeft: '0'
                                }} dangerouslySetInnerHTML={{ __html: `• ${t('book-claude')}` }} />
                                <li style={{
                                    marginBottom: '12px',
                                    fontSize: '16px',
                                    lineHeight: '1.6',
                                    paddingLeft: '0'
                                }} dangerouslySetInnerHTML={{ __html: `• ${t('book-chatgpt')}` }} />
                                <li style={{
                                    marginBottom: '12px',
                                    fontSize: '16px',
                                    lineHeight: '1.6',
                                    paddingLeft: '0'
                                }} dangerouslySetInnerHTML={{ __html: `• ${t('book-elevenlabs')}` }} />
                            </ul>
                        </div>

                        <div className="book-insights">
                            <h4 style={{ fontSize: '24px', marginBottom: '15px', color: '#ffd700' }}>
                                {t('book-insight-title')}
                            </h4>
                            <p style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '30px' }}>
                                {t('book-insight-desc')}
                            </p>
                        </div>

                        <div className="book-cta" style={{ textAlign: 'center' }}>
                            <a
                                href="https://www.dabrock.eu/Michael_Dabrock_Audiobook.mp3"
                                className="cta-button"
                                onClick={handleAudiobookClick}
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-block',
                                    fontSize: '18px',
                                    padding: '15px 30px'
                                }}
                            >
                                {t('book-listen')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BookExperiment;
