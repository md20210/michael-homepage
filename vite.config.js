// vite.config.js - CORRECT VERSION FOR RAILWAY
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

console.log('🔒 Secure build mode - Railway environment variables will be used');
console.log('🔍 VITE_XAI_API_KEY available:', !!process.env.VITE_XAI_API_KEY);

export default defineConfig({
    plugins: [react()],
    
    // WICHTIG: Base path für GitHub Pages
    base: './',
    
    // Environment Variables - ALLOW RAILWAY VARS
    define: {
        // Let Railway environment variables pass through
        // Don't override them with null!
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