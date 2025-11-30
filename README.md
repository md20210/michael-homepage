# michael-homepage

AI Consultant Portfolio with Grok Integration - Michael Dabrock

**Live:** https://www.dabrock.eu
**Railway Backend:** https://michael-homepage-production.up.railway.app
**GitHub:** https://github.com/md20210/michael-homepage

---

## 🏗️ Architektur

```
┌─────────────────────────────────────────────┐
│  dabrock.eu (Strato Domain)                 │
│  ↓ Weiterleitung/Hosting                    │
├─────────────────────────────────────────────┤
│  FRONTEND (Statische Dateien)               │
│  • React App (Vite Build)                   │
│  • Hostet auf: Strato                       │
│  • Build: /dist Ordner                      │
└─────────────────────────────────────────────┘
                    ↓ API Calls
┌─────────────────────────────────────────────┐
│  BACKEND (Railway)                          │
│  • Express Server (server.cjs)              │
│  • API Endpunkte (/api/grok etc.)           │
│  • Auto-Deploy von GitHub main Branch       │
└─────────────────────────────────────────────┘
```

---

## 🚀 Deployment Workflow

### **Branch-Strategie:**

- **`main`** → Production (dabrock.eu + Railway)
- **`dev`** → Development & Testing

### **Lokale Entwicklung:**

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev          # Frontend auf localhost:3000

# Production Build testen
npm run build        # Erstellt /dist Ordner
npm run preview      # Testet Build lokal
```

### **Deployment zu Production:**

#### **Option A: Via Git (Empfohlen)**

```bash
# 1. Änderungen auf dev Branch testen
git checkout dev
# ... Entwicklung ...
npm run build && npm run preview  # Testen!

# 2. Zu main mergen
git checkout main
git merge dev
git push origin main

# 3. Railway deployed automatisch von main
# 4. /dist zu Strato hochladen (FTP/SFTP)
```

#### **Option B: Direktes Deployment**

```bash
# Build erstellen
npm run build

# Frontend: /dist zu Strato hochladen (FTP)
# Backend: Railway pullt automatisch von GitHub
```

---

## 🛡️ Rollback-Strategie

### **Backup-Punkte:**

- **Git Tag:** `v1.0.0-production` (2025-11-30)
- **Physisches Backup:** `/mnt/e/Project20250615/backup/michael-homepage-production-20251130/`

### **Rollback durchführen:**

#### **Option 1: Zu Git-Tag zurück**

```bash
# Zu gesichertem Production-Stand zurück
git checkout v1.0.0-production

# Build erstellen
npm run build

# dist zu Strato hochladen
# Für Railway: Tag als Release deployen
```

#### **Option 2: Backup wiederherstellen**

```bash
# Backup-Ordner: /mnt/e/Project20250615/backup/michael-homepage-production-YYYYMMDD/

# Source Code wiederherstellen
tar -xzf source-backup.tar.gz

# ODER: Production Build direkt wiederherstellen
cp -r dist-backup/* dist/
# → Zu Strato hochladen
```

#### **Option 3: Railway Rollback**

1. Railway Dashboard öffnen: https://railway.app
2. Projekt `michael-homepage-production` auswählen
3. "Deployments" Tab
4. Vorheriges funktionierendes Deployment auswählen → "Redeploy"

---

## 📦 Neue Git Tags erstellen

```bash
# Neuen Production-Stand taggen
git tag -a v1.1.0-production -m "Beschreibung der Änderungen"
git push origin v1.1.0-production

# Alle Tags anzeigen
git tag -l
```

---

## 🔧 Environment Variables

### **Lokal (.env):**

```env
VITE_XAI_API_KEY=your_api_key_here
XAI_API_KEY=your_api_key_here
NODE_ENV=development
```

### **Railway (Production):**

- `NODE_ENV=production`
- `VITE_XAI_API_KEY` (in Railway Dashboard setzen)
- `XAI_API_KEY` (in Railway Dashboard setzen)

⚠️ **Wichtig:** `.env` ist in `.gitignore` und wird NICHT committed!

---

## 📝 Build-Konfiguration

### **Vite (Frontend):**

- **Output:** `/dist`
- **Base Path:** `./` (für Strato)
- **Config:** `vite.config.js`

### **Express Server (Backend):**

- **Port:** `process.env.PORT || 3000`
- **Static Files:** Serviert `/dist` Ordner
- **Start Command:** `node server.cjs`

---

## 🔐 Sicherheit

- ✅ `.env` nicht in Git
- ✅ `node_modules` nicht in Git
- ✅ API Keys nur in Railway Environment Variables
- ✅ `.gitignore` konfiguriert

---

## 🆘 Troubleshooting

### **Build schlägt fehl:**

```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Railway Deployment fehlgeschlagen:**

1. Railway Logs prüfen
2. Environment Variables checken
3. Bei Bedarf zu vorherigem Deployment zurück

### **Website zeigt alte Version:**

1. Browser Cache leeren (Strg+F5)
2. Strato: Prüfen ob neuester /dist hochgeladen wurde
3. Railway: Neuestes Deployment checken

---

## 📚 Nützliche Commands

```bash
# Status prüfen
git status
git log --oneline -10

# Branches
git branch -a                    # Alle Branches anzeigen
git checkout dev                 # Zu dev Branch wechseln
git checkout main                # Zu main Branch wechseln

# Deployment vorbereiten
npm run build                    # Production Build
npm run preview                  # Build lokal testen

# Railway Status (gh CLI)
gh repo view                     # Repo Info
```

---

## 📞 Support

- **GitHub Issues:** https://github.com/md20210/michael-homepage/issues
- **Railway Dashboard:** https://railway.app
- **Strato Support:** https://www.strato.de

---

## 📄 License

MIT © Michael Dabrock

---

**Letzte Aktualisierung:** 2025-11-30
**Version:** 1.0.0
