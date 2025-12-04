#!/bin/bash
# Frontend Start Script

set -e

echo "🎨 Dabrock PrivateGPT Frontend"
echo "==============================="
echo ""

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installiere Dependencies..."
    npm install
fi

# Start dev server
echo ""
echo "✅ Frontend startet..."
echo ""
echo "   Frontend: http://localhost:5173"
echo ""
echo "Drücke Ctrl+C zum Beenden"
echo ""

npm run dev
