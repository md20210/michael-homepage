// vite.config.js - SECURE VERSION - NO API KEYS IN BUILD
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

console.log('🔒 Secure build mode - API keys will NOT be embedded in build files');

export default defineConfig({
    plugins: [react()],
    
    // WICHTIG: Base path für GitHub Pages
    base: './',
    
    // Environment Variables - SECURE VERSION
    define: {
        // NEVER embed API keys in build files!
        // API keys should only be available at runtime via environment variables
        'import.meta.env.VITE_XAI_API_KEY': JSON.stringify(null),
        // Only embed non-sensitive config
        'import.meta.env.VITE_API_URL': JSON.stringify(null),
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
        // Lade API Key zur Laufzeit für lokale Entwicklung
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