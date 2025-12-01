// src/utils/apiKeyLoader.js - RUNTIME API KEY LOADING
import { createDecipheriv } from 'crypto';

class ApiKeyLoader {
    constructor() {
        this.apiKey = null;
        this.isLoaded = false;
    }

    // Lade API Key zur Laufzeit (nur im Browser mit lokalen Dateien)
    async loadApiKeyRuntime() {
        try {
            // Prüfe zuerst Environment Variables (Railway/Production)
            const envKey = import.meta.env.VITE_XAI_API_KEY;
            if (envKey && envKey !== 'null' && envKey !== null) {
                console.log('🔑 Using environment variable API key');
                this.apiKey = envKey;
                this.isLoaded = true;
                return this.apiKey;
            }

            // Für lokale Entwicklung: Versuche Entschlüsselung
            console.log('🔍 Environment API key not found, checking for local encrypted files...');
            
            // In Production/Browser kann keine Dateisystem-Entschlüsselung stattfinden
            // Fallback zu null
            console.log('💾 No API key available - using fallback mode');
            this.apiKey = null;
            this.isLoaded = true;
            return null;

        } catch (error) {
            console.log('⚠️ API key loading failed:', error.message);
            this.apiKey = null;
            this.isLoaded = true;
            return null;
        }
    }

    // Synchrone Getter (für bereits geladene Keys)
    getApiKey() {
        return this.apiKey;
    }

    // Async Getter (lädt Key falls nötig)
    async getApiKeyAsync() {
        if (!this.isLoaded) {
            await this.loadApiKeyRuntime();
        }
        return this.apiKey;
    }

    // Prüfe ob API Key verfügbar ist
    isAvailable() {
        return this.apiKey !== null && this.apiKey !== undefined;
    }

    // Setze API Key manuell (für Tests oder manuelle Konfiguration)
    setApiKey(key) {
        this.apiKey = key;
        this.isLoaded = true;
        console.log('🔑 API key set manually');
    }
}

// Singleton Instance
export const apiKeyLoader = new ApiKeyLoader();

// Convenience Funktionen
export const getApiKey = () => apiKeyLoader.getApiKey();
export const getApiKeyAsync = () => apiKeyLoader.getApiKeyAsync();
export const isApiKeyAvailable = () => apiKeyLoader.isAvailable();