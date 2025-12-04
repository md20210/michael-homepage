// src/components/NewAIProject.jsx
import React from 'react';

const NewAIProject = ({ t }) => {
    return (
        <section id="newproject" className="section">
            <div style={{ width: '100%' }}>
                <div className="step-indicator">
                    <div className="step-number">07</div>
                    <div className="step-line"></div>
                    <div className="step-number" style={{ color: '#ffd700' }}>07</div>
                </div>

                <h2 className="main-title" style={{ fontSize: '48px', marginBottom: '30px', textAlign: 'center' }}>
                    {t('newproject-title')}
                </h2>

                <div style={{
                    background: 'rgba(15, 15, 35, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '20px',
                    padding: '60px 40px',
                    maxWidth: '800px',
                    margin: '0 auto',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '100px', marginBottom: '30px' }}>
                        🚀
                    </div>

                    <h3 style={{
                        fontSize: '32px',
                        color: '#ffd700',
                        marginBottom: '20px',
                        fontWeight: 'bold'
                    }}>
                        {t('newproject-header')}
                    </h3>

                    <p style={{
                        fontSize: '20px',
                        color: '#ffffff',
                        marginBottom: '30px',
                        lineHeight: '1.8'
                    }}>
                        {t('newproject-description')}
                    </p>

                    <div style={{
                        background: 'rgba(0, 255, 0, 0.05)',
                        border: '1px solid rgba(0, 255, 0, 0.2)',
                        borderRadius: '10px',
                        padding: '30px',
                        marginTop: '30px'
                    }}>
                        <p style={{
                            fontSize: '16px',
                            color: '#00ff00',
                            fontStyle: 'italic',
                            margin: '0'
                        }}>
                            {t('newproject-placeholder')}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewAIProject;
