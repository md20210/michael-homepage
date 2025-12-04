# PrivateGPT - Schnellstart

## 🚀 Alles mit einem Befehl starten

```bash
cd /mnt/e/Project20250615/portfolio-website/michael-homepage/privategpt && ./start-all.sh
```

## 📋 Manuell starten (falls Skript nicht funktioniert)

### 1. Ollama starten (WSL) - mit korrektem Host für Windows-Zugriff
```bash
OLLAMA_HOST=0.0.0.0:11434 ~/.local/bin/ollama serve &
```

### 2. Backend starten (Python/FastAPI)
```bash
cd /mnt/e/Project20250615/portfolio-website/michael-homepage/privategpt/backend
cmd.exe /c "venv\\Scripts\\python.exe -m uvicorn main:app --reload"
```

### 3. Frontend starten (React/Vite)
```bash
cd /mnt/e/Project20250615/portfolio-website/michael-homepage/privategpt/frontend
npm run dev
```

## 🌐 URLs

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000
- **Backend API Docs:** http://localhost:8000/docs
- **Ollama:** http://localhost:11434

## ⚠️ Bekannte Probleme

### WSL Ollama ↔ Windows Backend Kommunikation

**Problem:** Das Backend (läuft in Windows) kann nicht auf Ollama (läuft in WSL) zugreifen.

**Fehlermeldung:** `Client error '404 Not Found' for url 'http://localhost:11434/api/generate'`

**Lösung 1 - Ollama in Windows installieren (EMPFOHLEN):**
1. Download: https://ollama.com/download/windows
2. Installiere Ollama für Windows
3. Öffne PowerShell: `ollama pull deepseek-r1:7b`
4. Starte: `ollama serve`
5. Fertig - keine WSL/Windows Probleme mehr!

**Lösung 2 - WSL IP-Adresse verwenden:**
1. Finde WSL IP: `ip addr show eth0 | grep inet`
2. Bearbeite `backend/.env`:
   ```
   OLLAMA_BASE_URL=http://<WSL-IP>:11434
   ```
3. Starte Ollama in WSL: `OLLAMA_HOST=0.0.0.0:11434 ~/.local/bin/ollama serve`

## 📦 Dependencies installieren (falls nötig)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

## 🔑 API Keys einrichten

Bearbeite `backend/.env`:
```env
RESEND_API_KEY=re_gR4DbfhT_NTnbMoH8JFApqLhuzW8vG7Ua
OLLAMA_BASE_URL=http://localhost:11434
JWT_SECRET=a3f5b8c2d9e4f7a1b6c3d8e5f2a9b4c7e1f6a3b8c5d2e9f4a7b2c9d6e3f8a1b4
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
DATABASE_URL=sqlite+aiosqlite:///./privategpt.db
FROM_EMAIL=onboarding@resend.dev
```

## 📚 Weitere Dokumentation

- `QUICKSTART.md` - Detaillierte Setup-Anleitung
- `OLLAMA_SETUP.md` - Ollama Installation & Konfiguration
- `API_KEYS_SETUP.md` - API Keys einrichten
- `STATUS.md` - Aktueller Projekt-Status
