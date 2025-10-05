// src/App.jsx - Optimiert ohne ständige Re-Renders
import React, { useState, useEffect, useCallback } from 'react';
import { translations } from './data/translations.js';
import Background from './components/Background.jsx';
import LanguageSelector from './components/LanguageSelector.jsx';
import Hero from './components/Hero.jsx';
import Skills from './components/Skills.jsx';
import Experience from './components/Experience.jsx';
import Chatbot from './components/Chatbot.jsx';
import Intro from './components/Intro.jsx';
import AIAgent from './components/AIAgent.jsx';
import Profile from './components/Profile.jsx';

const App = () => {
    const [currentLang, setCurrentLang] = useState('en');
    const [lastScrollTop, setLastScrollTop] = useState(0);

    const t = useCallback((key) => {
    return translations[currentLang]?.[key] || translations.en[key] || key;
        }, [currentLang]);

        const handleLanguageChange = useCallback((newLang) => {
            setCurrentLang(newLang);
        }, []);

        useEffect(() => {
            document.documentElement.lang = currentLang;
            document.title = `${t('logo-text')} - ${t('tagline')}`;
        }, [currentLang, t]);

        useEffect(() => {
            let ticking = false;
            
            const handleScroll = () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        const header = document.querySelector('.header');

                        if (header) {
                            if (scrollTop > lastScrollTop && scrollTop > 100) {
                                header.style.transform = 'translateY(-100%)';
                            } else {
                                header.style.transform = 'translateY(0)';
                            }
                        }
                        setLastScrollTop(scrollTop);
                        ticking = false;
                    });
                    ticking = true;
                }
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
            return () => window.removeEventListener('scroll', handleScroll);
        }, [lastScrollTop]);

        useEffect(() => {
            const handleNavClick = (e) => {
                const href = e.target.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetSection = document.querySelector(href);
                    if (targetSection) {
                        targetSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            };

            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    handleNavClick(e);
                }
            });

            return () => {
                document.removeEventListener('click', handleNavClick);
            };
        }, []);

        // Language Selector Component direkt hier

        const LanguageSelector = () => {
            const languages = [
                { code: 'en', flag: 'gb', label: 'English' },
                { code: 'de', flag: 'de', label: 'Deutsch' },
                { code: 'es', flag: 'es', label: 'Español' }
            ];

            return (
                <div className="language-switcher">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            className={currentLang === lang.code ? 'active' : ''}
                            onClick={() => handleLanguageChange(lang.code)}
                            title={lang.label}
                            aria-label={lang.label}
                        >
                            <span className={`fi fi-${lang.flag}`} style={{ fontSize: '20px' }}></span>
                        </button>
                    ))}
                </div>
            );
        };

        return (
            <div className="App">
                <Background />
                
                <header className="header">
                    <div>
                        <div className="logo">{t('logo-text')}</div>
                        <div className="tagline">{t('tagline')}</div>
                    </div>
                    <div className="nav-right">
                        <a href="#intro" className="nav-link">{t('nav-home')}</a>
                        <a href="#profile" className="nav-link">{t('nav-profile')}</a>
                        <a href="#skills" className="nav-link">{t('nav-skills')}</a>
                        <a href="#experience" className="nav-link">{t('nav-experience')}</a>
                        <a href="#chatbot" className="nav-link">{t('nav-chatbot')}</a>
                        <a href="#ai-agent" className="nav-link">{t('nav-ai-agent')}</a>
                        <a href="mailto:michael.dabrock@gmx.es" className="nav-link">{t('nav-contact')}</a>
                        <LanguageSelector />
                    </div>
                </header>
                
                <main>
                    <Hero t={t} currentLang={currentLang} />
                    <Intro t={t} />
                    <Profile t={t} />
                    <Skills t={t} />
                    <Experience t={t} />
                    <Chatbot t={t} currentLang={currentLang} />
                    <AIAgent t={t} />
                </main>
            </div>
        );
};

export default React.memo(App);