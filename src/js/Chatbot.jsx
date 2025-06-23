// src/components/Chatbot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { grokApi } from '../services/grokApi.js';

const Chatbot = ({ t, currentLang }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const chatLogRef = useRef(null);

    // Lokale Übersetzungen für Chatbot-spezifische Nachrichten
    const chatTranslations = {
        en: {
            "message-too-short": "Message too short",
            "message-too-long": "Message too long (max 500 characters)",
            "enter-message": "Please enter a message",
            "sending": "Sending...",
            "unavailable": "I'm temporarily unavailable. Please try again or contact Michael directly at michael.dabrock@gmx.es or +34 683 1782 48."
        },
        de: {
            "message-too-short": "Nachricht zu kurz",
            "message-too-long": "Nachricht zu lang (max 500 Zeichen)",
            "enter-message": "Bitte geben Sie eine Nachricht ein",
            "sending": "Sende...",
            "unavailable": "Ich bin vorübergehend nicht verfügbar. Bitte versuchen Sie es erneut oder kontaktieren Sie Michael direkt unter michael.dabrock@gmx.es oder +34 683 1782 48."
        },
        es: {
            "message-too-short": "Mensaje demasiado corto",
            "message-too-long": "Mensaje demasiado largo (máx 500 caracteres)",
            "enter-message": "Por favor ingrese un mensaje",
            "sending": "Enviando...",
            "unavailable": "No estoy disponible temporalmente. Inténtelo de nuevo o contacte a Michael directamente en michael.dabrock@gmx.es o +34 683 1782 48."
        }
    };

    const getChatTranslation = (key) => {
        return chatTranslations[currentLang]?.[key] || chatTranslations.en[key] || key;
    };

    // Initialize with welcome message
    useEffect(() => {
        setMessages([{
            id: 1,
            type: 'bot',
            content: t('chatbot-welcome'),
            timestamp: new Date(),
            source: 'system'
        }]);
    }, [t]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Show toast notification
    const showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const colors = {
            error: '#ff4444',
            warning: '#ffaa00',
            success: '#00ff88',
            info: '#4488ff'
        };
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInToast 0.3s ease;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 300px;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutToast 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    };

    // Validate message
    const validateMessage = (message) => {
        const minLength = 2;
        const maxLength = 500;
        
        if (message.length < minLength) {
            showToast(getChatTranslation('message-too-short'), 'warning');
            return false;
        }
        
        if (message.length > maxLength) {
            showToast(getChatTranslation('message-too-long'), 'warning');
            return false;
        }
        
        return true;
    };

    // Add message to chat with animation
    const addMessage = (type, content, source = 'system', avatar = null) => {
        const message = {
            id: Date.now() + Math.random(),
            type,
            content,
            timestamp: new Date(),
            source,
            avatar
        };

        setMessages(prev => [...prev, message]);
        return message.id;
    };

    // Handle sending message using your GrokApiService
    const handleSendMessage = async () => {
        const message = inputValue.trim();
        
        if (!message) {
            showToast(getChatTranslation('enter-message'), 'warning');
            return;
        }

        if (!validateMessage(message)) {
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        setInputValue('');

        // Add user message
        addMessage('user', message, 'user');

        // Show typing indicator
        setIsTyping(true);

        try {
            console.log('🤖 Sending message to GrokApiService:', message);
            
            // Use your GrokApiService
            const result = await grokApi.sendMessage(message, currentLang);
            
            setIsTyping(false);

            if (result.success) {
                // Add bot response
                addMessage('bot', result.message, result.source);

                // Show info message based on source
                if (result.source === 'intelligent-fallback') {
                    addMessage('warning', 'Note: Using intelligent local responses (API not available)', 'system');
                } else if (result.source === 'error-fallback') {
                    addMessage('error', 'Note: Using basic fallback due to connection issues', 'system');
                }
            } else {
                addMessage('error', result.message, 'error');
            }
            
        } catch (error) {
            console.error('Chat error:', error);
            setIsTyping(false);
            addMessage('error', getChatTranslation('unavailable'), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getResumeLink = () => {
        return currentLang === "de" ? "./Resume Deu.pdf" : "./Resume Eng.pdf";
    };

    const getAvatarIcon = (message) => {
        if (message.type === 'user') return 'You';
        if (message.type === 'warning') return '⚠️';
        if (message.type === 'error') return '❌';
        
        // Bot avatars based on source
        switch (message.source) {
            case 'grok-api': return '🤖';
            case 'intelligent-fallback': return '🧠';
            case 'error-fallback': return '💾';
            default: return 'AI';
        }
    };

    const getAvatarTitle = (message) => {
        if (message.type === 'user') return 'You';
        if (message.type === 'warning' || message.type === 'error') return 'System';
        
        switch (message.source) {
            case 'grok-api': return 'Grok AI';
            case 'intelligent-fallback': return 'Intelligent Assistant';
            case 'error-fallback': return 'Local Assistant';
            default: return 'AI Assistant';
        }
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
                            <h3 dangerouslySetInnerHTML={{ __html: t('chatbot-header') }} />
                            <p dangerouslySetInnerHTML={{ __html: t('chatbot-info') }} />
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
                                {messages.map(message => (
                                    <div 
                                        key={message.id} 
                                        className={`chat-message-item ${message.type}`}
                                        style={{
                                            opacity: 0,
                                            transform: 'translateY(20px)',
                                            animation: 'slideInMessage 0.3s ease forwards'
                                        }}
                                    >
                                        <div 
                                            className={`avatar ${message.type === 'user' ? 'user' : 'bot'}`}
                                            title={getAvatarTitle(message)}
                                        >
                                            {getAvatarIcon(message)}
                                        </div>
                                        <div 
                                            className="message"
                                            dangerouslySetInnerHTML={{ __html: message.content }}
                                        />
                                    </div>
                                ))}
                                
                                {isTyping && (
                                    <div className="chat-message-item typing">
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
                                    maxLength="500"
                                />
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !inputValue.trim()}
                                >
                                    {isLoading ? getChatTranslation('sending') : t('chatbot-send')}
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