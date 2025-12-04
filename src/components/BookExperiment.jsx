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
                    <div className="step-number" style={{ color: '#ffd700' }}>07</div>
                </div>

                <h2 className="main-title" style={{ fontSize: '48px', marginBottom: '30px', textAlign: 'center' }}>
                    {t('book-title')}
                </h2>

                <div className="chatbot-section">
                    <div className="chatbot-content">
                        <div className="chat-info">
                            <h3 dangerouslySetInnerHTML={{ __html: t('book-header') }} />
                            <p dangerouslySetInnerHTML={{ __html: t('book-description') }} />

                            <div style={{ marginTop: '30px', marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '20px', color: '#ffd700', marginBottom: '15px' }}>
                                    {t('book-process-title')}
                                </h4>
                                <p style={{ marginBottom: '15px' }}>
                                    {t('book-process-desc')}
                                </p>
                                <ul style={{
                                    listStyle: 'none',
                                    padding: '0',
                                    marginBottom: '20px'
                                }}>
                                    <li style={{ marginBottom: '10px', fontSize: '15px' }}
                                        dangerouslySetInnerHTML={{ __html: `• ${t('book-grok')}` }} />
                                    <li style={{ marginBottom: '10px', fontSize: '15px' }}
                                        dangerouslySetInnerHTML={{ __html: `• ${t('book-claude')}` }} />
                                    <li style={{ marginBottom: '10px', fontSize: '15px' }}
                                        dangerouslySetInnerHTML={{ __html: `• ${t('book-chatgpt')}` }} />
                                    <li style={{ marginBottom: '10px', fontSize: '15px' }}
                                        dangerouslySetInnerHTML={{ __html: `• ${t('book-elevenlabs')}` }} />
                                </ul>

                                <h4 style={{ fontSize: '20px', color: '#ffd700', marginBottom: '15px' }}>
                                    {t('book-insight-title')}
                                </h4>
                                <p style={{ marginBottom: '20px' }}>
                                    {t('book-insight-desc')}
                                </p>
                            </div>

                            <a
                                href="https://www.dabrock.eu/Michael_Dabrock_Audiobook.mp3"
                                className="cta-button"
                                onClick={handleAudiobookClick}
                                rel="noopener noreferrer"
                            >
                                {t('book-listen')}
                            </a>
                        </div>

                        <div className="chat-box" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '40px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '80px', marginBottom: '20px' }}>
                                📖
                            </div>
                            <h3 style={{
                                fontSize: '28px',
                                color: '#ffd700',
                                marginBottom: '20px',
                                fontWeight: 'bold'
                            }}>
                                {t('book-title')}
                            </h3>
                            <p style={{
                                fontSize: '18px',
                                color: '#ffffff',
                                marginBottom: '30px',
                                maxWidth: '400px',
                                lineHeight: '1.6'
                            }}>
                                More than 6 hours of AI-generated audiobook content created in a single day
                            </p>
                            <div style={{
                                width: '100%',
                                maxWidth: '400px',
                                background: 'rgba(255, 215, 0, 0.1)',
                                border: '1px solid rgba(255, 215, 0, 0.3)',
                                borderRadius: '10px',
                                padding: '20px',
                                marginBottom: '20px'
                            }}>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#00ff00',
                                    marginBottom: '10px'
                                }}>
                                    🎯 File Size: 364 MB
                                </p>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#00ff00',
                                    marginBottom: '10px'
                                }}>
                                    ⏱️ Duration: 6+ Hours
                                </p>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#00ff00'
                                }}>
                                    🤖 Format: MP3
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BookExperiment;
