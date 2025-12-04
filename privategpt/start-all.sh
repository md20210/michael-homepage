#!/bin/bash

# PrivateGPT - Alles starten
# Verwendung: ./start-all.sh

echo "🚀 PrivateGPT wird gestartet..."
echo ""

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Ollama starten
echo -e "${YELLOW}[1/3]${NC} Starte Ollama Server..."
if pgrep -x "ollama" > /dev/null; then
    echo -e "${GREEN}✓${NC} Ollama läuft bereits"
else
    ~/.local/bin/ollama serve > /dev/null 2>&1 &
    sleep 3
    if pgrep -x "ollama" > /dev/null; then
        echo -e "${GREEN}✓${NC} Ollama gestartet auf http://localhost:11434"
    else
        echo -e "${RED}✗${NC} Ollama konnte nicht gestartet werden!"
        echo "   Versuche manuell: ~/.local/bin/ollama serve"
    fi
fi

# 2. Backend starten
echo -e "${YELLOW}[2/3]${NC} Starte Backend (FastAPI)..."
cd /mnt/e/Project20250615/portfolio-website/michael-homepage/privategpt/backend
if [ ! -d "venv" ]; then
    echo -e "${RED}✗${NC} Virtual Environment nicht gefunden!"
    echo "   Führe aus: python -m venv venv && venv\\Scripts\\python.exe -m pip install -r requirements.txt"
    exit 1
fi

# Backend im Hintergrund starten
cmd.exe /c "venv\\Scripts\\python.exe -m uvicorn main:app --reload" > backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

if curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend gestartet auf http://localhost:8000 (PID: $BACKEND_PID)"
else
    echo -e "${RED}✗${NC} Backend konnte nicht gestartet werden!"
    echo "   Prüfe backend.log für Details"
fi

# 3. Frontend starten
echo -e "${YELLOW}[3/3]${NC} Starte Frontend (React + Vite)..."
cd /mnt/e/Project20250615/portfolio-website/michael-homepage/privategpt/frontend
if [ ! -d "node_modules" ]; then
    echo -e "${RED}✗${NC} Node modules nicht gefunden!"
    echo "   Führe aus: npm install"
    exit 1
fi

echo ""
echo -e "${GREEN}✓${NC} Alle Services gestartet!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}📱 Frontend:${NC}       http://localhost:5173"
echo -e "${GREEN}🔧 Backend API:${NC}    http://localhost:8000"
echo -e "${GREEN}📚 API Docs:${NC}       http://localhost:8000/docs"
echo -e "${GREEN}🤖 Ollama:${NC}         http://localhost:11434"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}ℹ️  Info:${NC} Frontend läuft im Vordergrund."
echo "   Drücke Ctrl+C zum Beenden."
echo ""

# Frontend im Vordergrund starten (damit User Output sieht)
npm run dev

# Cleanup wenn Frontend beendet wird
echo ""
echo "Räume auf..."
kill $BACKEND_PID 2>/dev/null
pkill -f "ollama serve" 2>/dev/null
echo "Fertig!"
