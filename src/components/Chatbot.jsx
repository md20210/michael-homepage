// src/components/Chatbot.jsx - Mit Spracherkennung korrigiert
import React, { useState, useEffect, useRef } from 'react';
import { getFallbackResponse, getApiErrorResponse } from '../utils/fallbackResponses.js';

const Chatbot = ({ t, currentLang }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiAvailable, setApiAvailable] = useState(false);
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

    // Test if proxy server is running
    useEffect(() => {
        const testConnection = async () => {
            try {
                const response = await fetch('http://localhost:3001/health');
                if (response.ok) {
                    setApiAvailable(true);
                    console.log('✅ Grok Proxy Server available');
                } else {
                    throw new Error('Server not responding');
                }
            } catch (error) {
                console.log('⚠️ Grok Proxy Server not available, using intelligent fallback');
                setApiAvailable(false);
            }
        };
        testConnection();
    }, []);

    // Initialize with welcome message using existing translations
    useEffect(() => {
        console.log('🤖 Chatbot initializing...');
        const welcomeMsg = {
            id: 1,
            type: 'bot',
            content: t('chatbot-welcome'),
            timestamp: Date.now(),
            source: apiAvailable ? 'system' : 'fallback'
        };
        setMessages([welcomeMsg]);
        console.log('✅ Welcome message set from translations');
    }, [t, apiAvailable]);

    // Auto-scroll
    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages]);

    const callGrokAPI = async (message, detectedLanguage) => {
        try {
            console.log('🚀 Calling Grok API via proxy...');
            console.log('📤 Sending:', { message, lang: detectedLanguage });
            
            const response = await fetch('http://localhost:3001/api/grok', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    lang: detectedLanguage  // ← Jetzt mit erkannter Sprache!
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Grok API response:', data);

            return {
                success: true,
                message: data.message,
                source: data.source || 'grok-api'
            };

        } catch (error) {
            console.error('❌ Grok API Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    };

    const handleSendMessage = async () => {
        const message = inputValue.trim();
        console.log('📤 Sending message:', message);
        
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
            let source = 'fallback';

            if (apiAvailable) {
                // Try Grok API first - mit erkannter Sprache!
                const apiResult = await callGrokAPI(message, detectedLang);
                
                if (apiResult.success) {
                    botResponse = apiResult.message;
                    source = apiResult.source;
                    console.log('✅ Using Grok API response');
                } else {
                    // Fallback to existing fallback system
                    botResponse = getFallbackResponse(message, detectedLang);
                    source = 'intelligent-fallback';
                    console.log('⚠️ API failed, using intelligent fallback');
                }
            } else {
                // Use existing fallback response system
                botResponse = getFallbackResponse(message, detectedLang);
                source = 'intelligent-fallback';
                console.log('💾 Using intelligent fallback (no server)');
            }
            
            const botMsg = {
                id: Date.now() + 1,
                type: 'bot',
                content: botResponse,
                timestamp: Date.now(),
                source: source
            };

            setMessages(prev => [...prev, botMsg]);
            console.log('✅ Bot response added:', botMsg);
            
        } catch (error) {
            console.error('❌ Chat error:', error);
            const errorMsg = {
                id: Date.now() + 1,
                type: 'bot',
                content: getApiErrorResponse(detectedLang), // Auch hier erkannte Sprache!
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
            case 'grok-api': return '🤖 Grok API';
            case 'smart-local-ai': return '🧠 Smart AI';
            case 'intelligent-fallback': return '🧠 Smart AI';
            case 'fallback': return '💾 Fallback';
            case 'error': return '⚠️ Error';
            case 'system': return '🤖 System';
            default: return '🤖 AI';
        }
    };

    console.log('🎨 Rendering Chatbot with', messages.length, 'messages. API Available:', apiAvailable);

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
                                {apiAvailable ? 
                                    "✅ Connected to Smart AI! Automatic language detection enabled." :
                                    "💾 Using intelligent AI responses with automatic language detection."
                                }
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
                                                    color: msg.source.includes('grok') || msg.source.includes('smart') ? '#00ffff' : '#ffd700'
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