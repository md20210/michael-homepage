// decrypt.js
import { createDecipheriv } from 'crypto';
import fs from 'fs';

const algorithm = 'aes-256-cbc';
const key = fs.readFileSync('encryption_key.bin');
const iv = fs.readFileSync('encryption_iv.bin');
const encryptedKey = fs.readFileSync('encrypted_api_key.txt', 'utf8');

try {
    const decipher = createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    process.env.REACT_APP_XAI_API_KEY = decrypted;
    console.log('✅ API-Schlüssel erfolgreich entschlüsselt');
} catch (error) {
    console.error('❌ Entschlüsselungsfehler:', error);
    process.exit(1);
}