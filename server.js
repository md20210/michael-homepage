// server.js (Ausschnitt)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createDecipheriv } from 'crypto';
import fs from 'fs';

// Lade Umgebungsvariablen
dotenv.config();

const app = express();
const PORT = 3001;

// Lade verschlüsselten Schlüssel und entschlüssle ihn
const algorithm = 'aes-256-cbc';
const encryptedApiKey = fs.readFileSync('encrypted_api_key.txt', 'utf8');
const key = fs.readFileSync('encryption_key.bin');
const iv = fs.readFileSync('encryption_iv.bin');
const decipher = createDecipheriv(algorithm, key, iv);
let decrypted = decipher.update(encryptedApiKey, 'hex', 'utf8');
decrypted += decipher.final('utf8');
const API_KEY = decrypted;

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

app.use(cors());
app.use(express.json());

app.post('/api/grok', async (req, res) => {
    try {
        console.log('📨 Received request:', req.body.messages?.[1]?.content);
        
        // Überprüfen ob API-Schlüssel gesetzt ist
        if (!API_KEY) {
            throw new Error('API key not configured');
        }
        
        const response = await fetch(GROK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                ...req.body,
                model: 'grok-beta' // Verwende grok-beta statt grok-3-latest
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Grok API Error:', response.status, errorText);
            throw new Error(`Grok API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Grok response received');
        res.json(data);
        
    } catch (error) {
        console.error('💥 Proxy Error:', error.message);
        res.status(500).json({ 
            error: 'Failed to call Grok API',
            message: error.message 
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'Proxy server running', 
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!API_KEY
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Grok Proxy Server running on http://localhost:${PORT}`);
    console.log(`🤖 API endpoint: http://localhost:${PORT}/api/grok`);
    console.log(`❤️ Health check: http://localhost:${PORT}/health`);
    console.log(`🔑 API Key configured: ${!!API_KEY ? 'Yes' : 'No'}`);
});