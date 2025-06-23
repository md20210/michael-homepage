// vite.config.js - ANGEPASST FÜR GITHUB PAGES
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createDecipheriv } from 'crypto';
import fs from 'fs';

// API-Schlüssel Entschlüsselung (nur für lokale Entwicklung)
let apiKey;
try {
    // Prüfen ob Verschlüsselungsdateien existieren (nur lokal)
    if (fs.existsSync('encryption_key.bin') && fs.existsSync('encryption_iv.bin') && fs.existsSync('encrypted_api_key.txt')) {
        const algorithm = 'aes-256-cbc';
        const key = fs.readFileSync('encryption_key.bin');
        const iv = fs.readFileSync('encryption_iv.bin');
        const encryptedKey = fs.readFileSync('encrypted_api_key.txt', 'utf8');
        const decipher = createDecipheriv(algorithm, key, iv);
        apiKey = decipher.update(encryptedKey, 'hex', 'utf8') + decipher.final('utf8');
        console.log('✅ API-Schlüssel erfolgreich entschlüsselt (lokale Entwicklung)');
    } else {
        console.log('🌐 Verschlüsselungsdateien nicht gefunden - verwende Environment Variables');
        apiKey = null;
    }
} catch (error) {
    console.log('ℹ️ Fallback zu Environment Variables:', error.message);
    apiKey = null;
}

export default defineConfig({
    plugins: [react()],
    
    // WICHTIG: Base path für GitHub Pages
    base: '/michael-homepage/',
    
    // Environment Variables definieren
    define: {
        // Lokaler API-Schlüssel oder Environment Variable
        'import.meta.env.VITE_XAI_API_KEY': JSON.stringify(apiKey || process.env.VITE_XAI_API_KEY || null),
    },
    
    // Build-Konfiguration für GitHub Pages
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        // Optimierungen für Production
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                },
            },
        },
    },
    
    // Server-Konfiguration (nur für lokale Entwicklung)
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
            },
        },
    },
    
    // Preview-Konfiguration
    preview: {
        port: 4173,
        open: true
    }
});