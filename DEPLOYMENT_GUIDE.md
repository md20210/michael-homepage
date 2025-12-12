# 🚀 Deployment Guide

Vollständige Anleitung für das Deployment der Michael Dabrock Portfolio Website.

---

## Schnellstart

```bash
# Vollständiges Deployment (Strato + GitHub + Railway)
./deploy.sh

# Dry-Run (zeigt was passieren würde, ohne Änderungen)
./deploy.sh --dry-run

# Hilfe anzeigen
./deploy.sh --help
```

---

## 📋 Voraussetzungen

### Erforderlich

1. **Node.js & npm** - Für Build-Prozess
2. **Git** - Für GitHub-Deployment
3. **curl** - Für SFTP-Uploads
4. **SFTP-Zugangsdaten** - Datei `.env.sftp` im Root-Verzeichnis

### .env.sftp Format

```bash
SFTP_HOST=5018735097.ssh.w2.strato.hosting
SFTP_PORT=22
SFTP_USER=su403214
SFTP_PASS=your_password_here
SFTP_REMOTE_PATH=/htdocs/
```

**WICHTIG:** Diese Datei ist in `.gitignore` und wird NICHT zu Git committed!

---

## 🎯 Deployment-Optionen

### Standard-Deployment (Alles)

MDA: In der Powershell einfach nur bash ./deploy.sh 
```bash
./deploy.sh
```

**Führt aus:**
- ✅ Build main website
- ✅ Build PrivateGPT frontend
- ✅ Upload zu Strato (beide Projekte)
- ✅ Git commit & push zu GitHub
- ✅ Railway deployed automatisch
- ✅ Verifikation aller Deployments

---

### Dry-Run (Test-Modus)

```bash
./deploy.sh --dry-run
```

**Zeigt was passieren würde, OHNE:**
- Build zu erstellen
- Dateien hochzuladen
- Git commits zu machen

**Nützlich für:**
- Testen des Scripts
- Überprüfung der Konfiguration
- Debugging

---

### Nur Strato (ohne GitHub)

```bash
./deploy.sh --no-github
```

**Führt aus:**
- ✅ Build
- ✅ Upload zu Strato
- ❌ Kein Git commit/push
- ❌ Kein Railway deployment

**Verwenden wenn:**
- Du nur die Strato-Version aktualisieren möchtest
- GitHub bereits auf dem aktuellen Stand ist

---

### Nur GitHub/Railway (ohne Strato)

```bash
./deploy.sh --no-strato
```

**Führt aus:**
- ✅ Build
- ✅ Git commit & push
- ✅ Railway auto-deploy
- ❌ Kein Strato upload

**Verwenden wenn:**
- Du nur GitHub/Railway aktualisieren möchtest
- Strato bereits aktuell ist

---

### Quick Update (ohne neu bauen)

```bash
./deploy.sh --skip-build
```

**Führt aus:**
- ❌ Kein Build
- ✅ Upload existierender Builds
- ✅ Git commit & push

**Verwenden wenn:**
- Builds bereits existieren
- Du nur schnell hochladen möchtest
- Keine Code-Änderungen gemacht wurden

---

### Ohne PrivateGPT

```bash
./deploy.sh --skip-privategpt
```

**Führt aus:**
- ✅ Main website Build & Upload
- ❌ Kein PrivateGPT Build/Upload

**Verwenden wenn:**
- Du nur die Hauptwebsite aktualisieren möchtest
- PrivateGPT nicht geändert wurde

---

### Ohne Audio-Dateien

```bash
./deploy.sh --skip-audio
```

**Führt aus:**
- Alles normal
- ❌ MP3-Dateien werden NICHT hochgeladen

**Verwenden wenn:**
- Hörbuch bereits auf Strato ist
- Nur Code-Updates gemacht wurden
- Schnelleres Upload gewünscht

---

## 🔄 Typische Workflows

### Workflow 1: Kleine Code-Änderung

```bash
# 1. Code ändern
nano src/App.jsx

# 2. Dry-run testen
./deploy.sh --dry-run

# 3. Vollständig deployen
./deploy.sh
```

---

### Workflow 2: Nur PrivateGPT Update

```bash
# 1. PrivateGPT Code ändern
cd privategpt/frontend
nano src/App.jsx
cd ../..

# 2. Deployen (Hauptwebsite wird übersprungen wenn keine Änderungen)
./deploy.sh
```

---

### Workflow 3: Schnelles Strato-Update

```bash
# Builds existieren bereits, nur hochladen
./deploy.sh --skip-build --no-github
```

---

### Workflow 4: Nur GitHub/Railway Update

```bash
# Nur zu GitHub pushen (Strato bleibt unverändert)
./deploy.sh --no-strato
```

---

## 📊 Was das Script macht

### Phase 1: Pre-flight Checks ✈️

- Überprüft ob `npm`, `git`, `curl` installiert sind
- Überprüft ob `.env.sftp` existiert (wenn Strato-Deploy)
- Zeigt alle Konfigurationsoptionen an

### Phase 2: Build 🔨

**Main Website:**
```bash
npm run build
# → dist/ Ordner erstellt
```

**PrivateGPT:**
```bash
cd privategpt/frontend
npm run build
# → dist/ Ordner erstellt
cd ../..
```

### Phase 3: Upload zu Strato 📤

**Main Website:**
- Verwendet `upload-to-strato.sh`
- Lädt alle Dateien aus `dist/` hoch
- Optional: `--skip-audio` überspringt MP3-Dateien

**PrivateGPT:**
- Lädt Dateien zu `/htdocs/privategpt/`
- Inkludiert: HTML, CSS, JS, Assets

### Phase 4: GitHub Deployment 🐙

```bash
git add .
git commit -m "Deployment update..."
git push origin main
```

**Railway** deployed automatisch nach GitHub-Push!

### Phase 5: Verifikation ✅

**Überprüft:**
- ✅ Strato URLs (200 OK Response)
- ✅ Git Push (Remote Commit = Local Commit)
- ✅ Railway (Erreichbarkeit)

---

## 📁 Log-Dateien

Jedes Deployment erstellt eine Log-Datei:

```
deployment-20251212-143022.log
```

**Format:** `deployment-YYYYMMDD-HHMMSS.log`

**Enthält:**
- Alle Build-Outputs
- Upload-Status
- Git-Commands
- Fehler und Warnungen

**Verwenden für:**
- Debugging bei Fehlern
- Überprüfung was deployed wurde
- Audit-Trail

---

## ⚠️ Fehlerbehandlung

### Das Script zählt:

- **Errors** ❌ - Kritische Fehler
- **Warnings** ⚠️ - Nicht-kritische Probleme

### Bei Errors:

Das Script:
1. Zeigt Fehlermeldung an
2. Logged Details in Log-Datei
3. Beendet sich mit Exit-Code 1
4. Zeigt Summary mit Fehleranzahl

### Typische Fehler:

**Build-Fehler:**
```bash
❌ ERROR: Main website build failed (check deployment-*.log)
```

**Lösung:** Überprüfe `package.json` und Dependencies

---

**SFTP-Fehler:**
```bash
❌ ERROR: .env.sftp not found
```

**Lösung:** Erstelle `.env.sftp` mit Zugangsdaten

---

**Git-Fehler:**
```bash
❌ ERROR: Failed to push to GitHub
```

**Lösung:**
- Überprüfe GitHub-Zugangsdaten
- `git status` überprüfen
- Manuell `git push` versuchen

---

## 🔒 Sicherheit

### ✅ Sichere Praktiken:

1. **`.env.sftp` in `.gitignore`** - Credentials nie in Git
2. **SSH-Keys für GitHub** - Keine Passwörter im Script
3. **SFTP statt FTP** - Verschlüsselte Übertragung
4. **Logs prüfen** - Keine Secrets in Logs

### ⚠️ Wichtig:

- **NIEMALS** `.env.sftp` zu Git committen!
- **NIEMALS** Passwörter hardcoden!
- **IMMER** Logs überprüfen vor dem Teilen

---

## 🌐 Deployment-Targets

### 1. Strato (Production)

**URL:** https://www.dabrock.eu

**Pfade:**
- Main: `/htdocs/`
- PrivateGPT: `/htdocs/privategpt/`

**Protokoll:** SFTP

**Zugang:** Via `.env.sftp`

---

### 2. GitHub

**Repository:** https://github.com/md20210/michael-homepage

**Branch:** `main`

**Auto-Deploy:** Railway überwacht `main` Branch

---

### 3. Railway (Staging/Production)

**URL:** https://michael-homepage-production.up.railway.app

**Deploy-Trigger:** Git push zu `main`

**Build:** Dockerfile + railway.toml

**Auto-Deploy:** Ja (2-5 Minuten nach Push)

---

## 🧪 Testing

### Nach jedem Deployment testen:

#### Main Website:
```bash
# Homepage
curl -I https://www.dabrock.eu
# Sollte: 200 OK

# CV Downloads
curl -I https://www.dabrock.eu/Resume_EN.pdf
curl -I https://www.dabrock.eu/Resume_DE.pdf
curl -I https://www.dabrock.eu/Resume_ES.pdf
# Alle sollten: 200 OK
```

#### PrivateGPT:
```bash
curl -I https://www.dabrock.eu/privategpt
# Sollte: 200 OK
```

#### Railway:
```bash
curl -I https://michael-homepage-production.up.railway.app
# Sollte: 200 OK
```

---

## 🐛 Troubleshooting

### Problem: Build schlägt fehl

**Symptom:**
```
❌ ERROR: Main website build failed
```

**Debug-Steps:**
1. Überprüfe Log-Datei: `cat deployment-*.log`
2. Manuell bauen: `npm run build`
3. Dependencies prüfen: `npm install`
4. Node-Version: `node --version` (sollte ≥ 18)

---

### Problem: SFTP Upload schlägt fehl

**Symptom:**
```
❌ ERROR: Failed to upload: index.html
```

**Debug-Steps:**
1. Überprüfe `.env.sftp` Credentials
2. Test-Verbindung:
   ```bash
   curl -v "sftp://HOST/" --user "USER:PASS" -k
   ```
3. Firewall/VPN prüfen
4. Strato-Status überprüfen

---

### Problem: Git Push schlägt fehl

**Symptom:**
```
❌ ERROR: Failed to push to GitHub
```

**Debug-Steps:**
1. SSH-Keys prüfen: `ssh -T git@github.com`
2. Git remote: `git remote -v`
3. Manuell pushen: `git push origin main -v`
4. Branch status: `git status`

---

### Problem: Railway deployed nicht

**Symptom:**
```
⚠️ WARNING: Railway deployment not yet accessible
```

**Das ist normal!** Railway braucht 2-5 Minuten.

**Debug-Steps:**
1. Warte 5 Minuten
2. Überprüfe GitHub Actions
3. Railway Dashboard öffnen
4. Logs checken: `railway logs` (wenn CLI linked)

---

## 📚 Weiterführende Dokumentation

- **Strato Upload:** `STRATO_UPLOAD.md`
- **PrivateGPT:** `privategpt/README.md`
- **Railway:** `privategpt/RAILWAY_DEPLOYMENT_GUIDE.md`
- **Git Workflow:** `README.md`

---

## 🎓 Beispiele

### Beispiel 1: First-Time Full Deployment

```bash
# 1. Erstelle .env.sftp
cat > .env.sftp << 'EOF'
SFTP_HOST=5018735097.ssh.w2.strato.hosting
SFTP_PORT=22
SFTP_USER=su403214
SFTP_PASS=your_password
SFTP_REMOTE_PATH=/htdocs/
EOF

# 2. Dry-Run Test
./deploy.sh --dry-run

# 3. Vollständiges Deployment
./deploy.sh

# 4. Überprüfe Logs
cat deployment-*.log | grep -E "ERROR|WARNING"

# 5. Teste URLs
curl -I https://www.dabrock.eu
curl -I https://www.dabrock.eu/privategpt
```

---

### Beispiel 2: Quick Update nach Code-Änderung

```bash
# Code geändert in src/App.jsx

# Option A: Vollständig
./deploy.sh

# Option B: Nur Strato (schneller)
./deploy.sh --no-github

# Option C: Nur GitHub/Railway
./deploy.sh --no-strato
```

---

### Beispiel 3: Rollback bei Fehler

```bash
# Deployment schlägt fehl
./deploy.sh
# ❌ ERROR: Build failed

# Rollback Git
git reset --hard HEAD~1

# Vorherige Version deployen
./deploy.sh --skip-build
```

---

## ✨ Features des Scripts

### ✅ Automatisierung

- Baut beide Projekte
- Lädt zu Strato hoch
- Pusht zu GitHub
- Verifiziert Deployments

### ✅ Sicherheit

- Keine Credentials im Code
- Confirmation Prompts
- Dry-Run Modus
- Ausführliche Logs

### ✅ Fehlerbehandlung

- Exit on Error
- Error Counter
- Warning Counter
- Detaillierte Fehler-Messages

### ✅ Flexibilität

- Viele Optionen
- Kombinierbar
- Konfigurierbar
- Erweiterbar

### ✅ User-Friendly

- Farbige Output
- Emojis für Status
- Progress-Anzeigen
- Hilfe-Funktion

---

## 🔧 Anpassungen

Das Script kann erweitert werden:

### Neue Deployment-Targets hinzufügen:

```bash
# Beispiel: AWS S3
deploy_to_s3() {
    section "Uploading to AWS S3"
    aws s3 sync dist/ s3://my-bucket/
    success "Uploaded to S3"
}
```

### Neue Checks hinzufügen:

```bash
# Beispiel: Lighthouse Score
check_lighthouse() {
    section "Running Lighthouse"
    lighthouse https://www.dabrock.eu --output=json
}
```

### Notifications hinzufügen:

```bash
# Beispiel: Slack Notification
notify_slack() {
    curl -X POST \
        -H 'Content-type: application/json' \
        --data '{"text":"Deployment completed!"}' \
        $SLACK_WEBHOOK_URL
}
```

---

## 📞 Support

Bei Problemen:

1. **Check Logs:** `deployment-*.log`
2. **Dry-Run:** `./deploy.sh --dry-run`
3. **Hilfe:** `./deploy.sh --help`
4. **GitHub Issues:** https://github.com/md20210/michael-homepage/issues

---

**Last Updated:** 2025-12-12

**Version:** 1.0.0

**Author:** Claude Code with Michael Dabrock
