# Strato Deployment Anleitung

## 📦 Dateien zum Upload

Diese Anleitung beschreibt, wie Sie die Website und das Hörbuch auf Strato hochladen.

---

## 🎯 **WICHTIG: Reihenfolge einhalten!**

### **1️⃣ ZUERST: Build erstellen**

```bash
cd /mnt/e/Project20250615/portfolio-website/michael-homepage

# Production Build erstellen
npm run build

# Der Build wird erstellt in: ./dist/
```

---

### **2️⃣ Hörbuch vorbereiten**

Das Hörbuch ist bereits vorhanden in:
- **Quelle:** `/mnt/e/buch/buch.mp3`
- **Oder:** `/mnt/e/Project20250615/portfolio-website/michael-homepage/public/Michael_Dabrock_Audiobook.mp3`
- **Größe:** 364 MB

**Wichtig:** Das Hörbuch muss separat hochgeladen werden (zu groß für Git).

---

### **3️⃣ Strato FTP/SFTP Upload**

#### **Option A: FileZilla (GUI)**

1. **Verbindung herstellen:**
   - Host: `ftp.dabrock.eu` oder Ihre Strato FTP-Adresse
   - Benutzer: Ihr Strato FTP-Benutzername
   - Passwort: Ihr Strato FTP-Passwort
   - Port: 21 (FTP) oder 22 (SFTP)

2. **Website hochladen:**
   ```
   Lokal: /mnt/e/Project20250615/portfolio-website/michael-homepage/dist/*
   Remote: /www.dabrock.eu/ (oder Ihr Document Root)
   ```
   - Alle Dateien aus `dist/` Ordner hochladen
   - **WICHTIG:** Dateien im Root-Verzeichnis ersetzen, nicht in Unterordner!

3. **Hörbuch hochladen:**
   ```
   Lokal: /mnt/e/buch/buch.mp3
   Remote: /www.dabrock.eu/Michael_Dabrock_Audiobook.mp3
   ```
   - Datei umbenennen zu: `Michael_Dabrock_Audiobook.mp3`
   - Im selben Verzeichnis wie die Website ablegen

#### **Option B: WinSCP (GUI - Windows)**

1. Neues Session erstellen:
   - Protokoll: FTP oder SFTP
   - Hostname: `ftp.dabrock.eu`
   - Username/Password: Ihre Strato-Zugangsdaten

2. Links: Lokaler Pfad → Rechts: Remote Server
3. Drag & Drop:
   - `dist/*` → Remote Root
   - `Michael_Dabrock_Audiobook.mp3` → Remote Root

#### **Option C: Command Line (Linux/WSL)**

```bash
# FTP Upload (lftp)
lftp -u username,password ftp.dabrock.eu
lcd /mnt/e/Project20250615/portfolio-website/michael-homepage/dist
mirror -R ./ /www.dabrock.eu/
put /mnt/e/buch/buch.mp3 -o /www.dabrock.eu/Michael_Dabrock_Audiobook.mp3
bye

# Oder SFTP
sftp username@dabrock.eu
lcd /mnt/e/Project20250615/portfolio-website/michael-homepage/dist
cd /www.dabrock.eu
put -r *
put /mnt/e/buch/buch.mp3 Michael_Dabrock_Audiobook.mp3
exit
```

---

### **4️⃣ Verzeichnisstruktur auf Strato**

Nach dem Upload sollte es so aussehen:

```
/www.dabrock.eu/
├── index.html                          (Haupt-HTML)
├── assets/                             (CSS, JS, Bilder)
│   ├── index-abc123.js
│   ├── index-xyz789.css
│   └── ...
├── Resume_EN.pdf                       (CV Englisch)
├── Resume_DE.pdf                       (CV Deutsch)
├── Resume_ES.pdf                       (CV Spanisch)
├── Michael_Dabrock_Audiobook.mp3       (364 MB Hörbuch)
└── favicon.ico
```

---

## ✅ **5️⃣ Nach dem Upload: Testen**

### **Website:**
- Öffnen Sie: https://www.dabrock.eu
- Testen Sie alle 3 Sprachen (EN/DE/ES)
- Navigation prüfen

### **CV-Downloads:**
- Englisch: https://www.dabrock.eu/Resume_EN.pdf
- Deutsch: https://www.dabrock.eu/Resume_DE.pdf
- Spanisch: https://www.dabrock.eu/Resume_ES.pdf

### **Hörbuch:**
- Link: https://www.dabrock.eu/Michael_Dabrock_Audiobook.mp3
- Klicken Sie auf "Mein Hörbuch" Button
- Datei sollte sich öffnen/downloaden

---

## 🔧 **Troubleshooting**

### **Problem: 404 Fehler bei Hörbuch**

**Lösung:**
1. Prüfen Sie den exakten Dateinamen auf Strato:
   - Muss genau sein: `Michael_Dabrock_Audiobook.mp3`
   - Groß-/Kleinschreibung beachten!

2. Prüfen Sie den Pfad:
   - Datei muss im gleichen Verzeichnis wie `index.html` liegen

3. Dateirechte prüfen (CHMOD):
   - Sollte lesbar sein: `644` oder `755`

### **Problem: CV-Download funktioniert nicht**

**Lösung:**
- Prüfen Sie, ob alle 3 PDF-Dateien hochgeladen wurden
- Dateinamen müssen exakt sein: `Resume_EN.pdf`, `Resume_DE.pdf`, `Resume_ES.pdf`

### **Problem: Website zeigt alte Version**

**Lösung:**
1. Browser-Cache leeren (Strg + F5)
2. Prüfen Sie, ob alle Dateien aus `dist/` hochgeladen wurden
3. Prüfen Sie die `assets/` Ordner-Struktur

---

## 📋 **Deployment Checklist**

Vor jedem Deployment:

- [ ] `npm run build` ausgeführt
- [ ] Build erfolgreich abgeschlossen (keine Fehler)
- [ ] Alle Dateien aus `dist/` hochgeladen
- [ ] Hörbuch hochgeladen und umbenannt
- [ ] Website getestet (alle Sprachen)
- [ ] CV-Downloads getestet (EN/DE/ES)
- [ ] Hörbuch-Button getestet
- [ ] Mobile Ansicht geprüft

---

## 🔄 **Workflow für Updates**

Bei Änderungen an der Website:

```bash
# 1. Änderungen machen (auf dev Branch)
git checkout dev
# ... Änderungen ...

# 2. Testen
npm run dev

# 3. Build erstellen
npm run build

# 4. Zu main mergen
git checkout main
git merge dev

# 5. Zu GitHub pushen
git push origin main

# 6. Railway deployed automatisch

# 7. Strato Upload
# - Upload nur die geänderten Dateien aus dist/
# - Hörbuch muss nur einmal hochgeladen werden
```

---

## 📞 **Strato Support**

Bei Problemen mit FTP/Hosting:

- **Strato Support:** https://www.strato.de/support/
- **FTP-Zugangsdaten:** Über Strato-Kundencenter abrufen
- **Document Root:** Normalerweise `/www.dabrock.eu/` oder `/html/`

---

**Letzte Aktualisierung:** 2025-11-30
**Website:** https://www.dabrock.eu
