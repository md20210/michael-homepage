// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createDecipheriv } from 'crypto';
import fs from 'fs';

let apiKey;
try {
    const algorithm = 'aes-256-cbc';
    const key = fs.readFileSync('encryption_key.bin');
    const iv = fs.readFileSync('encryption_iv.bin');
    const encryptedKey = fs.readFileSync('encrypted_api_key.txt', 'utf8');
    const decipher = createDecipheriv(algorithm, key, iv);
    apiKey = decipher.update(encryptedKey, 'hex', 'utf8') + decipher.final('utf8');
    console.log('✅ API-Schlüssel erfolgreich entschlüsselt');
} catch (error) {
    console.error('❌ Entschlüsselungsfehler:', error);
    apiKey = null;
}

export default defineConfig({
    plugins: [react()],
    define: {
        'import.meta.env.VITE_XAI_API_KEY': JSON.stringify(apiKey),
    },
    server: {
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
});