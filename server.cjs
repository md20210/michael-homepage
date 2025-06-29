// server.cjs - EXPRESS SERVER FOR RAILWAY DEPLOYMENT
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const { createDecipheriv } = require('crypto');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Railway uses PORT env var

console.log('🚀 Starting Express server for Railway...');
console.log('📦 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

// CORS KONFIGURATION - Updated for Railway
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:4173',
        'https://michael-homepage-dev-production.up.railway.app',
        // Optional: GitHub Pages fallback
        'https://md20210.github.io',
        'https://md20210.github.io/michael-homepage',
        'https://md20210.github.io/michael-homepage-dev'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parser MUSS vor den Routen stehen
app.use(express.json());

// Serve static files from dist directory (Vite build output)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    console.log('📁 Serving static files from:', distPath);
    app.use(express.static(distPath));
} else {
    console.log('⚠️ No dist directory found - you may need to run "npm run build" first');
}

// MICHAEL KNOWLEDGE BASE (your existing knowledge base)
const MICHAEL_KNOWLEDGE_BASE = {
    de: {
        alter: "Michaels genaues Alter ist nicht in den bereitgestellten Informationen angegeben. Basierend auf seiner über 20-jährigen Berufserfahrung und seinem Studienabschluss am KIT kann man schätzen, dass er erfahren und etabliert in seiner Karriere ist.",
        studium: "Michael hat am Karlsruhe Institute of Technology (KIT) in Deutschland studiert und einen Diplom-Abschluss in Wirtschaftsingenieurwesen erhalten. Seine Masterarbeit behandelte 'Integration heterogener Datenbanken mittels Machine-Learning-Algorithmen' und erhielt die Bestnote 1,0. Er bekam ein Promotionsangebot, entschied sich aber für eine Karriere in der Wirtschaft.",
        erfahrung: "Michael Dabrock hat über 20 Jahre Berufserfahrung in der IT-Beratung und Enterprise Architecture. Er arbeitete bei Cognizant Technology Solutions (2011-2023) als Global Program Director, bei Wipro Technologies (2008-2011) als Enterprise Architect, und bei IBM Business Consulting (2002-2007) als Senior IT Architect. Aktuell ist er KI-Berater & Spezialist in Barcelona.",
        projekte: "Michael leitete über 50 Projekte, darunter: Deutsche Telekom SAP Factory (300+ Berater, €10M+ Budget, 20% Effizienzsteigerung), Pharma Cloud Migration für Merck (€10M+ jährlich, 30% Kostensenkung), Zürich Versicherungsplattform (€7M), Enterprise Service Bus für Deutsche Telekom (20% schnellere Integrationen), und viele weitere Großprojekte.",
        aktuell: "Seit Dezember 2023 ist Michael KI-Berater & Spezialist in Barcelona, Spanien. Er spezialisiert sich auf ChatGPT, Grok, Gemini und Claude Integration. Er entwickelte einen mehrsprachigen Chatbot (EN/DE/ES) powered by IIElevenLabs, ChatGPT, Gemini und n8n für Projektwissensmanagement.",
        kontakt: "Michael ist innerhalb von 2-3 Wochen für neue Möglichkeiten verfügbar. Er lebt in Barcelona, Spanien mit EU-Arbeitserlaubnis. Kontakt: michael.dabrock@gmx.es oder +34 683 1782 48. KI-Telefon-Assistent: +34 93 694 5855 (mehrsprachig EN/DE/ES).",
        zertifikate: "Michael besitzt folgende Zertifizierungen: IBM Certified Architect, TOGAF, Stanford Advanced Project Management, Scrum Master, TIBCO Certified Consultant, CrossWorlds Certified Consultant, SAP Business Warehouse.",
        sprachen: "Michael spricht Deutsch als Muttersprache, Englisch fließend und Spanisch auf Grundniveau. Er lebt in Barcelona und ist bereit für Remote/Hybrid-Arbeit mit monatlichen Reisen.",
        default: "Michael Dabrock ist ein erfahrener KI-Berater & Enterprise Architect mit über 20 Jahren Berufserfahrung. Er studierte am KIT Karlsruhe (Note 1,0), arbeitete bei Cognizant, Wipro und IBM, und ist derzeit auf KI-Integration spezialisiert. Er ist verfügbar für neue Möglichkeiten in Barcelona."
    },
    en: {
        age: "Michael's exact age is not specified in the provided information. Based on his 20+ years of professional experience and university graduation from KIT, we can infer he is experienced and well-established in his career.",
        education: "Michael studied at Karlsruhe Institute of Technology (KIT) in Germany and received a Diploma in Industrial Engineering. His Master's thesis on 'Integration of heterogeneous databases using machine learning algorithms' received the highest grade 1.0. He was offered a PhD position but chose a business career instead.",
        experience: "Michael Dabrock has 20+ years of professional experience in IT consulting and enterprise architecture. He worked at Cognizant Technology Solutions (2011-2023) as Global Program Director, Wipro Technologies (2008-2011) as Enterprise Architect, and IBM Business Consulting (2002-2007) as Senior IT Architect. Currently he's an AI Consultant & Specialist in Barcelona.",
        projects: "Michael led 50+ projects including: Deutsche Telekom SAP Factory (300+ consultants, €10M+ budget, 20% efficiency increase), Pharma Cloud Migration for Merck (€10M+ annually, 30% cost reduction), Zürich Insurance Platform (€7M), Enterprise Service Bus for Deutsche Telekom (20% faster integrations), and many other major projects.",
        current: "Since December 2023, Michael is an AI Consultant & Specialist in Barcelona, Spain. He specializes in ChatGPT, Grok, Gemini, and Claude integration. He built a multilingual chatbot (EN/DE/ES) powered by IIElevenLabs, ChatGPT, Gemini, and n8n for project knowledge management.",
        contact: "Michael is available within 2-3 weeks for new opportunities. He lives in Barcelona, Spain with EU work permit. Contact: michael.dabrock@gmx.es or +34 683 1782 48. AI Phone Assistant: +34 93 694 5855 (multilingual EN/DE/ES).",
        certifications: "Michael holds the following certifications: IBM Certified Architect, TOGAF, Stanford Advanced Project Management, Scrum Master, TIBCO Certified Consultant, CrossWorlds Certified Consultant, SAP Business Warehouse.",
        languages: "Michael speaks German natively, English fluently, and Spanish at a basic level. He lives in Barcelona and is willing to work remote/hybrid with monthly travel.",
        default: "Michael Dabrock is an experienced AI Consultant & Enterprise Architect with 20+ years of professional experience. He studied at KIT Karlsruhe (grade 1.0), worked at Cognizant, Wipro, and IBM, and currently specializes in AI integration. He's available for new opportunities in Barcelona."
    }
};

// API KEY ENTSCHLÜSSELUNG with Railway Environment Variable fallback
const algorithm = 'aes-256-cbc';
let API_KEY;

try {
    // Try encrypted files first (for local development)
    if (fs.existsSync('encrypted_api_key.txt') && fs.existsSync('encryption_key.bin') && fs.existsSync('encryption_iv.bin')) {
        const encryptedApiKey = fs.readFileSync('encrypted_api_key.txt', 'utf8');
        const key = fs.readFileSync('encryption_key.bin');
        const iv = fs.readFileSync('encryption_iv.bin');
        const decipher = createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedApiKey, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        API_KEY = decrypted;
        console.log('✅ API-Schlüssel erfolgreich entschlüsselt:', API_KEY ? `${API_KEY.substring(0, 15)}...` : 'null');
    } else {
        throw new Error('Encrypted files not found');
    }
} catch (error) {
    console.log('⚠️ Encrypted API key not available, trying environment variables...');
    API_KEY = process.env.VITE_XAI_API_KEY || process.env.XAI_API_KEY;
    if (API_KEY) {
        console.log('✅ Using environment variable API key:', `${API_KEY.substring(0, 15)}...`);
    } else {
        console.log('❌ No API // server.cjs - EXPRESS SERVER FOR RAILWAY DEPLOYMENT - CLEAN VERSION
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Express server for Railway...');
console.log('📦 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

// DEBUG: Environment Variables
console.log('🔍 Environment Variable Debug:');
console.log('🔍 process.env.VITE_XAI_API_KEY:', process.env.VITE_XAI_API_KEY ? `${process.env.VITE_XAI_API_KEY.substring(0, 15)}...` : 'undefined');
console.log('🔍 process.env.XAI_API_KEY:', process.env.XAI_API_KEY ? `${process.env.XAI_API_KEY.substring(0, 15)}...` : 'undefined');
console.log('🔍 All env vars with XAI:', Object.keys(process.env).filter(key => key.includes('XAI')));
console.log('🔍 All env vars with VITE:', Object.keys(process.env).filter(key => key.includes('VITE')));

// CORS KONFIGURATION
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:4173',
        'https://michael-homepage-dev-production.up.railway.app',
        'https://md20210.github.io',
        'https://md20210.github.io/michael-homepage',
        'https://md20210.github.io/michael-homepage-dev'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Serve static files from dist directory
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    console.log('📁 Serving static files from:', distPath);
    app.use(express.static(distPath));
} else {
    console.log('⚠️ No dist directory found - you may need to run "npm run build" first');
}

// API KEY - ONLY from Railway Environment Variables
const API_KEY = process.env.VITE_XAI_API_KEY || process.env.XAI_API_KEY;

if (API_KEY) {
    console.log('✅ API Key loaded from environment:', `${API_KEY.substring(0, 15)}...`);
} else {
    console.log('❌ No API key found in environment variables');
    console.log('📋 Available environment variables:', Object.keys(process.env).filter(key => key.includes('API') || key.includes('XAI') || key.includes('VITE')));
}

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

// MICHAEL KNOWLEDGE BASE
const MICHAEL_KNOWLEDGE_BASE = {
    de: {
        alter: "Michaels genaues Alter ist nicht in den bereitgestellten Informationen angegeben. Basierend auf seiner über 20-jährigen Berufserfahrung und seinem Studienabschluss am KIT kann man schätzen, dass er erfahren und etabliert in seiner Karriere ist.",
        studium: "Michael hat am Karlsruhe Institute of Technology (KIT) in Deutschland studiert und einen Diplom-Abschluss in Wirtschaftsingenieurwesen erhalten. Seine Masterarbeit behandelte 'Integration heterogener Datenbanken mittels Machine-Learning-Algorithmen' und erhielt die Bestnote 1,0. Er bekam ein Promotionsangebot, entschied sich aber für eine Karriere in der Wirtschaft.",
        erfahrung: "Michael Dabrock hat über 20 Jahre Berufserfahrung in der IT-Beratung und Enterprise Architecture. Er arbeitete bei Cognizant Technology Solutions (2011-2023) als Global Program Director, bei Wipro Technologies (2008-2011) als Enterprise Architect, und bei IBM Business Consulting (2002-2007) als Senior IT Architect. Aktuell ist er KI-Berater & Spezialist in Barcelona.",
        projekte: "Michael leitete über 50 Projekte, darunter: Deutsche Telekom SAP Factory (300+ Berater, €10M+ Budget, 20% Effizienzsteigerung), Pharma Cloud Migration für Merck (€10M+ jährlich, 30% Kostensenkung), Zürich Versicherungsplattform (€7M), Enterprise Service Bus für Deutsche Telekom (20% schnellere Integrationen), und viele weitere Großprojekte.",
        aktuell: "Seit Dezember 2023 ist Michael KI-Berater & Spezialist in Barcelona, Spanien. Er spezialisiert sich auf ChatGPT, Grok, Gemini und Claude Integration. Er entwickelte einen mehrsprachigen Chatbot (EN/DE/ES) powered by IIElevenLabs, ChatGPT, Gemini und n8n für Projektwissensmanagement.",
        kontakt: "Michael ist innerhalb von 2-3 Wochen für neue Möglichkeiten verfügbar. Er lebt in Barcelona, Spanien mit EU-Arbeitserlaubnis. Kontakt: michael.dabrock@gmx.es oder +34 683 1782 48. KI-Telefon-Assistent: +34 93 694 5855 (mehrsprachig EN/DE/ES).",
        zertifikate: "Michael besitzt folgende Zertifizierungen: IBM Certified Architect, TOGAF, Stanford Advanced Project Management, Scrum Master, TIBCO Certified Consultant, CrossWorlds Certified Consultant, SAP Business Warehouse.",
        sprachen: "Michael spricht Deutsch als Muttersprache, Englisch fließend und Spanisch auf Grundniveau. Er lebt in Barcelona und ist bereit für Remote/Hybrid-Arbeit mit monatlichen Reisen.",
        default: "Michael Dabrock ist ein erfahrener KI-Berater & Enterprise Architect mit über 20 Jahren Berufserfahrung. Er studierte am KIT Karlsruhe (Note 1,0), arbeitete bei Cognizant, Wipro und IBM, und ist derzeit auf KI-Integration spezialisiert. Er ist verfügbar für neue Möglichkeiten in Barcelona."
    },
    en: {
        age: "Michael's exact age is not specified in the provided information. Based on his 20+ years of professional experience and university graduation from KIT, we can infer he is experienced and well-established in his career.",
        education: "Michael studied at Karlsruhe Institute of Technology (KIT) in Germany and received a Diploma in Industrial Engineering. His Master's thesis on 'Integration of heterogeneous databases using machine learning algorithms' received the highest grade 1.0. He was offered a PhD position but chose a business career instead.",
        experience: "Michael Dabrock has 20+ years of professional experience in IT consulting and enterprise architecture. He worked at Cognizant Technology Solutions (2011-2023) as Global Program Director, Wipro Technologies (2008-2011) as Enterprise Architect, and IBM Business Consulting (2002-2007) as Senior IT Architect. Currently he's an AI Consultant & Specialist in Barcelona.",
        projects: "Michael led 50+ projects including: Deutsche Telekom SAP Factory (300+ consultants, €10M+ budget, 20% efficiency increase), Pharma Cloud Migration for Merck (€10M+ annually, 30% cost reduction), Zürich Insurance Platform (€7M), Enterprise Service Bus for Deutsche Telekom (20% faster integrations), and many other major projects.",
        current: "Since December 2023, Michael is an AI Consultant & Specialist in Barcelona, Spain. He specializes in ChatGPT, Grok, Gemini, and Claude integration. He built a multilingual chatbot (EN/DE/ES) powered by IIElevenLabs, ChatGPT, Gemini, and n8n for project knowledge management.",
        contact: "Michael is available within 2-3 weeks for new opportunities. He lives in Barcelona, Spain with EU work permit. Contact: michael.dabrock@gmx.es or +34 683 1782 48. AI Phone Assistant: +34 93 694 5855 (multilingual EN/DE/ES).",
        certifications: "Michael holds the following certifications: IBM Certified Architect, TOGAF, Stanford Advanced Project Management, Scrum Master, TIBCO Certified Consultant, CrossWorlds Certified Consultant, SAP Business Warehouse.",
        languages: "Michael speaks German natively, English fluently, and Spanish at a basic level. He lives in Barcelona and is willing to work remote/hybrid with monthly travel.",
        default: "Michael Dabrock is an experienced AI Consultant & Enterprise Architect with 20+ years of professional experience. He studied at KIT Karlsruhe (grade 1.0), worked at Cognizant, Wipro, and IBM, and currently specializes in AI integration. He's available for new opportunities in Barcelona."
    }
};

// Helper functions
function detectLanguage(message) {
    const germanKeywords = ["wie", "wieviel", "was", "welche", "wer", "wo", "wann", "alt", "alter", "studiert", "studium", "uni", "universität"];
    const spanishKeywords = ["cuánto", "qué", "cuáles", "quién", "dónde", "cuándo", "edad", "estudió", "universidad"];
    const msgLower = message.toLowerCase();

    if (germanKeywords.some(keyword => msgLower.includes(keyword))) return "de";
    if (spanishKeywords.some(keyword => msgLower.includes(keyword))) return "es";
    return "en";
}

function isAboutMichael(message) {
    const msgLower = message.toLowerCase();
    const michaelKeywords = ["michael", "dabrock"];
    const explicitMichael = michaelKeywords.some(keyword => msgLower.includes(keyword));
    
    console.log(`🔍 Michael check: "${message}" - Contains Michael: ${explicitMichael}`);
    return explicitMichael;
}

async function callRealGrokAPI(message, language) {
    if (!API_KEY) {
        console.log('❌ No API key available for Grok');
        return { success: false, error: 'No API key' };
    }

    try {
        console.log('🚀 Calling REAL Grok API...');
        console.log('🔑 Using API key:', `${API_KEY.substring(0, 15)}...`);
        
        const systemPrompt = language === 'de' ? 
            'Du bist Grok, ein hilfreicher KI-Assistent. Antworte auf Deutsch.' :
            language === 'es' ?
            'Eres Grok, un asistente de IA útil. Responde en español.' :
            'You are Grok, a helpful AI assistant. Respond in English.';

        const requestData = {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            model: 'grok-2-1212', // Correct Grok model
            temperature: 0.7,
            max_tokens: 400
        };

        console.log('📤 Sending request to Grok API...');
        const response = await axios.post(GROK_API_URL, requestData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            timeout: 15000
        });
        
        const grokResponse = response.data.choices[0]?.message?.content;
        console.log(`✅ Real Grok API response: "${grokResponse?.substring(0, 100)}..."`);
        
        return {
            success: true,
            message: grokResponse
        };
        
    } catch (error) {
        console.log('❌ Real Grok API failed:', error.response?.status, error.response?.statusText);
        if (error.response?.data) {
            console.log('📄 Error details:', error.response.data);
        }
        return { success: false, error: error.message };
    }
}

function getMichaelResponse(message, language) {
    const msgLower = message.toLowerCase();
    const kb = MICHAEL_KNOWLEDGE_BASE[language] || MICHAEL_KNOWLEDGE_BASE.en;
    
    if (msgLower.includes('alt') || msgLower.includes('age') || msgLower.includes('edad')) {
        return kb.alter || kb.age;
    }
    
    if (msgLower.includes('studiert') || msgLower.includes('studium') || msgLower.includes('uni') || 
        msgLower.includes('university') || msgLower.includes('education') || msgLower.includes('universidad') ||
        msgLower.includes('heidelberg') || msgLower.includes('karlsruhe') || msgLower.includes('kit')) {
        return kb.studium || kb.education;
    }
    
    if (msgLower.includes('erfahrung') || msgLower.includes('experience') || msgLower.includes('experiencia') ||
        msgLower.includes('jahre') || msgLower.includes('years') || msgLower.includes('años')) {
        return kb.erfahrung || kb.experience;
    }
    
    if (msgLower.includes('projekt') || msgLower.includes('project') || msgLower.includes('proyecto')) {
        return kb.projekte || kb.projects;
    }
    
    if (msgLower.includes('aktuell') || msgLower.includes('current') || msgLower.includes('actual') ||
        msgLower.includes('ai') || msgLower.includes('ki') || msgLower.includes('chatbot')) {
        return kb.aktuell || kb.current;
    }
    
    if (msgLower.includes('kontakt') || msgLower.includes('contact') || msgLower.includes('contacto') ||
        msgLower.includes('verfügbar') || msgLower.includes('available') || msgLower.includes('disponible')) {
        return kb.kontakt || kb.contact;
    }
    
    if (msgLower.includes('zertifikat') || msgLower.includes('certification') || msgLower.includes('certificación')) {
        return kb.zertifikate || kb.certifications;
    }
    
    if (msgLower.includes('sprach') || msgLower.includes('language') || msgLower.includes('idioma')) {
        return kb.sprachen || kb.languages;
    }
    
    return kb.default;
}

// API ROUTES
app.post('/api/grok', async (req, res) => {
    try {
        console.log('📨 Received request:', req.body);

        const { message, lang } = req.body;
        const detectedLang = lang || detectLanguage(message);

        if (isAboutMichael(message)) {
            console.log('👨‍💼 Michael question - using local knowledge');
            const michaelResponse = getMichaelResponse(message, detectedLang);
            
            res.json({
                success: true,
                message: michaelResponse,
                source: 'smart-local-ai',
                language: detectedLang,
                note: 'Michael Dabrock knowledge base'
            });
            
        } else {
            console.log('🌍 Non-Michael question - trying real Grok API');
            
            const grokResult = await callRealGrokAPI(message, detectedLang);
            
            if (grokResult.success) {
                res.json({
                    success: true,
                    message: grokResult.message,
                    source: 'grok-api',
                    language: detectedLang,
                    note: 'Real Grok API response'
                });
            } else {
                const fallbackMsg = detectedLang === 'de' ? 
                    "Entschuldigung, ich kann derzeit nur Fragen über Michael Dabrock beantworten. Für andere Themen ist meine Grok-Verbindung nicht verfügbar." :
                    detectedLang === 'es' ?
                    "Lo siento, actualmente solo puedo responder preguntas sobre Michael Dabrock. Mi conexión Grok para otros temas no está disponible." :
                    "Sorry, I can currently only answer questions about Michael Dabrock. My Grok connection for other topics is unavailable.";
                
                res.json({
                    success: true,
                    message: fallbackMsg,
                    source: 'fallback',
                    language: detectedLang,
                    note: 'Grok API unavailable'
                });
            }
        }

    } catch (error) {
        console.error('💥 Error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Server error occurred',
            source: 'error',
            language: req.body.lang || 'en'
        });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'Hybrid AI System - Michael Knowledge + Real Grok',
        timestamp: new Date().toISOString(),
        strategy: 'Michael questions → Local KB, Other questions → Real Grok API',
        languages: Object.keys(MICHAEL_KNOWLEDGE_BASE),
        grokApiAvailable: !!API_KEY,
        apiKeySource: API_KEY ? 'Environment Variable' : 'Missing',
        knowledgeItems: Object.keys(MICHAEL_KNOWLEDGE_BASE.en).length,
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        distPath: fs.existsSync(distPath) ? 'Available' : 'Missing'
    });
});

// Serve React app for all other routes (SPA routing)
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('App not built. Run "npm run build" first.');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Hybrid AI System running on port ${PORT}`);
    console.log(`👨‍💼 Michael questions → Local Knowledge Base`);
    console.log(`🌍 Other questions → Real Grok API ${API_KEY ? '✅' : '❌'}`);
    console.log(`🔐 API Key: ${API_KEY ? 'Available' : 'Missing'}`);
    console.log(`📚 Michael knowledge loaded: ${Object.keys(MICHAEL_KNOWLEDGE_BASE.en).length} topics`);
    console.log(`📁 Static files: ${fs.existsSync(distPath) ? 'Available' : 'Missing - run npm run build'}`);
    console.log(`🎯 Ready for Railway deployment!`);
}); available from any source');
    }
}

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

// Helper functions (your existing functions)
function detectLanguage(message) {
    const germanKeywords = ["wie", "wieviel", "was", "welche", "wer", "wo", "wann", "alt", "alter", "studiert", "studium", "uni", "universität"];
    const spanishKeywords = ["cuánto", "qué", "cuáles", "quién", "dónde", "cuándo", "edad", "estudió", "universidad"];
    const msgLower = message.toLowerCase();

    if (germanKeywords.some(keyword => msgLower.includes(keyword))) return "de";
    if (spanishKeywords.some(keyword => msgLower.includes(keyword))) return "es";
    return "en";
}

function isAboutMichael(message) {
    const msgLower = message.toLowerCase();
    const michaelKeywords = ["michael", "dabrock"];
    const explicitMichael = michaelKeywords.some(keyword => msgLower.includes(keyword));
    
    console.log(`🔍 Michael check: "${message}" - Contains Michael: ${explicitMichael}`);
    return explicitMichael;
}

async function callRealGrokAPI(message, language) {
    if (!API_KEY) {
        console.log('❌ No API key available for Grok');
        return { success: false, error: 'No API key' };
    }

    try {
        console.log('🚀 Calling REAL Grok API...');
        
        const systemPrompt = language === 'de' ? 
            'Du bist Grok, ein hilfreicher KI-Assistent. Antworte auf Deutsch.' :
            language === 'es' ?
            'Eres Grok, un asistente de IA útil. Responde en español.' :
            'You are Grok, a helpful AI assistant. Respond in English.';

        const requestData = {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            model: 'grok-2-1212',
            temperature: 0.1,
            max_tokens: 300
        };

        const response = await axios.post(GROK_API_URL, requestData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            timeout: 15000
        });
        
        const grokResponse = response.data.choices[0]?.message?.content;
        console.log(`✅ Real Grok API response: "${grokResponse}"`);
        
        return {
            success: true,
            message: grokResponse
        };
        
    } catch (error) {
        console.log('❌ Real Grok API failed:', error.response?.status, error.response?.statusText);
        return { success: false, error: error.message };
    }
}

function getMichaelResponse(message, language) {
    const msgLower = message.toLowerCase();
    const kb = MICHAEL_KNOWLEDGE_BASE[language] || MICHAEL_KNOWLEDGE_BASE.en;
    
    if (msgLower.includes('alt') || msgLower.includes('age') || msgLower.includes('edad')) {
        return kb.alter || kb.age;
    }
    
    if (msgLower.includes('studiert') || msgLower.includes('studium') || msgLower.includes('uni') || 
        msgLower.includes('university') || msgLower.includes('education') || msgLower.includes('universidad') ||
        msgLower.includes('heidelberg') || msgLower.includes('karlsruhe') || msgLower.includes('kit')) {
        return kb.studium || kb.education;
    }
    
    if (msgLower.includes('erfahrung') || msgLower.includes('experience') || msgLower.includes('experiencia') ||
        msgLower.includes('jahre') || msgLower.includes('years') || msgLower.includes('años')) {
        return kb.erfahrung || kb.experience;
    }
    
    if (msgLower.includes('projekt') || msgLower.includes('project') || msgLower.includes('proyecto')) {
        return kb.projekte || kb.projects;
    }
    
    if (msgLower.includes('aktuell') || msgLower.includes('current') || msgLower.includes('actual') ||
        msgLower.includes('ai') || msgLower.includes('ki') || msgLower.includes('chatbot')) {
        return kb.aktuell || kb.current;
    }
    
    if (msgLower.includes('kontakt') || msgLower.includes('contact') || msgLower.includes('contacto') ||
        msgLower.includes('verfügbar') || msgLower.includes('available') || msgLower.includes('disponible')) {
        return kb.kontakt || kb.contact;
    }
    
    if (msgLower.includes('zertifikat') || msgLower.includes('certification') || msgLower.includes('certificación')) {
        return kb.zertifikate || kb.certifications;
    }
    
    if (msgLower.includes('sprach') || msgLower.includes('language') || msgLower.includes('idioma')) {
        return kb.sprachen || kb.languages;
    }
    
    return kb.default;
}

// API ROUTES
app.post('/api/grok', async (req, res) => {
    try {
        console.log('📨 Received request:', req.body);

        const { message, lang } = req.body;
        const detectedLang = lang || detectLanguage(message);

        if (isAboutMichael(message)) {
            console.log('👨‍💼 Michael question - using local knowledge');
            const michaelResponse = getMichaelResponse(message, detectedLang);
            
            res.json({
                success: true,
                message: michaelResponse,
                source: 'smart-local-ai',
                language: detectedLang,
                note: 'Michael Dabrock knowledge base'
            });
            
        } else {
            console.log('🌍 Non-Michael question - trying real Grok API');
            
            const grokResult = await callRealGrokAPI(message, detectedLang);
            
            if (grokResult.success) {
                res.json({
                    success: true,
                    message: grokResult.message,
                    source: 'grok-api',
                    language: detectedLang,
                    note: 'Real Grok API response'
                });
            } else {
                const fallbackMsg = detectedLang === 'de' ? 
                    "Entschuldigung, ich kann derzeit nur Fragen über Michael Dabrock beantworten. Für andere Themen ist meine Grok-Verbindung nicht verfügbar." :
                    detectedLang === 'es' ?
                    "Lo siento, actualmente solo puedo responder preguntas sobre Michael Dabrock. Mi conexión Grok para otros temas no está disponible." :
                    "Sorry, I can currently only answer questions about Michael Dabrock. My Grok connection for other topics is unavailable.";
                
                res.json({
                    success: true,
                    message: fallbackMsg,
                    source: 'fallback',
                    language: detectedLang,
                    note: 'Grok API unavailable'
                });
            }
        }

    } catch (error) {
        console.error('💥 Error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Server error occurred',
            source: 'error',
            language: req.body.lang || 'en'
        });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'Hybrid AI System - Michael Knowledge + Real Grok',
        timestamp: new Date().toISOString(),
        strategy: 'Michael questions → Local KB, Other questions → Real Grok API',
        languages: Object.keys(MICHAEL_KNOWLEDGE_BASE),
        grokApiAvailable: !!API_KEY,
        encryptionUsed: fs.existsSync('encrypted_api_key.txt'),
        knowledgeItems: Object.keys(MICHAEL_KNOWLEDGE_BASE.en).length,
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        distPath: fs.existsSync(distPath) ? 'Available' : 'Missing'
    });
});

// Serve React app for all other routes (SPA routing)
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('App not built. Run "npm run build" first.');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Hybrid AI System running on port ${PORT}`);
    console.log(`👨‍💼 Michael questions → Local Knowledge Base`);
    console.log(`🌍 Other questions → Real Grok API ${API_KEY ? '✅' : '❌'}`);
    console.log(`🔐 API Key: ${API_KEY ? 'Available' : 'Missing'}`);
    console.log(`📚 Michael knowledge loaded: ${Object.keys(MICHAEL_KNOWLEDGE_BASE.en).length} topics`);
    console.log(`📁 Static files: ${fs.existsSync(distPath) ? 'Available' : 'Missing - run npm run build'}`);
    console.log(`🎯 Ready for Railway deployment!`);
});