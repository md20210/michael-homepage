// E:\Project20250615\portfolio-website\michael-homepage\vite.config.js
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
        // Proxy entfernt
    },
});

