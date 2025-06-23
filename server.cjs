// server.cjs - CommonJS Version
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const { createDecipheriv } = require('crypto');
const fs = require('fs');

// Lade Umgebungsvariablen
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Lade verschlüsselten Schlüssel und entschlüssle ihn
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

app.post('/api/grok', async (req, res) => {
    try {
        console.log('📨 Received request:', req.body);

        if (!API_KEY) {
            throw new Error('API key not configured');
        }

        // Konvertiere Frontend-Format in xAI-Format
        const { message, lang } = req.body;
        const xaiBody = {
            messages: [
                { role: 'system', content: 'You are Grok, a helpful AI assistant.' },
                { role: 'user', content: message }
            ],
            model: 'grok-2-1212',
            language: lang
        };

        const response = await axios.post(GROK_API_URL, xaiBody, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'User-Agent': 'Michael-Homepage-Backend/1.0'
            }
        });

        console.log('✅ Grok response received:', response.data);
        res.json({
            success: true,
            message: response.data.choices[0].message.content,
            source: 'grok-api'
        });
    } catch (error) {
        console.error('💥 Proxy Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to call Grok API',
            message: error.response?.data || error.message
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