# 🚀 Deployment Quick Reference

Schnellreferenz für häufige Deployment-Szenarien.

---

## ⚡ Häufigste Commands

```bash
# Vollständiges Deployment
./deploy.sh

# Test ohne Änderungen
./deploy.sh --dry-run

# Hilfe anzeigen
./deploy.sh --help
```

---

## 📋 Häufige Szenarien

### Szenario 1: Kleine Code-Änderung (am häufigsten)

```bash
./deploy.sh
```

**Was passiert:**
- ✅ Build main + PrivateGPT
- ✅ Upload zu Strato (ohne MP3)
- ✅ Git commit + push
- ✅ Railway auto-deploy

**Dauer:** ~2-3 Minuten

---

### Szenario 2: Nur Hauptwebsite geändert

```bash
./deploy.sh --skip-privategpt
```

**Was passiert:**
- ✅ Build main website
- ✅ Upload main zu Strato
- ❌ Kein PrivateGPT
- ✅ Git commit + push

**Dauer:** ~1-2 Minuten

---

### Szenario 3: Schnelles Strato-Update

```bash
./deploy.sh --skip-build --no-github
```

**Was passiert:**
- ❌ Kein Build (verwendet existierende)
- ✅ Upload zu Strato
- ❌ Kein Git/Railway

**Dauer:** ~30-60 Sekunden

---

### Szenario 4: Nur GitHub/Railway Update

```bash
./deploy.sh --no-strato
```

**Was passiert:**
- ✅ Build
- ❌ Kein Strato upload
- ✅ Git commit + push
- ✅ Railway auto-deploy

**Dauer:** ~2 Minuten

---

### Szenario 5: Test vor echtem Deployment

```bash
./deploy.sh --dry-run
```

**Was passiert:**
- 👁️ Zeigt was passieren würde
- ❌ Macht KEINE Änderungen
- ✅ Überprüft Konfiguration

**Dauer:** ~5 Sekunden

---

## 🔧 Optionen Kombinieren

```bash
# Nur main website, kein GitHub
./deploy.sh --skip-privategpt --no-github

# Existierende Builds nutzen, nur Strato
./deploy.sh --skip-build --no-github

# Nur PrivateGPT zu Strato (ungewöhnlich)
# Nicht direkt möglich, manuell:
cd privategpt/frontend && npm run build && cd ../..
./upload-privategpt-to-strato.sh
```

---

## 🐛 Troubleshooting Quick-Fixes

### Problem: "Build failed"

```bash
# Lösung 1: Dependencies neu installieren
npm install
./deploy.sh

# Lösung 2: Manuell bauen
npm run build
# Fehler analysieren, dann:
./deploy.sh --skip-build
```

---

### Problem: "SFTP upload failed"

```bash
# Lösung 1: Credentials prüfen
cat .env.sftp
# Editieren falls falsch:
nano .env.sftp

# Lösung 2: Nur GitHub deployen
./deploy.sh --no-strato
```

---

### Problem: "Git push failed"

```bash
# Lösung 1: Git Status
git status
git pull
./deploy.sh

# Lösung 2: Nur Strato deployen
./deploy.sh --no-github
```

---

## 📊 Check Deployment Status

### Strato

```bash
curl -I https://www.dabrock.eu
curl -I https://www.dabrock.eu/privategpt
```

**Expected:** `HTTP/2 200`

---

### GitHub

```bash
git log -1
git remote show origin
```

---

### Railway

```bash
curl -I https://michael-homepage-production.up.railway.app
```

**Expected:** `HTTP/2 200` (nach 2-5 Min.)

---

## 🔄 Rollback

### Rollback zu vorherigem Commit

```bash
# 1. Git zurücksetzen
git log --oneline -5
git reset --hard HEAD~1

# 2. Re-deployen
./deploy.sh --skip-build

# 3. Force push (VORSICHTIG!)
git push origin main --force
```

---

### Rollback nur Strato (Git bleibt)

```bash
# Alte Version manuell hochladen
# Oder: git checkout alte Version, nur Strato deployen
git checkout <old-commit-hash>
./deploy.sh --no-github
git checkout main
```

---

## 📁 Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `deploy.sh` | Haupt-Deployment-Script |
| `.env.sftp` | Strato SFTP Credentials (NICHT in Git!) |
| `deployment-*.log` | Deployment Logs |
| `DEPLOYMENT_GUIDE.md` | Vollständige Dokumentation |
| `upload-to-strato.sh` | Strato upload (main website) |
| `upload-privategpt-to-strato.sh` | Strato upload (PrivateGPT) |

---

## 🎯 Deployment Checklist

### Vor Deployment:

- [ ] Code-Änderungen getestet lokal (`npm run dev`)
- [ ] Keine Syntax-Fehler
- [ ] `.env.sftp` vorhanden (für Strato)
- [ ] Git Status sauber (`git status`)

### Nach Deployment:

- [ ] Strato: https://www.dabrock.eu lädt
- [ ] PrivateGPT: https://www.dabrock.eu/privategpt lädt
- [ ] Railway: https://michael-homepage-production.up.railway.app lädt
- [ ] Keine Fehler in Browser Console
- [ ] Alle Links funktionieren

---

## ⚙️ Environment Setup

### Einmalig: .env.sftp erstellen

```bash
cat > .env.sftp << 'EOF'
SFTP_HOST=5018735097.ssh.w2.strato.hosting
SFTP_PORT=22
SFTP_USER=su403214
SFTP_PASS=your_password_here
SFTP_REMOTE_PATH=/htdocs/
EOF

chmod 600 .env.sftp
```

---

## 🎓 Beispiel-Workflow

### Typischer Tag:

```bash
# 1. Morgens: Code ändern
nano src/App.jsx

# 2. Lokal testen
npm run dev
# Browser: http://localhost:5173

# 3. Test-Deployment
./deploy.sh --dry-run

# 4. Echt deployen
./deploy.sh

# 5. Verifizieren
curl -I https://www.dabrock.eu

# 6. Logs checken (bei Problemen)
tail -f deployment-*.log | grep ERROR
```

---

## 💡 Pro-Tips

### Tip 1: Alias erstellen

```bash
# In ~/.bashrc oder ~/.zshrc
alias deploy='cd /mnt/e/Project20250615/portfolio-website/michael-homepage && ./deploy.sh'
alias deploy-test='cd /mnt/e/Project20250615/portfolio-website/michael-homepage && ./deploy.sh --dry-run'
alias deploy-quick='cd /mnt/e/Project20250615/portfolio-website/michael-homepage && ./deploy.sh --skip-build'
```

**Dann:**
```bash
deploy          # von überall
deploy-test     # dry-run
deploy-quick    # schnell
```

---

### Tip 2: Watch Logs

```bash
# In separatem Terminal
watch -n 2 'tail -20 deployment-*.log'
```

---

### Tip 3: Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash
npm run build
if [ $? -ne 0 ]; then
    echo "Build failed! Commit aborted."
    exit 1
fi
```

---

## 🔗 Links

- **Live Website:** https://www.dabrock.eu
- **PrivateGPT:** https://www.dabrock.eu/privategpt
- **Railway:** https://michael-homepage-production.up.railway.app
- **GitHub:** https://github.com/md20210/michael-homepage
- **Strato Dashboard:** https://www.strato.de/apps/CustomerService

---

## 📞 Bei Problemen

1. **Check Logs:** `cat deployment-*.log | grep -E "ERROR|FAILED"`
2. **Dry-Run:** `./deploy.sh --dry-run`
3. **Manual Steps:** Siehe `DEPLOYMENT_GUIDE.md`
4. **Help:** `./deploy.sh --help`

---

**Last Updated:** 2025-12-12
