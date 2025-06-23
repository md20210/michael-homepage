// src/components/Skills.jsx
import React from 'react';

const Skills = ({ t }) => {
    return (
        <section id="skills" className="section">
            <div style={{ width: '100%' }}>
                <div className="step-indicator">
                    <div className="step-number">02</div>
                    <div className="step-line"></div>
                    <div className="step-number" style={{ color: '#ffd700' }}>02</div>
                </div>

                <h2 className="main-title" style={{ fontSize: '48px', marginBottom: '30px', textAlign: 'center' }}>
                    {t('skills-title')}
                </h2>

                <div className="skills-section">
                    <div className="skills-grid">
                        <div className="skills-column">
                            <h3>{t('skills-technical-title')}</h3>
                            <ul className="skills-list">
                                <li>{t('skills-technical-1')}</li>
                                <li>{t('skills-technical-2')}</li>
                                <li>{t('skills-technical-3')}</li>
                                <li>{t('skills-technical-4')}</li>
                                <li>{t('skills-technical-5')}</li>
                                <li>{t('skills-technical-6')}</li>
                            </ul>
                        </div>
                        <div className="skills-column">
                            <h3>{t('skills-management-title')}</h3>
                            <ul className="skills-list">
                                <li>{t('skills-management-1')}</li>
                                <li>{t('skills-management-2')}</li>
                                <li>{t('skills-management-3')}</li>
                                <li>{t('skills-management-4')}</li>
                                <li>{t('skills-management-5')}</li>
                                <li>{t('skills-management-6')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Skills;