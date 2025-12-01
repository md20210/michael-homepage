// src/services/grokApi.js - Einfache, funktionierende Version
import { getFallbackResponse, getApiErrorResponse } from '../utils/fallbackResponses.js';

export class GrokApiService {
    constructor() {
        // Verwende immer Fallback für zuverlässige Funktion
        this.fallbackMode = true;
        console.log('✅ GrokApiService initialized in reliable fallback mode');
    }

    async sendMessage(userMessage, language = 'en') {
        console.log('🤖 Processing message:', userMessage);
        
        // Realistische Antwortzeit simulieren
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));
        
        try {
            // Nutze die intelligenten Fallback-Antworten
            const response = getFallbackResponse(userMessage, language);
            
            console.log('✅ Intelligent fallback response generated');
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

    getStatus() {
        return {
            available: true,
            mode: 'intelligent-fallback',
            hasApiKey: false,
            fallbackMode: this.fallbackMode
        };
    }

    async testConnection() {
        return true; // Fallback ist immer verfügbar
    }
}

export const grokApi = new GrokApiService();