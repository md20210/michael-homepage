// src/components/Skills.jsx - VOLLSTÄNDIG KORRIGIERT
import React from 'react';

const Skills = ({ t }) => {
    return (
        <section id="skills" className="section">
            <div style={{ width: '100%' }}>
                <div className="step-indicator">
                    <div className="step-number">03</div>
                    <div className="step-line"></div>
                    <div className="step-number" style={{ color: '#ffd700' }}>03</div>
                </div>

                <h2 className="main-title" style={{ fontSize: '48px', marginBottom: '30px', textAlign: 'center' }}>
                    {t('skills-title')}
                </h2>

                <div className="skills-section">
                    <div className="skills-grid">
                        <div className="skills-column">
                            <h3>{t('skills-core')}</h3>
                            <ul className="skills-list">
                                <li>{t('skills-program-leadership')}</li>
                                <li>{t('skills-it-consulting')}</li>
                                <li>{t('skills-enterprise-arch')}</li>
                                <li>{t('skills-cloud-tech')}</li>
                                <li>{t('skills-ai-dev')}</li>
                                <li>{t('skills-governance')}</li>
                            </ul>
                        </div>
                        <div className="skills-column">
                            <h3>{t('skills-certifications')}</h3>
                            <ul className="skills-list">
                                <li>{t('skills-chatgpt')}</li>
                                <li>{t('skills-gemini')}</li>
                                <li>{t('skills-grok')}</li>
                                <li>{t('skills-claude')}</li>
                                <li>{t('skills-chatbots')}</li>
                                <li>{t('skills-voice')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Skills;