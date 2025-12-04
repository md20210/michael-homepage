// src/components/VoiceBot.jsx - Section 05-06
import React from 'react';

const VoiceBot = ({ t }) => {
    return (
        <section id="voicebot" className="section">
            <div style={{ width: '100%' }}>
                <div className="step-indicator">
                    <div className="step-number">05</div>
                    <div className="step-line"></div>
                    <div className="step-number" style={{ color: '#ffd700' }}>06</div>
                </div>

                <h2 className="main-title" style={{ fontSize: '48px', marginBottom: '30px', textAlign: 'center' }}>
                    {t('voicebot-title')}
                </h2>

                <div className="voicebot-section" style={{
                    background: 'rgba(15, 15, 35, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '20px',
                    padding: '40px',
                    maxWidth: '900px',
                    margin: '0 auto',
                    textAlign: 'center'
                }}>
                    <div className="voicebot-icon" style={{
                        fontSize: '80px',
                        marginBottom: '30px'
                    }}>
                        📞
                    </div>

                    <h3 style={{
                        fontSize: '32px',
                        color: '#ffd700',
                        marginBottom: '20px'
                    }}>
                        {t('voicebot-header')}
                    </h3>

                    <p style={{
                        fontSize: '24px',
                        color: '#ffffff',
                        marginBottom: '15px',
                        fontWeight: 'bold'
                    }}>
                        <a href="tel:+34936945855" style={{
                            color: '#ffd700',
                            textDecoration: 'none',
                            borderBottom: '2px solid #ffd700',
                            paddingBottom: '5px'
                        }}>
                            +34 93 694 5855
                        </a>
                    </p>

                    <p style={{
                        fontSize: '18px',
                        lineHeight: '1.8',
                        color: '#e0e0e0',
                        marginBottom: '30px'
                    }} dangerouslySetInnerHTML={{ __html: t('voicebot-description') }} />

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '20px',
                        marginTop: '30px'
                    }}>
                        <div style={{
                            background: 'rgba(255, 215, 0, 0.1)',
                            padding: '20px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 215, 0, 0.3)'
                        }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🇬🇧</div>
                            <h4 style={{ color: '#ffd700', marginBottom: '5px' }}>English</h4>
                            <p style={{ fontSize: '14px', color: '#e0e0e0' }}>AI Voice Assistant</p>
                        </div>

                        <div style={{
                            background: 'rgba(255, 215, 0, 0.1)',
                            padding: '20px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 215, 0, 0.3)'
                        }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🇩🇪</div>
                            <h4 style={{ color: '#ffd700', marginBottom: '5px' }}>Deutsch</h4>
                            <p style={{ fontSize: '14px', color: '#e0e0e0' }}>KI Sprachassistent</p>
                        </div>

                        <div style={{
                            background: 'rgba(255, 215, 0, 0.1)',
                            padding: '20px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 215, 0, 0.3)'
                        }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🇪🇸</div>
                            <h4 style={{ color: '#ffd700', marginBottom: '5px' }}>Español</h4>
                            <p style={{ fontSize: '14px', color: '#e0e0e0' }}>Asistente de Voz IA</p>
                        </div>
                    </div>

                    <p style={{
                        fontSize: '14px',
                        color: '#888',
                        marginTop: '30px',
                        fontStyle: 'italic'
                    }}>
                        {t('voicebot-tech')}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default VoiceBot;
