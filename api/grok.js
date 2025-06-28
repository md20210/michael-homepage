// api/grok.js - Serverless Function für Vercel
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

// Deine komplette server.cjs Logik hier...
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
    if (req.method === 'GET' && req.url === '/health') {
        return res.json({ 
            status: 'Vercel Backend Active',
            grokApiAvailable: !!API_KEY 
        });
    }
    
    if (req.method === 'POST') {
        const { message, lang } = req.body;
        const detectedLang = lang || detectLanguage(message);
        
        if (isAboutMichael(message)) {
            return res.json({
                success: true,
                message: 'Michael ist ein KI-Berater...',
                source: 'smart-local-ai',
                language: detectedLang
            });
        } else {
            // Grok API Call hier...
            return res.json({
                success: true,
                message: 'Grok API Response...',
                source: 'grok-api',
                language: detectedLang
            });
        }
    }
    
    res.status(404).json({ error: 'Not found' });
}
