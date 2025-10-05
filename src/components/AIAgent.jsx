// src/components/AIAgent.jsx
import React from 'react';

const AIAgent = ({ t }) => {
    return (
        <section id="ai-agent" className="section">
            <div style={{ width: '100%' }}>
                <div className="step-indicator">
                    <div className="step-number">06</div>
                    <div className="step-line"></div>
                    <div className="step-number" style={{ color: '#ffd700' }}>06</div>
                </div>

                <h2 className="main-title" style={{ fontSize: '48px', marginBottom: '30px', textAlign: 'center' }}>
                    {t('ai-agent-title')}
                </h2>

                <div className="ai-agent-content" style={{ 
                    maxWidth: '800px', 
                    margin: '0 auto', 
                    padding: '40px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    border: '1px solid rgba(0, 212, 255, 0.3)'
                }}>
                    <h3 style={{ 
                        fontSize: '32px', 
                        marginBottom: '20px',
                        color: '#00d4ff'
                    }}>
                        {t('ai-agent-header')}
                    </h3>
                    
                    <p style={{ 
                        fontSize: '16px',
                        marginBottom: '30px',
                        lineHeight: '1.8',
                        color: '#aaa'
                    }}>
                        {t('ai-agent-description')}
                    </p>

                    <div style={{ 
                        fontSize: '24px', 
                        marginBottom: '30px',
                        padding: '20px',
                        background: 'rgba(0, 212, 255, 0.1)',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <p dangerouslySetInnerHTML={{ __html: t('ai-agent-phone') }} />
                    </div>

                    <p dangerouslySetInnerHTML={{ __html: t('ai-agent-features') }} style={{ 
                        fontSize: '16px',
                        color: '#aaa',
                        lineHeight: '1.8'
                    }} />
                </div>
            </div>
        </section>
    );
};

export default AIAgent;