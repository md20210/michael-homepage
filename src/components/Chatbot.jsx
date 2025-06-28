// src/components/Chatbot.jsx - STANDALONE VERSION - NO BACKEND CONNECTIONS
import React, { useState, useEffect, useRef } from 'react';
import { getFallbackResponse, getApiErrorResponse } from '../utils/fallbackResponses.js';

console.log('🔥🔥🔥 STANDALONE MODE - NO BACKEND CONNECTIONS - BUILD:', Date.now());

const Chatbot = ({ t, currentLang }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiAvailable] = useState(false); // PERMANENT FALSE - NO BACKEND
    const chatLogRef = useRef(null);

    // NEUE Spracherkennungs-Funktion
    const detectLanguage = (message) => {
        const germanKeywords = [
            "wie", "was", "wer", "wo", "wann", "warum", "wieso", "wieviel", 
            "alt", "alter", "studiert", "studium", "uni", "universität",
            "hat", "ist", "sind", "haben", "kann", "könnte", "macht",
            "der", "die", "das", "ein", "eine", "seinen", "ihrer",
            "jahre", "erfahrung", "projekte", "kontakt", "deutsch",
            "arbeitet", "kommt", "lebt", "spricht", "goethe"
        ];
        
        const spanishKeywords = [
            "qué", "cómo", "quién", "dónde", "cuándo", "por qué", "cuánto",
            "edad", "estudió", "universidad", "tiene", "es", "son",
            "puede", "hace", "el", "la", "los", "las", "un", "una",
            "años", "experiencia", "proyectos", "contacto", "español",
            "trabaja", "viene", "vive", "habla"
        ];
        
        const msgLower = message.toLowerCase();
        
        // Prüfe deutsche Schlüsselwörter
        if (germanKeywords.some(keyword => msgLower.includes(keyword))) {
            console.log('🇩🇪 Deutsche Sprache erkannt:', message);
            return "de";
        }
        
        // Prüfe spanische Schlüsselwörter  
        if (spanishKeywords.some(keyword => msgLower.includes(keyword))) {
            console.log('🇪🇸 Spanische Sprache erkannt:', message);
            return "es";
        }
        
        // Standard: Englisch
        console.log('🇺🇸 Englische Sprache (Standard):', message);
        return "en";
    };

    // NO BACKEND CONNECTION - REMOVED ALL API CALLS
    useEffect(() => {
        console.log('💾 Standalone mode - No backend connections');
        console.log('🔥 ALL BACKEND CONNECTIONS REMOVED');
        // setApiAvailable remains false permanently
    }, []);

    // Initialize with welcome message using existing translations
    useEffect(() => {
        console.log('🤖 Chatbot initializing in standalone mode...');
        const welcomeMsg = {
            id: 1,
            type: 'bot',
            content: t('chatbot-welcome'),
            timestamp: Date.now(),
            source: 'standalone'
        };
        setMessages([welcomeMsg]);
        console.log('✅ Welcome message set from translations (standalone)');
    }, [t]);

    // Auto-scroll
    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages]);

    // REMOVED: callRailwayAPI function - NO MORE BACKEND CALLS

    const handleSendMessage = async () => {
        const message = inputValue.trim();
        console.log('📤 Sending message (standalone):', message);
        
        if (!message || isLoading) return;

        // WICHTIG: Erkenne die Sprache der Nachricht
        const detectedLang = detectLanguage(message);
        console.log('🔍 Detected language:', detectedLang);

        setIsLoading(true);
        setInputValue('');

        // Add user message
        const userMsg = {
            id: Date.now(),
            type: 'user',
            content: message,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMsg]);

        try {
            let botResponse;
            let source = 'intelligent-fallback';

            // ONLY USE FALLBACK RESPONSES - NO API CALLS
            botResponse = getFallbackResponse(message, detectedLang);
            console.log('💾 Using intelligent fallback (standalone mode)');
            
            const botMsg = {
                id: Date.now() + 1,
                type: 'bot',
                content: botResponse,
                timestamp: Date.now(),
                source: source
            };

            setMessages(prev => [...prev, botMsg]);
            console.log('✅ Bot response added (standalone):', botMsg);
            
        } catch (error) {
            console.error('❌ Chat error:', error);
            const errorMsg = {
                id: Date.now() + 1,
                type: 'bot',
                content: getApiErrorResponse(detectedLang),
                timestamp: Date.now(),
                source: 'error'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getResumeLink = () => {
        return currentLang === "de" ? "./Resume Deu.pdf" : "./Resume Eng.pdf";
    };

    const getSourceIndicator = (source) => {
        switch (source) {
            case 'intelligent-fallback': return '🧠 Smart AI';
            case 'standalone': return '🤖 Standalone';
            case 'fallback': return '💾 Local AI';
            case 'error': return '⚠️ Error';
            case 'system': return '🤖 System';
            default: return '🤖 Local AI';
        }
    };

    console.log('🎨 Rendering Chatbot (standalone) with', messages.length, 'messages. Backend: DISABLED');

    return (
        <section id="chatbot" className="section">
            <div style={{ width: '100%' }}>
                <div className="step-indicator">
                    <div className="step-number">04</div>
                    <div className="step-line"></div>
                    <div className="step-number" style={{ color: '#ffd700' }}>04</div>
                </div>

                <h2 className="main-title" style={{ fontSize: '48px', marginBottom: '30px', textAlign: 'center' }}>
                    {t('chatbot-title')}
                </h2>

                <div className="chatbot-section">
                    <div className="chatbot-content">
                        <div className="chat-info">
                            <h3 dangerouslySetInnerHTML={{ __html: t('chatbot-header') }} />
                            <p dangerouslySetInnerHTML={{ __html: t('chatbot-info') }} />
                            <p>
                                💾 Standalone mode: Using intelligent local AI responses with automatic language detection.
                            </p>
                            <p dangerouslySetInnerHTML={{ __html: t('chatbot-opportunity') }} />
                            <p dangerouslySetInnerHTML={{ __html: t('chatbot-phone') }} />
                            <a 
                                href={getResumeLink()} 
                                className="cta-button" 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                {t('chatbot-resume')}
                            </a>
                        </div>

                        <div className="chat-box">
                            <div className="chat-log" ref={chatLogRef}>
                                {messages.map(msg => (
                                    <div 
                                        key={msg.id} 
                                        className={`chat-message-item ${msg.type === 'user' ? 'user' : ''}`}
                                    >
                                        <div className={`avatar ${msg.type === 'user' ? 'user' : 'bot'}`}>
                                            {msg.type === 'user' ? 'You' : 'AI'}
                                        </div>
                                        <div className="message">
                                            {msg.content}
                                            {msg.source && (
                                                <div style={{ 
                                                    fontSize: '10px', 
                                                    opacity: 0.7, 
                                                    marginTop: '5px',
                                                    color: '#00ffff'
                                                }}>
                                                    {getSourceIndicator(msg.source)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                {isLoading && (
                                    <div className="chat-message-item">
                                        <div className="avatar bot">AI</div>
                                        <div className="message">
                                            <div className="typing-indicator">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="chat-input">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={t('chatbot-placeholder')}
                                    disabled={isLoading}
                                />
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !inputValue.trim()}
                                >
                                    {isLoading ? 'Sending...' : t('chatbot-send')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Chatbot;