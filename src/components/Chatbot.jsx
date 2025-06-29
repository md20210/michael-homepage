// src/components/Chatbot.jsx - SECURE VERSION WITH RUNTIME API KEY LOADING
import React, { useState, useEffect, useRef } from 'react';
import { getFallbackResponse, getApiErrorResponse } from '../utils/fallbackResponses.js';
import { apiKeyLoader } from '../utils/apiKeyLoader.js';

console.log('🔒 SECURE GROK API MODE - RUNTIME KEY LOADING - BUILD:', Date.now());

const Chatbot = ({ t, currentLang }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [grokAvailable, setGrokAvailable] = useState(false);
    const [apiKeyLoading, setApiKeyLoading] = useState(true);
    const chatLogRef = useRef(null);

    const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

    // Spracherkennungs-Funktion (erweitert)
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

    // Load API Key and test Grok API availability
    useEffect(() => {
        const initializeGrokAPI = async () => {
            try {
                console.log('🔍 Loading API key at runtime...');
                const apiKey = await apiKeyLoader.getApiKeyAsync();
                
                if (!apiKey) {
                    console.log('⚠️ No API key available - using fallback mode');
                    setGrokAvailable(false);
                    setApiKeyLoading(false);
                    return;
                }

                console.log('🔑 API key loaded, testing Grok API connection...');
                
                const response = await fetch(GROK_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages: [
                            {
                                role: "system",
                                content: "You are a test assistant. Respond with just 'Connection successful' to verify the API is working."
                            },
                            {
                                role: "user",
                                content: "Test connection"
                            }
                        ],
                        model: "grok-beta",
                        stream: false,
                        temperature: 0.1,
                        max_tokens: 10
                    })
                });

                if (response.ok) {
                    console.log('✅ Grok API available and working');
                    setGrokAvailable(true);
                } else {
                    const errorText = await response.text();
                    console.log('❌ Grok API test failed:', response.status, errorText);
                    setGrokAvailable(false);
                }
            } catch (error) {
                console.log('⚠️ Grok API initialization error:', error.message);
                setGrokAvailable(false);
            } finally {
                setApiKeyLoading(false);
            }
        };

        initializeGrokAPI();
    }, []);

    // Initialize with welcome message
    useEffect(() => {
        if (!apiKeyLoading) {
            console.log('🤖 Chatbot initializing with runtime API key loading...');
            const welcomeMsg = {
                id: 1,
                type: 'bot',
                content: t('chatbot-welcome'),
                timestamp: Date.now(),
                source: grokAvailable ? 'grok-ready' : 'standalone'
            };
            setMessages([welcomeMsg]);
            console.log('✅ Welcome message set - Grok API:', grokAvailable ? 'Available' : 'Fallback mode');
        }
    }, [t, grokAvailable, apiKeyLoading]);

    // Auto-scroll
    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages]);

    // Direct Grok API call with runtime key
    const callGrokAPI = async (message, detectedLanguage) => {
        try {
            const apiKey = apiKeyLoader.getApiKey();
            if (!apiKey) {
                throw new Error('No API key available');
            }

            console.log('🚀 Calling Grok API with runtime key...');
            console.log('📤 Sending:', { message, lang: detectedLanguage });

            const systemPrompts = {
                en: `You are Grok, an AI assistant created by xAI. You are helping visitors learn about Michael Dabrock, a software developer and AI consultant. 

Michael's Background:
- AI Consultant & IT Architect with 20+ years enterprise experience
- Currently specializing in AI consulting (ChatGPT, Grok, Gemini, Claude integration)
- Lives in Barcelona, Spain with EU work permit
- Studied Industrial Engineering at Karlsruhe Institute of Technology (KIT)
- Speaks German (native), English (fluent), Spanish (basic)
- Phone: +34 683 1782 48, Email: michael.dabrock@gmx.es
- AI Phone Assistant: +34 93 694 5855

Career Highlights:
- Cognizant (2011-2023): Global Program Director, led €10M+ Pharma Cloud Migration, managed 300+ SAP consultants
- Wipro (2008-2011): Delivered €7M insurance platform projects
- IBM Business Consulting (2002-2007): Built Enterprise Service Bus solutions
- Currently available for new opportunities in AI consulting, enterprise architecture

Answer questions about Michael, his skills, experience, or provide helpful information about general topics. Be knowledgeable, engaging, and professional.`,

                de: `Du bist Grok, ein KI-Assistent von xAI. Du hilfst Besuchern dabei, mehr über Michael Dabrock zu erfahren, einen Softwareentwickler und KI-Berater.

Michaels Hintergrund:
- KI-Berater & IT-Architekt mit 20+ Jahren Unternehmenserfahrung
- Derzeit spezialisiert auf KI-Beratung (ChatGPT, Grok, Gemini, Claude Integration)
- Lebt in Barcelona, Spanien mit EU-Arbeitserlaubnis
- Studierte Wirtschaftsingenieurwesen am Karlsruhe Institute of Technology (KIT)
- Spricht Deutsch (Muttersprache), Englisch (fließend), Spanisch (Grundkenntnisse)
- Telefon: +34 683 1782 48, Email: michael.dabrock@gmx.es
- KI-Telefon-Assistent: +34 93 694 5855

Karriere-Highlights:
- Cognizant (2011-2023): Global Program Director, leitete €10M+ Pharma Cloud Migration, managte 300+ SAP-Berater
- Wipro (2008-2011): Lieferte €7M Versicherungsplattform-Projekte
- IBM Business Consulting (2002-2007): Baute Enterprise Service Bus Lösungen
- Derzeit verfügbar für neue Möglichkeiten in KI-Beratung, Enterprise Architecture

Beantworte Fragen über Michael, seine Fähigkeiten, Erfahrungen oder gib hilfreiche Informationen zu allgemeinen Themen. Sei sachkundig, engagiert und professionell.`,

                es: `Eres Grok, un asistente de IA creado por xAI. Ayudas a los visitantes a conocer sobre Michael Dabrock, un desarrollador de software y consultor de IA.

Trasfondo de Michael:
- Consultor IA & Arquitecto TI con 20+ años de experiencia empresarial
- Actualmente especializado en consultoría IA (integración ChatGPT, Grok, Gemini, Claude)
- Vive en Barcelona, España con permiso de trabajo UE
- Estudió Ingeniería Industrial en Karlsruhe Institute of Technology (KIT)
- Habla alemán (nativo), inglés (fluido), español (básico)
- Teléfono: +34 683 1782 48, Email: michael.dabrock@gmx.es
- Asistente Telefónico IA: +34 93 694 5855

Logros de Carrera:
- Cognizant (2011-2023): Director Global de Programas, lideró Migración Cloud Farmacéutica €10M+, gestionó 300+ consultores SAP
- Wipro (2008-2011): Entregó proyectos de plataforma de seguros €7M
- IBM Business Consulting (2002-2007): Construyó soluciones Enterprise Service Bus
- Actualmente disponible para nuevas oportunidades en consultoría IA, arquitectura empresarial

Responde preguntas sobre Michael, sus habilidades, experiencia o proporciona información útil sobre temas generales. Sé conocedor, atractivo y profesional.`
            };

            const requestBody = {
                messages: [
                    {
                        role: "system",
                        content: systemPrompts[detectedLanguage] || systemPrompts.en
                    },
                    {
                        role: "user", 
                        content: message
                    }
                ],
                model: "grok-beta",
                stream: false,
                temperature: 0.7,
                max_tokens: 800
            };

            const response = await fetch(GROK_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Grok API error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const grokMessage = data.choices?.[0]?.message?.content;

            if (!grokMessage) {
                throw new Error('No message content in Grok API response');
            }

            console.log('✅ Secure Grok API response received:', grokMessage.substring(0, 100) + '...');

            return {
                success: true,
                message: grokMessage,
                source: 'grok-api-secure'
            };

        } catch (error) {
            console.error('❌ Secure Grok API Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    };

    const handleSendMessage = async () => {
        const message = inputValue.trim();
        console.log('📤 Sending message:', message);
        
        if (!message || isLoading || apiKeyLoading) return;

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

            if (grokAvailable && apiKeyLoader.isAvailable()) {
                // Try secure Grok API call
                const grokResult = await callGrokAPI(message, detectedLang);
                
                if (grokResult.success) {
                    botResponse = grokResult.message;
                    source = grokResult.source;
                    console.log('✅ Using secure Grok API response');
                } else {
                    // Fallback to intelligent responses
                    botResponse = getFallbackResponse(message, detectedLang);
                    source = 'intelligent-fallback';
                    console.log('⚠️ Secure Grok API failed, using intelligent fallback');
                }
            } else {
                // Use fallback response system
                botResponse = getFallbackResponse(message, detectedLang);
                source = 'intelligent-fallback';
                console.log('💾 Using intelligent fallback (no secure API key)');
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
            case 'grok-api-secure': return '🔒 Secure Grok AI';
            case 'grok-api': return '🤖 Grok AI';
            case 'grok-ready': return '🤖 Grok Ready';
            case 'intelligent-fallback': return '🧠 Smart AI';
            case 'standalone': return '🤖 Local AI';
            case 'fallback': return '💾 Fallback';
            case 'error': return '⚠️ Error';
            case 'system': return '🤖 System';
            default: return '🤖 AI';
        }
    };

    if (apiKeyLoading) {
        return (
            <section id="chatbot" className="section">
                <div style={{ width: '100%', textAlign: 'center' }}>
                    <h2 className="main-title">Loading secure AI assistant...</h2>
                    <p>🔒 Initializing secure runtime API key loading...</p>
                </div>
            </section>
        );
    }

    console.log('🎨 Rendering Secure Chatbot with', messages.length, 'messages. Grok API:', grokAvailable ? 'Available' : 'Fallback');

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
                                {grokAvailable ? 
                                    "🔒 Connected to secure Grok AI! Full intelligent responses available - ask about Goethe, philosophy, or any topic!" :
                                    "💾 Secure fallback mode - using intelligent responses with detailed knowledge about Michael."
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
                                                    color: msg.source.includes('secure') ? '#00ff00' : 
                                                           msg.source.includes('grok') ? '#00ff00' : '#00ffff'
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
                                    disabled={isLoading || apiKeyLoading}
                                />
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !inputValue.trim() || apiKeyLoading}
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