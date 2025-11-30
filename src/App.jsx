// src/App.jsx - Optimiert ohne ständige Re-Renders
import React, { useState, useEffect, useCallback } from 'react';
import { translations } from './data/translations.js';
import Background from './components/Background.jsx';
import LanguageSelector from './components/LanguageSelector.jsx';
import Hero from './components/Hero.jsx';
import Skills from './components/Skills.jsx';
import Experience from './components/Experience.jsx';
import Chatbot from './components/Chatbot.jsx';

const App = () => {
    const [currentLang, setCurrentLang] = useState('en');
    const [lastScrollTop, setLastScrollTop] = useState(0);

    // Memoized translation function
    const t = useCallback((key) => {
        return translations[currentLang]?.[key] || translations.en[key] || key;
    }, [currentLang]);

    // Language change handler mit useCallback
    const handleLanguageChange = useCallback((newLang) => {
        setCurrentLang(newLang);
    }, []);

    useEffect(() => {
        // Set document language and title
        document.documentElement.lang = currentLang;
        document.title = `${t('logo-text')} - ${t('tagline')}`;
    }, [currentLang, t]);

    useEffect(() => {
        // Optimierter Scroll Handler mit Throttling
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
        // Navigation Click Handler - nur einmal registrieren
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

        // Event Delegation statt einzelne Listener
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                handleNavClick(e);
            }
        });

        return () => {
            document.removeEventListener('click', handleNavClick);
        };
    }, []); // Leere Dependency Array

    return (
        <div className="App">
            {/* Background wird nur einmal gemounted */}
            <Background />
            
            <header className="header">
                <div>
                    <div className="logo">{t('logo-text')}</div>
                    <div className="tagline">{t('tagline')}</div>
                </div>
                <div className="nav-right">
                    <a href="#intro" className="nav-link">{t('nav-home')}</a>
                    <a href="#skills" className="nav-link">{t('nav-skills')}</a>
                    <a href="#experience" className="nav-link">{t('nav-experience')}</a>
                    <a href="#chatbot" className="nav-link">{t('nav-chatbot')}</a>
                    <a href="mailto:michael.dabrock@gmx.es" className="nav-link">{t('nav-contact')}</a>
                    <LanguageSelector 
                        currentLang={currentLang}
                        onLanguageChange={handleLanguageChange}
                    />
                </div>
            </header>
            
            <main>
                <Hero t={t} currentLang={currentLang} />
                <Skills t={t} />
                <Experience t={t} />
                <Chatbot t={t} currentLang={currentLang} />
            </main>
        </div>
    );
};

export default React.memo(App);