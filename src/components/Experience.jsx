// src/components/Experience.jsx
import React from 'react';

const Experience = ({ t }) => {
    const experiences = [
        {
            key: 'cognizant',
            titleKey: 'exp-cognizant-title',
            subtitleKey: 'exp-cognizant-subtitle',
            descriptionKey: 'exp-cognizant-description'
        },
        {
            key: 'ai-consulting',
            titleKey: 'exp-ai-title',
            subtitleKey: 'exp-ai-subtitle',
            descriptionKey: 'exp-ai-description'
        },
        {
            key: 'wipro',
            titleKey: 'exp-wipro-title',
            subtitleKey: 'exp-wipro-subtitle',
            descriptionKey: 'exp-wipro-description'
        },
        {
            key: 'ibm',
            titleKey: 'exp-ibm-title',
            subtitleKey: 'exp-ibm-subtitle',
            descriptionKey: 'exp-ibm-description'
        }
    ];

    return (
        <section id="experience" className="section">
            <div style={{ width: '100%' }}>
                <div className="step-indicator">
                    <div className="step-number">03</div>
                    <div className="step-line"></div>
                    <div className="step-number" style={{ color: '#ffd700' }}>03</div>
                </div>

                <h2 className="main-title" style={{ fontSize: '48px', marginBottom: '30px', textAlign: 'center' }}>
                    {t('experience-title')}
                </h2>

                <div className="experience-grid">
                    {experiences.map((exp) => (
                        <div key={exp.key} className="experience-card">
                            <div className="card-title">{t(exp.titleKey)}</div>
                            <div className="card-subtitle">{t(exp.subtitleKey)}</div>
                            <div className="card-description">{t(exp.descriptionKey)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experience;