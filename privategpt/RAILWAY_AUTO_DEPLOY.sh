#!/bin/bash
# 🚂 Railway Auto-Deployment Script
# Dieses Script automatisiert das Railway Deployment so weit wie möglich

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🚂 Railway Auto-Deployment für PrivateGPT           ║"
echo "║  100% Private AI mit Qwen2.5-0.5B                     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# SCHRITT 1: Railway CLI Installation prüfen
# ============================================================================
echo ""
echo "${YELLOW}📦 SCHRITT 1: Railway CLI Installation${NC}"
echo ""

if ! command -v railway &> /dev/null; then
    echo "${RED}✗ Railway CLI nicht gefunden!${NC}"
    echo ""
    echo "Bitte installiere Railway CLI manuell:"
    echo ""
    echo "  # Option A: NPM (empfohlen)"
    echo "  npm install -g @railway/cli"
    echo ""
    echo "  # Option B: Bash Script"
    echo "  bash <(curl -fsSL cli.new)"
    echo ""
    echo "Dann führe dieses Script erneut aus."
    exit 1
else
    echo "${GREEN}✓ Railway CLI gefunden: $(railway --version)${NC}"
fi

# ============================================================================
# SCHRITT 2: Railway Login
# ============================================================================
echo ""
echo "${YELLOW}📝 SCHRITT 2: Railway Login${NC}"
echo ""

if ! railway whoami &> /dev/null; then
    echo "Bitte logge dich in Railway ein (öffnet Browser):"
    railway login
else
    echo "${GREEN}✓ Bereits eingeloggt: $(railway whoami)${NC}"
fi

# ============================================================================
# SCHRITT 3: Railway Projekt erstellen
# ============================================================================
echo ""
echo "${YELLOW}🏗️  SCHRITT 3: Railway Projekt erstellen${NC}"
echo ""

read -p "Projekt-Name (z.B. 'privategpt-production'): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-privategpt-production}

echo "Erstelle Projekt: $PROJECT_NAME"
railway init --name "$PROJECT_NAME"

# ============================================================================
# SCHRITT 4: PostgreSQL Plugin hinzufügen
# ============================================================================
echo ""
echo "${YELLOW}🗄️  SCHRITT 4: PostgreSQL Datenbank hinzufügen${NC}"
echo ""

railway add --plugin postgresql
echo "${GREEN}✓ PostgreSQL hinzugefügt${NC}"

# ============================================================================
# SCHRITT 5: Environment Variables für Backend
# ============================================================================
echo ""
echo "${YELLOW}⚙️  SCHRITT 5: Backend Environment Variables setzen${NC}"
echo ""

# JWT Secret generieren
JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(64))")
echo "Generierter JWT Secret: $JWT_SECRET"

# Environment Variables setzen
cat <<EOF > /tmp/railway_backend_env.txt
RESEND_API_KEY=re_gR4DbfhT_NTnbMoH8JFApqLhuzW8vG7Ua
JWT_SECRET=$JWT_SECRET
FROM_EMAIL=onboarding@resend.dev
MAGIC_LINK_EXPIRY_MINUTES=15
SESSION_EXPIRY_DAYS=30
LLM_MODEL_PATH=/app/models/qwen2.5-0.5b-instruct-q4_k_m.gguf
LLM_CONTEXT_SIZE=4096
LLM_MAX_TOKENS=512
LLM_TEMPERATURE=0.7
LLM_THREADS=8
CHROMA_DB_PATH=/data/chroma_db
RAILWAY_ENVIRONMENT=production
MAX_FILE_SIZE_MB=10
MAX_FILES_PER_USER=50
EOF

echo "Backend Environment Variables:"
cat /tmp/railway_backend_env.txt

# Backend Service erstellen
echo ""
echo "Erstelle Backend Service..."
railway service create backend --root privategpt/backend

# Environment Variables hochladen
while IFS='=' read -r key value; do
    railway variables --set "$key=$value" --service backend
done < /tmp/railway_backend_env.txt

echo "${GREEN}✓ Backend Environment Variables gesetzt${NC}"

# ============================================================================
# SCHRITT 6: Backend Volumes konfigurieren
# ============================================================================
echo ""
echo "${YELLOW}💾 SCHRITT 6: Backend Persistent Volumes${NC}"
echo ""

echo "${YELLOW}⚠️  MANUELLE AKTION ERFORDERLICH:${NC}"
echo ""
echo "Bitte gehe zu Railway Dashboard und füge folgende Volumes hinzu:"
echo ""
echo "  Service: backend"
echo "  Volume 1: /data          (1GB für ChromaDB)"
echo "  Volume 2: /app/models    (1GB für Qwen2.5-0.5B)"
echo "  Volume 3: /app/uploads   (2GB für PDF Uploads)"
echo ""
read -p "Drücke Enter wenn Volumes hinzugefügt wurden..."

# ============================================================================
# SCHRITT 7: Backend Deployment
# ============================================================================
echo ""
echo "${YELLOW}🚀 SCHRITT 7: Backend Deployment${NC}"
echo ""

railway up --service backend
echo "${GREEN}✓ Backend wird deployed (Model Download dauert ca. 5 Minuten)${NC}"

# Warte auf Deployment
echo "Warte auf Backend Deployment..."
sleep 10

# Hole Backend URL
BACKEND_URL=$(railway domain --service backend)
echo ""
echo "${GREEN}✓ Backend URL: $BACKEND_URL${NC}"

# ============================================================================
# SCHRITT 8: Frontend Service erstellen
# ============================================================================
echo ""
echo "${YELLOW}🎨 SCHRITT 8: Frontend Service${NC}"
echo ""

# Frontend Service erstellen
railway service create frontend --root privategpt/frontend

# Frontend Environment Variables
railway variables --set "VITE_API_URL=https://$BACKEND_URL" --service frontend

echo "${GREEN}✓ Frontend Environment Variables gesetzt${NC}"

# Frontend Deployment
railway up --service frontend
echo "${GREEN}✓ Frontend wird deployed (ca. 1-2 Minuten)${NC}"

# Warte auf Deployment
sleep 10

# Hole Frontend URL
FRONTEND_URL=$(railway domain --service frontend)
echo ""
echo "${GREEN}✓ Frontend URL: $FRONTEND_URL${NC}"

# ============================================================================
# SCHRITT 9: URLs in Backend aktualisieren
# ============================================================================
echo ""
echo "${YELLOW}🔄 SCHRITT 9: Backend URLs aktualisieren${NC}"
echo ""

railway variables --set "FRONTEND_URL=https://$FRONTEND_URL" --service backend
railway variables --set "BACKEND_URL=https://$BACKEND_URL" --service backend

echo "${GREEN}✓ URLs aktualisiert${NC}"

# Backend neu deployen
echo "Deploye Backend neu mit aktualisierten URLs..."
railway up --service backend

# ============================================================================
# FERTIG!
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  🎉 DEPLOYMENT ABGESCHLOSSEN!                         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "${GREEN}✓ Backend URL:  https://$BACKEND_URL${NC}"
echo "${GREEN}✓ Frontend URL: https://$FRONTEND_URL${NC}"
echo ""
echo "📋 Nächste Schritte:"
echo ""
echo "  1. Backend Health Check:"
echo "     → https://$BACKEND_URL/docs"
echo ""
echo "  2. Frontend öffnen:"
echo "     → https://$FRONTEND_URL"
echo ""
echo "  3. Backend Logs prüfen (Model Download):"
echo "     → railway logs --service backend"
echo "     → Erwarte: '✅ Qwen2.5-0.5B loaded successfully!'"
echo ""
echo "  4. Ersten Login testen:"
echo "     → Magic-Link E-Mail sollte ankommen"
echo ""
echo "  5. PDF Upload + Chat testen"
echo ""
echo "💰 Kosten: ca. \$25-35/Monat (Pro Plan + PostgreSQL + Volumes)"
echo ""
echo "📚 Vollständige Dokumentation:"
echo "   → RAILWAY_DEPLOYMENT_GUIDE.md"
echo ""
