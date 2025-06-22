// E:\Project20250615\portfolio-website\michael-homepage\src\services\grokApi.js
import { getFallbackResponse, getApiErrorResponse } from '../utils/fallbackResponses.js';

export class GrokApiService {
    constructor() {
        this.apiKey = import.meta.env.VITE_XAI_API_KEY;
        console.log('API-Schlüssel:', this.apiKey ? 'Vorhanden' : 'Fehlt');
        this.fallbackMode = !this.apiKey;
        console.log(`GrokApiService initialized. Fallback mode: ${this.fallbackMode}`);
    }

    async sendMessage(userMessage, language = 'en') {
        console.log('🤖 Processing message:', userMessage);

        if (this.fallbackMode) {
            console.log('⚠️ Using intelligent fallback mode');
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
            try {
                const response = getFallbackResponse(userMessage, language);
                return {
                    success: true,
                    message: response,
                    source: 'intelligent-fallback'
                };
            } catch (error) {
                console.error('❌ Fallback error:', error);
                return {
                    success: false,
                    message: getApiErrorResponse(language),
                    source: 'error-fallback'
                };
            }
        }

        try {
            const response = await fetch('http://localhost:3001/api/grok', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage, lang: language }),
            });

            console.log('Antwortstatus:', response.status);
            if (!response.ok) {
                let errorText;
                try {
                    errorText = await response.json();
                } catch {
                    errorText = await response.text();
                }
                console.error('Antwortfehler:', errorText);
                throw new Error(`HTTP error ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Grok API Antwort erhalten:', data);
            return {
                success: true,
                message: data.message,
                source: 'grok-api'
            };
        } catch (error) {
            console.error('❌ Grok API Fehler:', error);
            return {
                success: false,
                message: getApiErrorResponse(language),
                source: 'error-fallback'
            };
        }
    }

    getStatus() {
        return {
            available: true,
            mode: this.fallbackMode ? 'intelligent-fallback' : 'grok-api',
            hasApiKey: !!this.apiKey,
            fallbackMode: this.fallbackMode
        };
    }

    async testConnection() {
        if (this.fallbackMode) return true;
        try {
            const response = await fetch('http://localhost:3001/api/grok', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: 'Test', lang: 'en' }),
            });
            console.log('Testverbindung Status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Testverbindung Fehler:', errorText);
            }
            return response.ok;
        } catch (error) {
            console.error('Verbindungstest fehlgeschlagen:', error);
            return false;
        }
    }
}

export const grokApi = new GrokApiService();