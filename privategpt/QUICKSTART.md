# 🚀 Dabrock PrivateGPT - Schnellstart

## ✅ Was wurde erstellt?

Ein vollständiger **Proof-of-Concept** mit:
- ✅ Magic-Link Login (passwortlos)
- ✅ PDF Upload & Verarbeitung
- ✅ RAG-basierter Chat mit DeepSeek
- ✅ Vector-Datenbank (ChromaDB)
- ✅ Moderne React UI
- ✅ DSGVO: "Alle Daten löschen"

**Geschätzte Kosten:** $0-5/Monat 💰

---

## 📋 Voraussetzungen

1. **Python 3.10+** ✅ (du hast 3.12.3)
2. **Node.js 18+**
3. **Ollama** (für lokales LLM)
4. **API Keys:**
   - Resend API Key (nur für Magic-Link E-Mails: https://resend.com/)

---

## 🏃 Start in 3 Schritten

### **Schritt 0: Ollama installieren**

**Siehe:** `OLLAMA_SETUP.md` für detaillierte Anleitung!

**Schnellstart (Linux/WSL):**
```bash
# Ollama installieren
curl -fsSL https://ollama.com/install.sh | sh

# DeepSeek-R1 herunterladen (7B empfohlen)
ollama pull deepseek-r1:7b

# Ollama starten
ollama serve
```

**Windows:** Download von https://ollama.com/download/windows

---

### **Schritt 1: Backend Setup**

```bash
cd privategpt/backend

# Virtual Environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Dependencies installieren
pip install -r requirements.txt

# .env erstellen
cp .env.example .env
# WICHTIG: Fülle die API Keys aus!
```

**Bearbeite `.env`:**
```env
# Resend (nur für E-Mails)
RESEND_API_KEY=re_...

# JWT Secret
JWT_SECRET=$(openssl rand -hex 32)

# Ollama
OLLAMA_BASE_URL=http://localhost:11434

# Email
FROM_EMAIL=noreply@dabrock.eu
```

**Backend starten:**
```bash
uvicorn main:app --reload
```

Backend läuft auf: http://localhost:8000

---

### **Schritt 2: Frontend Setup**

```bash
cd privategpt/frontend

# Dependencies installieren
npm install

# Starten
npm run dev
```

Frontend läuft auf: http://localhost:5173

---

## 🎯 Testen

1. **Öffne:** http://localhost:5173
2. **Login:** Gib deine E-Mail ein
3. **E-Mail:** Klicke auf den Link (prüfe Spam!)
4. **Dashboard:** Upload ein PDF
5. **Chat:** Stelle Fragen zum PDF!

---

## 💰 Kosten: $0!

**Ollama (lokales LLM):**
- ✅ **Komplett kostenlos**
- ✅ Keine API-Keys nötig
- ✅ Alles auf deinem PC

**Resend E-Mail:**
- 3000 E-Mails/Monat: **KOSTENLOS**

**Gesamt PoC:** **$0/Monat** 🎉

---

## 🔧 Troubleshooting

**Backend startet nicht:**
```bash
# Prüfe Python-Version
python --version  # Muss 3.10+ sein

# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

**Frontend Fehler:**
```bash
# Node Version prüfen
node --version  # Sollte 18+ sein

# Clean install
rm -rf node_modules package-lock.json
npm install
```

**ChromaDB Fehler:**
```bash
# Datenbank löschen und neu erstellen
rm -rf chroma_db privategpt.db
# Backend neu starten
```

---

## 📦 Deployment (später)

- **Backend:** Railway, Render, oder Fly.io
- **Frontend:** Strato (statischer Build)
- **Domain:** app.dabrock.eu

Deployment-Anleitung folgt nach erfolgreichem Test!

---

**Viel Erfolg! 🚀**
