// src/components/Hero.jsx - VOLLSTÄNDIG KORRIGIERT
import React from 'react';

const Hero = ({ t, currentLang }) => {
    const getResumeLink = () => {
        if (currentLang === "de") return "./Resume_DE.pdf";
        if (currentLang === "es") return "./Resume_ES.pdf";
        return "./Resume_EN.pdf";
    };

    const skillNodes = [
        { x: 10, y: 20, size: 'normal' },
        { x: 80, y: 15, size: 'large' },
        { x: 25, y: 70, size: 'normal' },
        { x: 90, y: 80, size: 'normal' },
        { x: 60, y: 30, size: 'large' },
        { x: 15, y: 90, size: 'normal' },
        { x: 70, y: 60, size: 'normal' },
        { x: 45, y: 85, size: 'large' }
    ];

    const connections = [
        { x1: 10, y1: 20, x2: 25, y2: 70, length: Math.sqrt(Math.pow(25-10, 2) + Math.pow(70-20, 2)) },
        { x1: 80, y1: 15, x2: 60, y2: 30, length: Math.sqrt(Math.pow(60-80, 2) + Math.pow(30-15, 2)) },
        { x1: 25, y1: 70, x2: 45, y2: 85, length: Math.sqrt(Math.pow(45-25, 2) + Math.pow(85-70, 2)) }
    ];

    return (
        <section id="intro" className="section intro">
            <div className="intro-left">
                <div className="profile-visualization">
                    <div className="profile-frame">
                        <div className="profile-image">
                            MD
                        </div>
                    </div>
                    <div className="skill-nodes">
                        {skillNodes.map((node, index) => (
                            <div
                                key={index}
                                className={`skill-node ${node.size}`}
                                style={{
                                    left: `${node.x}%`,
                                    top: `${node.y}%`
                                }}
                            />
                        ))}
                        {connections.map((conn, index) => (
                            <div
                                key={index}
                                className="connection"
                                style={{
                                    left: `${conn.x1}%`,
                                    top: `${conn.y1}%`,
                                    width: `${conn.length}px`,
                                    transform: `rotate(${Math.atan2(conn.y2 - conn.y1, conn.x2 - conn.x1) * 180 / Math.PI}deg)`
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="intro-right">
                <div className="step-indicator">
                    <div className="step-number">01</div>
                    <div className="step-line"></div>
                    <div className="step-number" style={{ color: '#ffd700' }}>06</div>
                </div>
                <h1 className="main-title">{t('logo-text')}</h1>
                <h2 className="subtitle">{t('hero-subtitle')}</h2>
                <p className="description">{t('hero-description')}</p>
                <div className="cta-buttons">
                    <a href="#skills" className="cta-button">
                        {t('hero-view-skills')}
                    </a>
                    <a
                        href={getResumeLink()}
                        className="cta-button secondary"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t('hero-download-resume')}
                    </a>
                    <a
                        href="https://www.dabrock.eu/Michael_Dabrock_Audiobook.mp3"
                        className="cta-button secondary"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t('hero-my-audiobook')}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;