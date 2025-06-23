// src/App.jsx
import React, { useState, useEffect } from 'react';
import { translations } from './data/translations.js';
import Background from './components/Background.jsx';
import LanguageSelector from './components/LanguageSelector.jsx';
import Hero from './components/Hero.jsx';
import Skills from './components/Skills.jsx';
import Experience from './components/Experience.jsx';
import Chatbot from './components/Chatbot.jsx';
import './styles/main.css';

const App = () => {
    const [currentLang, setCurrentLang] = useState('en');
    const [lastScrollTop, setLastScrollTop] = useState(0);

    // Translation function
    const t = (key) => {
        return translations[currentLang]?.[key] || translations.en[key] || key;
    };

    useEffect(() => {
        // Set document language
        document.documentElement.lang = currentLang;
        
        // Update page title
        document.title = `${t('logo-text')} - ${t('tagline')}`;
    }, [currentLang, t]);

    useEffect(() => {
        // Header scroll effect
        const handleScroll = () => {
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
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollTop]);

    useEffect(() => {
        // Smooth scrolling for navigation links
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

        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavClick);
        });

        return () => {
            navLinks.forEach(link => {
                link.removeEventListener('click', handleNavClick);
            });
        };
    }, []);

    const handleLanguageChange = (newLang) => {
        setCurrentLang(newLang);
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

export default App;