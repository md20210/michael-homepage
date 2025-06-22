// E:\Project20250615\portfolio-website\michael-homepage\src\components\Chatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { grokApi } from '../services/grokApi.js';
import { getFallbackResponse, getApiErrorResponse } from '../utils/fallbackResponses.js';

const Chatbot = ({ t, currentLang }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatLogRef = useRef(null);

useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage = {
        id: 1,
        type: 'bot',
        content: t('chatbot-welcome'),
        timestamp: Date.now()
    };
    setMessages([welcomeMessage]);

    // Test API connection
    grokApi.testConnection().then(result => {
        console.log('API-Verbindungstest:', result ? 'Erfolgreich' : 'Fehlgeschlagen');
    });
}, [t]);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        const message = inputValue.trim();
        if (!message) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: message,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Try Grok API first
            const apiResponse = await grokApi.sendMessage(message, currentLang);
            
            const botResponse = {
                id: Date.now() + 1,
                type: 'bot',
                content: apiResponse.success ? apiResponse.message : getFallbackResponse(message, currentLang),
                timestamp: Date.now(),
                source: apiResponse.success ? 'grok-api' : 'fallback'
            };

            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error('Chat error:', error);
            
            // Use error response
            const errorResponse = {
                id: Date.now() + 1,
                type: 'bot',
                content: getApiErrorResponse(currentLang),
                timestamp: Date.now(),
                source: 'error'
            };

            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const getResumeLink = () => {
        return currentLang === "de" ? "./Resume Deu.pdf" : "./Resume Eng.pdf";
    };

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
                            <h3>{t('chatbot-header')}</h3>
                            <p>{t('chatbot-info')}</p>
                            <p>{t('chatbot-opportunity')}</p>
                            <div 
                                dangerouslySetInnerHTML={{ __html: t('chatbot-phone') }}
                                style={{ marginBottom: '20px' }}
                            />
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
                                {messages.map((msg) => (
                                    <div 
                                        key={msg.id} 
                                        className={`chat-message-item ${msg.type === 'user' ? 'user' : ''}`}
                                    >
                                        <div className={`avatar ${msg.type}`}>
                                            {msg.type === 'bot' ? 'AI' : 'You'}
                                        </div>
                                        <div className="message">
                                            {msg.content}
                                            {msg.source && (
                                                <div style={{ 
                                                    fontSize: '10px', 
                                                    opacity: 0.5, 
                                                    marginTop: '5px' 
                                                }}>
                                                    {msg.source === 'grok-api' ? '🤖 Grok API' : 
                                                     msg.source === 'fallback' ? '💾 Fallback' : '⚠️ Error'}
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
                                    onClick={sendMessage} 
                                    disabled={isLoading || !inputValue.trim()}
                                >
                                    {t('chatbot-send')}
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