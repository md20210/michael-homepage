// E:\Project20250615\portfolio-website\michael-homepage\encrypt.js
import { createCipheriv, randomBytes } from 'crypto';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const algorithm = 'aes-256-cbc';
const key = randomBytes(32);
const iv = randomBytes(16);
const apiKey = process.env.VITE_XAI_API_KEY; // Änderung zu VITE_

if (!apiKey) {
    console.error('❌ Fehler: VITE_XAI_API_KEY ist nicht in der .env-Datei definiert.');
    process.exit(1);
}

const cipher = createCipheriv(algorithm, key, iv);
let encrypted = cipher.update(apiKey, 'utf8', 'hex');
encrypted += cipher.final('hex');

fs.writeFileSync('encrypted_api_key.txt', encrypted);
fs.writeFileSync('encryption_key.bin', key);
fs.writeFileSync('encryption_iv.bin', iv);

console.log('✅ API-Schlüssel erfolgreich verschlüsselt und gespeichert.');