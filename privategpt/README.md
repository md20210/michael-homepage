# Dabrock PrivateGPT - Proof of Concept

**🎯 Mission:** DSGVO-konforme KI-Assistenten mit eigenen Dokumenten

**💰 Kosten:** $0 (Lokales LLM mit Ollama - komplett kostenlos!)

---

## 🏗️ Architektur

- **Frontend:** React + Vite → Statisch auf Strato
- **Backend:** FastAPI → Lokal/Railway
- **URL:** app.dabrock.eu (später - Subdomain)
- **LLM:** Ollama + DeepSeek-R1 (lokal, $0 Kosten!)
- **Vector DB:** ChromaDB (lokal)
- **Auth:** Magic-Link via Resend
- **Storage:** SQLite + lokales Filesystem

---

## 📦 Features (PoC)

✅ Magic-Link Login (passwortlos)
✅ PDF Upload & Text-Extraktion
✅ RAG-basierter Chat
✅ Pro User ein Assistant
✅ Chat-Historie
✅ "Alle Daten löschen" Button

---

## 🚀 Schnellstart

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Umgebungsvariablen

Erstelle `backend/.env`:
```env
# OpenRouter API
OPENROUTER_API_KEY=your_key_here

# Resend (Magic-Link E-Mails)
RESEND_API_KEY=your_key_here

# JWT Secret (generiere mit: openssl rand -hex 32)
JWT_SECRET=your_secret_here

# App Config
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

---

## 📝 Deployment

- **Frontend:** Wird als statische Seite auf Strato hochgeladen
- **Backend:** Railway (Free Tier für PoC)
- **Domain:** app.dabrock.eu → CNAME zu Railway

---

**Entwickelt mit ❤️ von Claude Code**
