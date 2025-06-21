import { createCipheriv, randomBytes } from 'crypto';
import fs from 'fs';
import dotenv from 'dotenv';

// Lade Umgebungsvariablen
dotenv.config();

// Konfiguration
const algorithm = 'aes-256-cbc';
const key = randomBytes(32); // 32 Bytes für AES-256
const iv = randomBytes(16);  // 16 Bytes für AES-CBC IV
const apiKey = process.env.GROK_API_KEY; // Lade API-Schlüssel aus .env

// Überprüfe, ob der API-Schlüssel existiert
if (!apiKey) {
    console.error('❌ Fehler: GROK_API_KEY ist nicht in der .env-Datei definiert.');
    process.exit(1);
}

// Verschlüsseln
const cipher = createCipheriv(algorithm, key, iv);
let encrypted = cipher.update(apiKey, 'utf8', 'hex');
encrypted += cipher.final('hex');

// Speichere verschlüsselten Schlüssel, Key und IV
fs.writeFileSync('encrypted_api_key.txt', encrypted);
fs.writeFileSync('encryption_key.bin', key);
fs.writeFileSync('encryption_iv.bin', iv);

console.log('✅ API-Schlüssel erfolgreich verschlüsselt und gespeichert.');