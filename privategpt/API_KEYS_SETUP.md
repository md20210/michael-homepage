# 🔑 API Keys Setup

## 1. OpenRouter API Key (DeepSeek-R1)

### So bekommst du den Key:

1. **Gehe zu:** https://openrouter.ai/
2. **Registrieren:** Klick auf "Sign Up" (Google/GitHub Login möglich)
3. **Credits kaufen:**
   - Klick auf dein Profil → "Credits"
   - Minimum: $5 (reicht für 1000+ Anfragen!)
4. **API Key erstellen:**
   - Gehe zu: https://openrouter.ai/keys
   - Klick "Create Key"
   - Gib einen Namen ein: "Dabrock PrivateGPT"
   - **Kopiere den Key!** (Format: `sk-or-v1-...`)

**Wichtig:** Der Key wird nur einmal angezeigt!

---

## 2. Resend API Key (Magic-Link E-Mails)

### So bekommst du den Key:

1. **Gehe zu:** https://resend.com/
2. **Registrieren:** Klick auf "Sign Up"
3. **Domain verifizieren (optional für PoC):**
   - Für Tests: Nutze die Sandbox-Domain (funktioniert nur für deine E-Mail)
   - Für Production: Füge dabrock.eu hinzu
4. **API Key erstellen:**
   - Gehe zu: https://resend.com/api-keys
   - Klick "Create API Key"
   - Name: "Dabrock PrivateGPT"
   - **Kopiere den Key!** (Format: `re_...`)

**Free Tier:** 3000 E-Mails/Monat - perfekt für PoC!

---

## 3. JWT Secret generieren

### Linux/Mac/WSL:
```bash
openssl rand -hex 32
```

### Windows (PowerShell):
```powershell
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Ergebnis:** Ein 64-Zeichen Hex-String (z.B. `a3f5...`)

---

## 4. .env Datei ausfüllen

Öffne `privategpt/backend/.env` und füge ein:

```env
# OpenRouter (DeepSeek-R1)
OPENROUTER_API_KEY=sk-or-v1-DEIN_KEY_HIER

# Resend (E-Mails)
RESEND_API_KEY=re_DEIN_KEY_HIER

# JWT Secret (generiert)
JWT_SECRET=a3f5b8c2d9e4f7a1b6c3d8e5f2a9b4c7...

# URLs (für lokalen Test)
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000

# Database (bleibt so)
DATABASE_URL=sqlite+aiosqlite:///./privategpt.db

# Email Config
FROM_EMAIL=noreply@dabrock.eu
MAGIC_LINK_EXPIRY_MINUTES=15
SESSION_EXPIRY_DAYS=30
```

---

## ✅ Fertig!

Jetzt kannst du das Backend starten:

```bash
cd privategpt/backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn main:app --reload
```

**Test:** Öffne http://localhost:8000 - Du solltest sehen:
```json
{
  "status": "ok",
  "service": "Dabrock PrivateGPT API"
}
```
