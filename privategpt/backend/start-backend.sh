#!/bin/bash
# Backend Start Script

set -e

echo "🚀 Dabrock PrivateGPT Backend"
echo "=============================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file nicht gefunden!"
    echo ""
    echo "Bitte erstelle die .env Datei:"
    echo "  cp .env.example .env"
    echo ""
    echo "Dann fülle die API Keys aus!"
    echo "Siehe: ../API_KEYS_SETUP.md"
    exit 1
fi

# Check if venv exists
if [ ! -d venv ]; then
    echo "📦 Erstelle Virtual Environment..."
    python3 -m venv venv
fi

# Activate venv
echo "🔧 Aktiviere Virtual Environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installiere Dependencies..."
pip install --quiet -r requirements.txt

# Start server
echo ""
echo "✅ Backend startet..."
echo ""
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Drücke Ctrl+C zum Beenden"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
