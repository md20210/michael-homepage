# PrivateGPT - Projekt Status

**Letzte Aktualisierung:** 4. Dezember 2025, 18:40 Uhr

## ✅ Was funktioniert

### Backend (FastAPI)
- [x] Server läuft auf http://localhost:8000
- [x] Magic-Link Authentication (Resend API)
- [x] Email-Versand funktioniert (onboarding@resend.dev)
- [x] SQLite Datenbank eingerichtet
- [x] PDF Upload & Verarbeitung (PyPDF2)
- [x] ChromaDB Vektor-Datenbank
- [x] User-Management & Sessions
- [x] API Endpoints für Chat, Dokumente, etc.

### Frontend (React + Vite)
- [x] Server läuft auf http://localhost:5173
- [x] Login-Seite mit Magic-Link
- [x] Dashboard mit Chat-Interface
- [x] PDF Upload (nur PDFs, keine Text-Dateien)
- [x] Chat-Historie wird angezeigt
- [x] "Alle Daten löschen" Button

### Ollama + LLM
- [x] Ollama installiert in WSL (`~/.local/bin/ollama`)
- [x] DeepSeek-R1 7B Modell heruntergeladen (4.7 GB)
- [x] Modell funktioniert (getestet mit curl)
- [x] Server läuft auf http://localhost:11434

### Datenbank
- [x] SQLite Datenbank erstellt (`privategpt.db`)
- [x] User "michael.dabrock@gmx.es" angelegt
- [x] Assistant erstellt (ID: 1)
- [x] PDF hochgeladen: "Michael Dabrock.pdf" (93 KB)
- [x] PDF verarbeitet in 5 Chunks

## ⚠️ Offene Probleme

### 1. ✅ WSL ↔ Windows Netzwerk-Problem (GELÖST!)

**Problem:**
Das Backend (Windows) konnte nicht auf Ollama (WSL) zugreifen.

**Symptom:**
```
Fehler bei der LLM-Anfrage: Client error '404 Not Found' for url 'http://localhost:11434/api/generate'
```

**Ursache:**
- Backend läuft in Windows (Python über cmd.exe)
- Ollama lief in WSL nur auf 127.0.0.1:11434
- `localhost` in Windows zeigt nicht auf WSL

**Lösung (implementiert):**
→ WSL IP-Adresse verwenden + Ollama auf allen Interfaces lauschen lassen

**Konkrete Schritte:**
1. Ollama mit `OLLAMA_HOST=0.0.0.0:11434` gestartet (lauscht auf allen Interfaces)
2. WSL IP-Adresse ermittelt: `172.26.89.94`
3. `backend/.env` aktualisiert: `OLLAMA_BASE_URL=http://172.26.89.94:11434`
4. Backend neugestartet

**Status:** ✅ Windows kann jetzt Ollama in WSL erreichen!

### 2. Kleine Bugs

- [ ] Upload-Button war anfangs nicht sichtbar (erschien dann plötzlich)
- [ ] Nur PDFs werden akzeptiert (keine .txt Dateien)

## 🔧 Konfiguration

### Backend Config (`backend/config.py`)
- **LLM Modell:** `deepseek-r1:7b` ✅ (korrigiert von 1.5b)
- **Ollama URL:** `http://localhost:11434`
- **Frontend URL:** `http://localhost:5173`

### Environment Variables (`backend/.env`)
```env
RESEND_API_KEY=re_gR4DbfhT_NTnbMoH8JFApqLhuzW8vG7Ua
OLLAMA_BASE_URL=http://localhost:11434
FROM_EMAIL=onboarding@resend.dev
```

## 📊 Installierte Komponenten

### Python Packages (backend/requirements.txt)
- fastapi==0.109.0
- uvicorn[standard]==0.27.0
- sqlalchemy==2.0.25
- chromadb>=0.5.0
- PyPDF2==3.0.1
- langchain==0.1.6
- resend==0.7.0
- httpx==0.27.0

### Node Packages (frontend/package.json)
- react 19.2.0
- vite 5.0.0 (downgraded von 7 wegen Node 18)
- axios 1.6.5
- react-router-dom 6.21.1

### System
- **Python:** 3.12.3
- **Node.js:** 18.19.1
- **Ollama:** 0.13.1
- **OS:** Windows 11 + WSL2 (Ubuntu)

## 🎯 Nächste Schritte

### Sofort (zum Testen)
1. Ollama in Windows installieren
2. `ollama pull deepseek-r1:7b` ausführen
3. Backend & Frontend neu starten
4. Chat mit PDF testen

### Mittelfristig
1. RAG-Engine testen mit verschiedenen PDFs
2. Performance optimieren (aktuell ~24 Sekunden pro Antwort)
3. UI/UX Verbesserungen
4. Fehlerbehandlung verbessern

### Langfristig (Deployment)
1. Frontend bauen und auf Strato deployen
2. Backend auf Railway deployen
3. Domain app.dabrock.eu einrichten
4. Produktions-Datenbank (PostgreSQL?)
5. HTTPS & Security Hardening

## 💰 Kosten

**Aktuell:** $0/Monat ✅
- Ollama: Lokal, kostenlos
- Resend: 3000 E-Mails/Monat gratis (aktuell ~10 verwendet)
- ChromaDB: Lokal, kostenlos

**Nach Deployment:**
- Frontend (Strato): Bereits bezahlt
- Backend (Railway): $0-5/Monat (Free Tier für PoC)

## 🔗 Links

- **Github Repo:** https://github.com/md20210/michael-homepage
- **Letzter Commit:** a95fe7b "PrivateGPT PoC - Funktionierende Version mit lokalem LLM"
- **Ollama Download:** https://ollama.com/download/windows
- **Resend Dashboard:** https://resend.com/
