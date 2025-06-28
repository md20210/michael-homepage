// src/components/Chatbot.jsx - FIXED VERSION
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getFallbackResponse, getApiErrorResponse } from '../utils/fallbackResponses.js';

const Chatbot = ({ t, currentLang }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiAvailable, setApiAvailable] = useState(false);
    const chatLogRef = useRef(null);
    const inputRef = useRef(null); // REF für Input-Field

    // Test connection (einmal)
    useEffect(() => {
        const testConnection = async () => {
            try {
                const response = await fetch('http://localhost:3001/health');
                if (response.ok) {
                    setApiAvailable(true);
                    console.log('✅ Smart Local AI Server available');
                } else {
                    throw new Error('Server not responding');
                }
            } catch (error) {
                console.log('⚠️ Server not available, using built-in fallback');
                setApiAvailable(false);
            }
        };
        testConnection();
    }, []); // Nur einmal ausführen

    // Initialize welcome message (nur einmal)
    useEffect(() => {
        if (messages.length === 0) { // Verhindert doppelte Nachrichten
            console.log('🤖 Chatbot initializing...');
            const welcomeMsg = {
                id: 1,
                type: 'bot',
                content: t('chatbot-welcome'),
                timestamp: Date.now(),
                source: 'system'
            };
            setMessages([welcomeMsg]);
            console.log('✅ Welcome message set');
        }
    }, [t]); // Nur bei t-Änderung

    // Auto-scroll (optimiert)
    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages]);

    // FIXED: Fokus behalten
    const maintainFocus = useCallback(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
            // Nur fokussieren wenn Input nicht bereits fokussiert ist
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 100);
        }
    }, []);

    const callSmartAPI = async (message, language) => {
        try {
            console.log('🧠 Calling Smart Local AI...');
            
            const response = await fetch('http://localhost:3001/api/grok', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    lang: language
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Smart API response:', data);

            return {
                success: true,
                message: data.message,
                source: data.source || 'smart-local-ai'
            };

        } catch (error) {
            console.error('❌ Smart API Error:', error);
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
                // Try Smart Local AI first
                const apiResult = await callSmartAPI(message, currentLang);
                
                if (apiResult.success) {
                    botResponse = apiResult.message;
                    source = apiResult.source;
                    console.log('✅ Using Smart Local AI response');
                } else {
                    // Fallback to built-in responses
                    botResponse = getFallbackResponse(message, currentLang);
                    source = 'intelligent-fallback';
                    console.log('⚠️ API failed, using intelligent fallback');
                }
            } else {
                // Use built-in fallback response system
                botResponse = getFallbackResponse(message, currentLang);
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
                content: getApiErrorResponse(currentLang),
                timestamp: Date.now(),
                source: 'error'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            // Fokus nach dem Senden wiederherstellen
            maintainFocus();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // FIXED: Input change handler
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        // Kein zusätzlicher Fokus hier
    };

    const getResumeLink = () => {
        return currentLang === "de" ? "./Resume Deu.pdf" : "./Resume Eng.pdf";
    };

    const getSourceIndicator = (source) => {
        switch (source) {
            case 'smart-local-ai': return '🧠 Smart AI';
            case 'grok-api': return '🤖 Grok API';
            case 'intelligent-fallback': return '💡 Intelligent';
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
                                    "✅ Smart Local AI active! Accurate Michael Dabrock responses guaranteed." :
                                    "💡 Using intelligent built-in responses about Michael Dabrock."
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
                                                    color: msg.source.includes('smart') ? '#00ff88' : 
                                                           msg.source.includes('grok') ? '#00ffff' : '#ffd700'
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
                                    ref={inputRef} // REF hinzugefügt
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInputChange} // FIXED Handler
                                    onKeyPress={handleKeyPress}
                                    placeholder={t('chatbot-placeholder')}
                                    disabled={isLoading}
                                    maxLength="500"
                                    autoComplete="off" // Verhindert Autocomplete-Popups
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

export default React.memo(Chatbot); // Memo verhindert unnötige Re-Renders