// src/components/Chatbot.jsx - FOR EXISTING server.cjs
import React, { useState, useEffect, useRef } from 'react';
import { getFallbackResponse, getApiErrorResponse } from '../utils/fallbackResponses.js';

console.log('🔄 HYBRID SERVER API MODE - BUILD:', Date.now());

const Chatbot = ({ t, currentLang }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [serverAvailable, setServerAvailable] = useState(false);
    const chatLogRef = useRef(null);

    // Use existing server.cjs endpoints
    const API_BASE = window.location.origin;

    // Spracherkennungs-Funktion
    const detectLanguage = (message) => {
        const germanKeywords = [
            "hallo", "hi", "guten", "tag", "morgen", "abend",
            "wie", "was", "wer", "wo", "wann", "warum", "wieso", "wieviel", 
            "alt", "alter", "studiert", "studium", "uni", "universität",
            "hat", "ist", "sind", "haben", "kann", "könnte", "macht",
            "der", "die", "das", "ein", "eine", "seinen", "ihrer",
            "jahre", "erfahrung", "projekte", "kontakt", "deutsch",
            "arbeitet", "kommt", "lebt", "spricht", "goethe", "wieso"
        ];
        
        const spanishKeywords = [
            "hola", "buenos", "días", "tardes", "noches",
            "qué", "cómo", "quién", "dónde", "cuándo", "por qué", "cuánto",
            "edad", "estudió", "universidad", "tiene", "es", "son",
            "puede", "hace", "el", "la", "los", "las", "un", "una",
            "años", "experiencia", "proyectos", "contacto", "español",
            "trabaja", "viene", "vive", "habla"
        ];
        
        const msgLower = message.toLowerCase();
        
        if (germanKeywords.some(keyword => msgLower.includes(keyword))) {
            console.log('🇩🇪 Deutsche Sprache erkannt:', message);
            return "de";
        }
        
        if (spanishKeywords.some(keyword => msgLower.includes(keyword))) {
            console.log('🇪🇸 Spanische Sprache erkannt:', message);
            return "es";
        }
        
        console.log('🇺🇸 Englische Sprache (Standard):', message);
        return "en";
    };

    // Test existing server.cjs
    useEffect(() => {
        const testServer = async () => {
            try {
                console.log('🔍 Testing existing server.cjs...');
                console.log('🌐 API Base URL:', API_BASE);
                
                const response = await fetch(`${API_BASE}/health`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Server response:', data);
                    
                    if (data.status && data.grokApiAvailable !== undefined) {
                        setServerAvailable(true);
                        console.log('✅ Hybrid server available!');
                        console.log('📚 Michael Knowledge Base:', data.knowledgeItems, 'topics');
                        console.log('🤖 Grok API:', data.grokApiAvailable ? 'Available' : 'Unavailable');
                    }
                } else {
                    console.log('❌ Server health check failed:', response.status);
                    setServerAvailable(false);
                }
            } catch (error) {
                console.log('⚠️ Server connection error:', error.message);
                setServerAvailable(false);
            }
        };

        testServer();
    }, [API_BASE]);

    // Initialize with welcome message
    useEffect(() => {
        console.log('🤖 Chatbot initializing with hybrid server...');
        const welcomeMsg = {
            id: 1,
            type: 'bot',
            content: t('chatbot-welcome'),
            timestamp: Date.now(),
            source: serverAvailable ? 'hybrid-ready' : 'fallback'
        };
        setMessages([welcomeMsg]);
        console.log('✅ Welcome message set - Hybrid Server:', serverAvailable ? 'Available' : 'Fallback mode');
    }, [t, serverAvailable]);

    // Auto-scroll
    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages]);

    // Call existing server.cjs API
    const callHybridAPI = async (message, detectedLanguage) => {
        try {
            console.log('🚀 Calling hybrid server API...');
            console.log('📤 Sending to server:', { message, lang: detectedLanguage });

            const response = await fetch(`${API_BASE}/api/grok`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    lang: detectedLanguage
                })
            });

            if (!response.ok) {
                throw new Error(`Server API error ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.message) {
                throw new Error('No message content in server response');
            }

            console.log('✅ Hybrid server response received:', data.message.substring(0, 100) + '...');
            console.log('📊 Response source:', data.source);
            console.log('🔤 Response language:', data.language);

            return {
                success: true,
                message: data.message,
                source: data.source,
                note: data.note
            };

        } catch (error) {
            console.error('❌ Hybrid Server API Error:', error);
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

            if (serverAvailable) {
                // Try hybrid server API call
                const serverResult = await callHybridAPI(message, detectedLang);
                
                if (serverResult.success) {
                    botResponse = serverResult.message;
                    source = serverResult.source;
                    console.log('✅ Using hybrid server response:', serverResult.note);
                } else {
                    // Fallback to intelligent responses
                    botResponse = getFallbackResponse(message, detectedLang);
                    source = 'intelligent-fallback';
                    console.log('⚠️ Hybrid server failed, using intelligent fallback');
                }
            } else {
                // Use fallback response system
                botResponse = getFallbackResponse(message, detectedLang);
                source = 'intelligent-fallback';
                console.log('💾 Using intelligent fallback (no hybrid server)');
            }
            
            const botMsg = {
                id: Date.now() + 1,
                type: 'bot',
                content: botResponse,
                timestamp: Date.now(),
                source: source
            };

            setMessages(prev => [...prev, botMsg]);
            console.log('✅ Bot response added:', { source, length: botResponse.length });
            
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
            case 'smart-local-ai': return '🧠 Smart Local AI';
            case 'grok-api': return '🤖 Real Grok AI';
            case 'hybrid-ready': return '🔄 Hybrid Ready';
            case 'intelligent-fallback': return '🧠 Smart Fallback';
            case 'fallback': return '💾 Local Fallback';
            case 'error': return '⚠️ Error';
            case 'system': return '🤖 System';
            default: return '🤖 AI';
        }
    };

    console.log('🎨 Rendering Hybrid Chatbot with', messages.length, 'messages. Server:', serverAvailable ? 'Available' : 'Fallback');

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
                                {serverAvailable ? 
                                    "🔄 Connected to hybrid AI system! Michael questions → Smart Knowledge Base, General questions → Real Grok AI. Ask about Goethe, philosophy, or any topic!" :
                                    "💾 Hybrid fallback mode - using intelligent responses with detailed knowledge about Michael."
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
                                                    color: msg.source.includes('grok') ? '#00ff00' : 
                                                           msg.source.includes('smart') ? '#00ffff' : '#ffd700'
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