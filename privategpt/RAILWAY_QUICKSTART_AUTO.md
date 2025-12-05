# 🚂 Railway Auto-Deployment - Quick Start

**Semi-Automatisches Deployment mit einem Script!**

---

## ⚡ Quick Start (3 Schritte)

### 1️⃣ Railway Account erstellen (1 Minute)

Gehe zu [railway.app](https://railway.app) und:
- Registriere dich (empfohlen: GitHub OAuth)
- **Upgrade auf Pro Plan** ($20/Monat) - erforderlich für 8GB RAM
- Zahlungsmethode hinterlegen

### 2️⃣ Railway CLI installieren (1 Minute)

**Option A: NPM (empfohlen)**
```bash
npm install -g @railway/cli
```

**Option B: Bash Script**
```bash
bash <(curl -fsSL cli.new)
```

**Option C: Direkt-Download** (falls NPM nicht verfügbar)
```bash
# Linux/WSL
wget https://github.com/railwayapp/cli/releases/latest/download/railway-linux-x64.tar.gz
tar -xzf railway-linux-x64.tar.gz
sudo mv railway /usr/local/bin/
```

Prüfe Installation:
```bash
railway --version
```

### 3️⃣ Auto-Deployment Script ausführen (10 Minuten)

```bash
cd /mnt/e/Project20250615/portfolio-website/michael-homepage/privategpt
./RAILWAY_AUTO_DEPLOY.sh
```

Das Script macht **automatisch**:
- ✅ Railway Login (öffnet Browser)
- ✅ Projekt erstellen
- ✅ PostgreSQL hinzufügen
- ✅ Backend Service erstellen + Environment Variables setzen
- ✅ Frontend Service erstellen + Environment Variables setzen
- ✅ Beide Services deployen
- ✅ URLs automatisch verknüpfen

**Einzige manuelle Aktion**: Volumes hinzufügen (Script pausiert und wartet)

---

## 📋 Was das Script automatisiert

### ✅ Automatisch:
1. Railway Projekt erstellen
2. PostgreSQL Plugin hinzufügen (Datenbank)
3. JWT Secret generieren (sicher)
4. Backend Service erstellen
   - Environment Variables setzen (14 Variables!)
   - Code von GitHub deployen
   - Model Download starten (Qwen2.5-0.5B)
5. Frontend Service erstellen
   - Environment Variables setzen
   - Build + Deployment
6. URLs automatisch verknüpfen
7. Services neu deployen

### ⚠️ Manuell (1x):
- **Persistent Volumes hinzufügen** (Railway Dashboard)
  - `/data` (1GB für ChromaDB)
  - `/app/models` (1GB für Qwen Model)
  - `/app/uploads` (2GB für PDFs)

---

## 🎯 Nach dem Deployment

### Backend Health Check
```bash
# Zeige Backend URL
railway domain --service backend

# Öffne Swagger Docs
https://YOUR-BACKEND.up.railway.app/docs
```

### Frontend Test
```bash
# Zeige Frontend URL
railway domain --service frontend

# Öffne App
https://YOUR-FRONTEND.up.railway.app
```

### Logs überwachen
```bash
# Backend Logs (Model Download)
railway logs --service backend

# Frontend Logs (Build)
railway logs --service frontend
```

Erwarte in Backend Logs:
```
✅ Qwen2.5-0.5B loaded successfully!
```

---

## 🔧 Troubleshooting

### Problem: Railway CLI Login schlägt fehl
```bash
# Token manuell setzen
railway login --browserless
# Folge den Anweisungen (Token von railway.app/account/tokens)
```

### Problem: Model Download Timeout
```bash
# Build Timeout erhöhen
railway settings --build-timeout 30
```

### Problem: Out of Memory beim Model Load
```bash
# Prüfe ob Pro Plan aktiv
railway status

# RAM erhöhen (falls nötig)
# → Railway Dashboard → Settings → Resources
```

### Problem: CORS Errors
```bash
# Prüfe Frontend URL in Backend
railway variables --service backend | grep FRONTEND_URL

# Neu setzen falls falsch
railway variables --set "FRONTEND_URL=https://YOUR-FRONTEND.up.railway.app" --service backend
```

---

## 💰 Kosten

**Monatliche Kosten**: ca. $25-35

- Pro Plan: $20/Monat (Basis)
- PostgreSQL: $5/Monat (512MB)
- Volumes: $1/Monat (4GB total)
- Compute: $5-10/Monat (bei moderater Nutzung)

**Traffic**: 100GB/Monat free, dann $0.10/GB

---

## 🚀 Erweiterte Befehle

### Service Management
```bash
# Alle Services auflisten
railway service list

# Service Details
railway status --service backend

# Logs in Echtzeit
railway logs --service backend --tail
```

### Environment Variables
```bash
# Alle Variables anzeigen
railway variables --service backend

# Variable hinzufügen/ändern
railway variables --set "KEY=VALUE" --service backend

# Variable löschen
railway variables --unset "KEY" --service backend
```

### Redeploy
```bash
# Backend neu deployen
railway up --service backend

# Frontend neu deployen
railway up --service frontend
```

### Domain Management
```bash
# Custom Domain hinzufügen
railway domain add privategpt.dabrock.eu --service frontend

# Domains auflisten
railway domain list
```

---

## 📚 Weitere Ressourcen

- **Vollständige Anleitung**: `RAILWAY_DEPLOYMENT_GUIDE.md`
- **Railway Docs**: https://docs.railway.app
- **Railway CLI Docs**: https://docs.railway.app/develop/cli
- **Railway Discord**: https://discord.gg/railway

---

## ✅ Deployment Checklist

Nach Script-Ausführung:

- [ ] Backend deployed (Logs zeigen Model geladen?)
- [ ] Frontend deployed (App erreichbar?)
- [ ] PostgreSQL verbunden (DATABASE_URL gesetzt?)
- [ ] Volumes konfiguriert (3 Volumes?)
- [ ] Magic-Link Login funktioniert?
- [ ] PDF Upload funktioniert?
- [ ] Chat Antwort kommt (5-15 Sekunden)?
- [ ] Kosten im Dashboard prüfen

---

**🎉 Fertig! Dein PrivateGPT ist jetzt 100% privat und DSGVO-konform auf Railway!**

Bei Fragen oder Problemen: `railway logs` ist dein Freund!
