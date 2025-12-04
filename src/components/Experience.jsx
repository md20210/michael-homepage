// src/components/Experience.jsx - VOLLSTÄNDIG KORRIGIERT
import React from 'react';

const Experience = ({ t }) => {
    const experiences = [
        {
            key: 'google',
            titleKey: 'work-google-title',
            descriptionKey: 'work-google-desc'
        },
        {
            key: 'ai-specialist',
            titleKey: 'work-ai-specialist-title',
            descriptionKey: 'work-ai-specialist-desc'
        },
        {
            key: 'cognizant',
            titleKey: 'work-cognizant-title',
            descriptionKey: 'work-cognizant-desc'
        },
        {
            key: 'wipro',
            titleKey: 'work-wipro-title', 
            descriptionKey: 'work-wipro-desc'
        },
        {
            key: 'ibm',
            titleKey: 'work-ibm-title',
            descriptionKey: 'work-ibm-desc'
        },
        {
            key: 'pwc',
            titleKey: 'work-pwc-title',
            descriptionKey: 'work-pwc-desc'
        },
        {
            key: 'early-career',
            titleKey: 'work-early-career-title',
            descriptionKey: 'work-early-career-desc'
        }
    ];

    return (
        <section id="experience" className="section">
            <div style={{ width: '100%' }}>
                <div className="step-indicator">
                    <div className="step-number">03</div>
                    <div className="step-line"></div>
                    <div className="step-number" style={{ color: '#ffd700' }}>07</div>
                </div>

                <h2 className="main-title" style={{ fontSize: '48px', marginBottom: '30px', textAlign: 'center' }}>
                    {t('experience-title')}
                </h2>

                <div className="experience-grid">
                    {experiences.map((exp) => (
                        <div key={exp.key} className="experience-card">
                            <div className="card-title">{t(exp.titleKey)}</div>
                            <div className="card-description" dangerouslySetInnerHTML={{ __html: t(exp.descriptionKey) }} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experience;