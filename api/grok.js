@"
// api/grok.js - Korrekte Vercel Serverless Function
const API_KEY = process.env.VITE_XAI_API_KEY;

function detectLanguage(message) {
    const germanKeywords = ['wie', 'was', 'wer', 'wo', 'wann', 'alt', 'studiert'];
    const msgLower = message.toLowerCase();
    if (germanKeywords.some(keyword => msgLower.includes(keyword))) return 'de';
    return 'en';
}

function isAboutMichael(message) {
    return message.toLowerCase().includes('michael') || message.toLowerCase().includes('dabrock');
}

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        return res.json({ 
            status: 'Vercel Backend Active',
            grokApiAvailable: !!API_KEY,
            timestamp: new Date().toISOString()
        });
    }
    
    if (req.method === 'POST') {
        const { message, lang } = req.body;
        const detectedLang = lang || detectLanguage(message);
        
        if (isAboutMichael(message)) {
            return res.json({
                success: true,
                message: 'Michael ist ein erfahrener KI-Berater mit ueber 20 Jahren Erfahrung...',
                source: 'smart-local-ai',
                language: detectedLang
            });
        } else {
            return res.json({
                success: true,
                message: 'Entschuldigung, ich kann nur Fragen ueber Michael Dabrock beantworten.',
                source: 'fallback',
                language: detectedLang
            });
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}
"@ | Out-File -FilePath "api/grok.js" -Encoding UTF8