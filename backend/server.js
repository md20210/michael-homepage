// server.js - Verbesserte Grok Integration
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const { createDecipheriv } = require('crypto');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Detaillierter System-Prompt mit Michael Dabrocks Informationen
const MICHAEL_DABROCK_CONTEXT = `You are Grok, an AI assistant representing Michael Dabrock. You ONLY talk about Michael Dabrock, NOT Michael Jordan or any other Michael.

IMPORTANT: Michael Dabrock is an AI Consultant & IT Architect, NOT a basketball player.

Key Information about Michael Dabrock:
- Current Role: AI Consultant & Enterprise Architect (Dec 2023-Present)
- Location: Barcelona, Spain (available within 2-3 weeks)
- Contact: michael.dabrock@gmx.es, +34 683 1782 48
- AI Phone Assistant: +34 93 694 5855 (multilingual EN/DE/ES)

Professional Background:
- 20+ years experience in enterprise IT transformations
- Global Program Director at Cognizant Technology Solutions (2011-2023)
- Enterprise Architect at Wipro Technologies (2008-2011)  
- Senior IT Architect at IBM Business Consulting (2002-2007)

Key Achievements:
- Led €10M+ Pharma Cloud Migration (30% cost reduction)
- Managed 300+ SAP consultants for Telecom SAP Factory (20% efficiency increase)
- Built Enterprise Service Bus achieving 20% faster integrations
- Delivered €7M insurance platform project in Spain

AI Expertise:
- ChatGPT (OpenAI): Prompt engineering and integration
- Gemini (Google): Model evaluation, enterprise use cases
- Grok (xAI): Code generation, API integration, troubleshooting
- Claude (Anthropic): Workflow automation, JSON coding
- Built multilingual chatbot (EN/DE/ES) with Eleven Labs, n8n

Technical Skills:
- Enterprise Architecture: TOGAF, cloud-native systems
- Cloud Technologies: Azure, AWS, S/4HANA, ServiceNow
- AI Development: LLM fine-tuning, vector embeddings, AI agents
- Certifications: IBM Certified Architect, TOGAF, Stanford Advanced PM

Education:
- Diploma in Industrial Engineering, Karlsruhe Institute of Technology (KIT)
- Master's thesis: Database integration using machine learning algorithms (Grade 1.0)

Languages: German (native), English (fluent), Spanish (basic)

Availability: Looking for opportunities in AI consulting, enterprise architecture, digital transformation. Available for remote/hybrid work with monthly travel.

Always respond as if you're representing Michael Dabrock's professional interests and expertise. Be helpful, knowledgeable about his background, and encourage potential employers or collaborators to contact him.`;

const algorithm = 'aes-256-cbc';
let API_KEY;

try {
    const encryptedApiKey = fs.readFileSync('encrypted_api_key.txt', 'utf8');
    const key = fs.readFileSync('encryption_key.bin');
    const iv = fs.readFileSync('encryption_iv.bin');
    const decipher = createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedApiKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    API_KEY = decrypted;
    console.log('✅ API-Schlüssel erfolgreich entschlüsselt');
} catch (error) {
    console.error('❌ Entschlüsselungsfehler:', error);
    API_KEY = null;
}

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

app.use(cors());
app.use(express.json());

// Funktion zur Spracherkennung
function detectLanguage(message) {
    const germanKeywords = ["was", "wie", "warum", "skills", "kompetenzen", "arbeit", "projekte"];
    const spanishKeywords = ["qué", "cómo", "por qué", "habilidades", "proyectos"];
    const msgLower = message.toLowerCase();

    if (germanKeywords.some(keyword => msgLower.includes(keyword))) return "de";
    if (spanishKeywords.some(keyword => msgLower.includes(keyword))) return "es";
    return "en";
}

// Erweiterte Sprachspezifische Prompts
function getLanguageSpecificPrompt(lang) {
    const prompts = {
        en: "Respond in English. Be professional and informative about Michael Dabrock's experience and availability.",
        de: "Antworte auf Deutsch. Sei professionell und informativ über Michael Dabrocks Erfahrung und Verfügbarkeit.",
        es: "Responde en español. Sé profesional e informativo sobre la experiencia y disponibilidad de Michael Dabrock."
    };
    return prompts[lang] || prompts.en;
}

app.post('/api/grok', async (req, res) => {
    try {
        console.log('📨 Received request:', req.body);

        if (!API_KEY) {
            throw new Error('API key not configured');
        }

        const { message, lang } = req.body;
        const detectedLang = lang || detectLanguage(message);
        const languagePrompt = getLanguageSpecificPrompt(detectedLang);

        // Verbesserter System-Prompt mit vollem Kontext
        const xaiBody = {
            messages: [
                { 
                    role: 'system', 
                    content: `${MICHAEL_DABROCK_CONTEXT}\n\n${languagePrompt}`
                },
                { 
                    role: 'user', 
                    content: message 
                }
            ],
            model: 'grok-beta',
            temperature: 0.7,
            max_tokens: 1000
        };

        console.log('🚀 Sending to Grok API with enhanced context...');

        const response = await axios.post(GROK_API_URL, xaiBody, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'User-Agent': 'Michael-Dabrock-Portfolio/1.0'
            },
            timeout: 30000 // 30 Sekunden Timeout
        });

        console.log('✅ Grok response received:', response.data);
        
        const grokResponse = response.data.choices[0]?.message?.content;
        
        if (!grokResponse) {
            throw new Error('Empty response from Grok API');
        }

        res.json({
            success: true,
            message: grokResponse,
            source: 'grok-api',
            language: detectedLang
        });

    } catch (error) {
        console.error('💥 Proxy Error:', error.response?.data || error.message);
        
        // Fallback zu lokalen Antworten wenn Grok API fehlschlägt
        const fallbackResponse = getFallbackResponse(req.body.message, req.body.lang);
        
        res.status(200).json({
            success: true,
            message: fallbackResponse,
            source: 'fallback',
            error: 'Grok API temporarily unavailable'
        });
    }
});

// Verbesserte Fallback-Funktion
function getFallbackResponse(message, lang = 'en') {
    const msgLower = message.toLowerCase();
    
    const responses = {
        en: {
            skills: "Michael Dabrock is an experienced AI Consultant & Enterprise Architect with 20+ years in IT transformations. His expertise includes AI platforms (ChatGPT, Grok, Gemini, Claude), enterprise architecture (TOGAF), cloud technologies (Azure, AWS), and program leadership managing €20M+ budgets with global teams.",
            experience: "Michael's career highlights include Global Program Director at Cognizant (2011-2023) where he led €10M+ pharma cloud migration and managed 300+ SAP consultants. Previously Enterprise Architect at Wipro and Senior IT Architect at IBM. Currently specializing in AI consulting since Dec 2023.",
            contact: "You can reach Michael at michael.dabrock@gmx.es or +34 683 1782 48. He's based in Barcelona, Spain and available within 2-3 weeks. Try his AI phone assistant at +34 93 694 5855 for immediate interaction.",
            default: "I'm here to tell you about Michael Dabrock, an AI Consultant & Enterprise Architect with 20+ years of experience. He's currently available for new opportunities in Barcelona. What would you like to know about his background, skills, or experience?"
        },
        de: {
            skills: "Michael Dabrock ist ein erfahrener KI-Berater & Enterprise Architect mit 20+ Jahren in IT-Transformationen. Seine Expertise umfasst KI-Plattformen (ChatGPT, Grok, Gemini, Claude), Enterprise Architecture (TOGAF), Cloud-Technologien (Azure, AWS) und Programmleitung mit €20M+ Budgets.",
            experience: "Michaels Karriere-Highlights umfassen Global Program Director bei Cognizant (2011-2023), wo er €10M+ Pharma Cloud Migration leitete und 300+ SAP-Berater managte. Zuvor Enterprise Architect bei Wipro und Senior IT Architect bei IBM. Seit Dez 2023 KI-Spezialist.",
            contact: "Sie erreichen Michael unter michael.dabrock@gmx.es oder +34 683 1782 48. Er lebt in Barcelona und ist innerhalb 2-3 Wochen verfügbar. Testen Sie seinen KI-Telefon-Assistenten: +34 93 694 5855.",
            default: "Ich bin hier, um Ihnen von Michael Dabrock zu erzählen, einem KI-Berater & Enterprise Architect mit 20+ Jahren Erfahrung. Er ist derzeit für neue Möglichkeiten in Barcelona verfügbar. Was möchten Sie über seinen Hintergrund wissen?"
        },
        es: {
            skills: "Michael Dabrock es un Consultor IA & Arquitecto Empresarial experimentado con 20+ años en transformaciones TI. Su experiencia incluye plataformas IA (ChatGPT, Grok, Gemini, Claude), arquitectura empresarial (TOGAF), tecnologías cloud (Azure, AWS) y liderazgo de programas con presupuestos €20M+.",
            experience: "Los logros de Michael incluyen Director Global de Programas en Cognizant (2011-2023) donde lideró migración cloud farmacéutica de €10M+ y gestionó 300+ consultores SAP. Anteriormente Arquitecto Empresarial en Wipro y Arquitecto Senior TI en IBM. Actualmente especialista IA desde Dic 2023.",
            contact: "Puedes contactar a Michael en michael.dabrock@gmx.es o +34 683 1782 48. Está en Barcelona y disponible en 2-3 semanas. Prueba su asistente telefónico IA: +34 93 694 5855.",
            default: "Estoy aquí para contarte sobre Michael Dabrock, un Consultor IA & Arquitecto Empresarial con 20+ años de experiencia. Está disponible para nuevas oportunidades en Barcelona. ¿Qué te gustaría saber sobre su experiencia?"
        }
    };

    const langResponses = responses[lang] || responses.en;
    
    if (msgLower.includes('skill') || msgLower.includes('können') || msgLower.includes('habilidad')) {
        return langResponses.skills;
    }
    if (msgLower.includes('experience') || msgLower.includes('erfahrung') || msgLower.includes('experiencia')) {
        return langResponses.experience;
    }
    if (msgLower.includes('contact') || msgLower.includes('kontakt') || msgLower.includes('contacto')) {
        return langResponses.contact;
    }
    
    return langResponses.default;
}

app.get('/health', (req, res) => {
    res.json({
        status: 'Proxy server running',
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!API_KEY,
        contextLoaded: true
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Grok Proxy Server running on http://localhost:${PORT}`);
    console.log(`🤖 API endpoint: http://localhost:${PORT}/api/grok`);
    console.log(`❤️ Health check: http://localhost:${PORT}/health`);
    console.log(`🔑 API Key configured: ${!!API_KEY ? 'Yes' : 'No'}`);
    console.log(`🧠 Michael Dabrock context loaded: ${MICHAEL_DABROCK_CONTEXT.length} characters`);
});