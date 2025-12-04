# 🦙 Ollama Setup - Lokales LLM (DeepSeek-R1)

## ✅ Was ist Ollama?

Ollama ist ein Tool, um **große Sprachmodelle (LLMs) lokal** auf deinem PC zu betreiben - **komplett kostenlos**, ohne API-Kosten!

**Vorteile:**
- ✅ **$0 Kosten** - Kein API-Key nötig
- ✅ **100% Privat** - Alles bleibt auf deinem PC
- ✅ **Schnell** - Bei guter Hardware sehr performant
- ✅ **Offline** - Funktioniert ohne Internet

---

## 📦 Installation

### **Linux/WSL (Ubuntu):**

```bash
# Ollama installieren
curl -fsSL https://ollama.com/install.sh | sh

# Prüfen ob installiert
ollama --version
```

### **Windows:**

1. Download: https://ollama.com/download/windows
2. Installer ausführen
3. Ollama startet automatisch im Hintergrund

### **macOS:**

```bash
# Mit Homebrew
brew install ollama

# Oder Download: https://ollama.com/download/mac
```

---

## 🚀 DeepSeek-R1 Modell herunterladen

Ollama unterstützt verschiedene Modellgrößen. Wähle je nach Hardware:

### **Option 1: Kleines Modell (1.5B) - Für Tests/schwache Hardware**
```bash
ollama pull deepseek-r1:1.5b
```
- **Größe:** ~1 GB
- **RAM:** 4 GB
- **Geschwindigkeit:** Sehr schnell
- **Qualität:** Gut für einfache Fragen

### **Option 2: Mittleres Modell (7B) - Empfohlen**
```bash
ollama pull deepseek-r1:7b
```
- **Größe:** ~4.5 GB
- **RAM:** 8 GB
- **Geschwindigkeit:** Schnell
- **Qualität:** Sehr gut

### **Option 3: Großes Modell (14B) - Beste Qualität**
```bash
ollama pull deepseek-r1:14b
```
- **Größe:** ~9 GB
- **RAM:** 16 GB
- **Geschwindigkeit:** Mittel
- **Qualität:** Exzellent

### **Option 4: Sehr großes Modell (70B) - Nur für Power-Hardware**
```bash
ollama pull deepseek-r1:70b
```
- **Größe:** ~40 GB
- **RAM:** 32+ GB oder GPU
- **Qualität:** Beste Ergebnisse

---

## ⚙️ Ollama starten

### **Linux/macOS/WSL:**
```bash
# Ollama Server starten
ollama serve
```

**Läuft auf:** http://localhost:11434

### **Windows:**
Ollama läuft automatisch im Hintergrund nach Installation.

**Prüfen:**
```powershell
# PowerShell
curl http://localhost:11434
```

Ergebnis sollte sein: `Ollama is running`

---

## 🧪 Testen

```bash
# Einfacher Test
ollama run deepseek-r1:1.5b "Hallo, wer bist du?"

# Mit Dokument-Kontext
ollama run deepseek-r1:1.5b "Erkläre mir maschinelles Lernen in 3 Sätzen"
```

---

## 🔧 PrivateGPT Backend konfigurieren

Öffne `backend/.env` und setze:

```env
# Ollama Config
OLLAMA_BASE_URL=http://localhost:11434

# Welches Modell?
# Für Tests: deepseek-r1:1.5b
# Empfohlen: deepseek-r1:7b
# Beste Qualität: deepseek-r1:14b
```

In `backend/config.py` kannst du das Modell ändern:
```python
llm_model: str = "deepseek-r1:7b"  # Ändere hier!
```

---

## 💡 Performance-Tipps

### **GPU-Beschleunigung (NVIDIA):**
Ollama nutzt automatisch deine GPU, wenn verfügbar!

**Prüfen:**
```bash
nvidia-smi  # Zeigt GPU-Nutzung
```

### **RAM zu knapp?**
Verwende ein kleineres Modell:
```bash
ollama pull deepseek-r1:1.5b
```

### **Zu langsam?**
- Schließe andere Programme
- Nutze GPU (falls vorhanden)
- Wechsle zu kleinerem Modell

---

## 📊 Modell-Vergleich

| Modell | Größe | RAM | Qualität | Geschwindigkeit | Empfehlung |
|--------|-------|-----|----------|----------------|------------|
| 1.5B | 1 GB | 4 GB | ⭐⭐⭐ | ⚡⚡⚡⚡ | Tests |
| 7B | 4.5 GB | 8 GB | ⭐⭐⭐⭐ | ⚡⚡⚡ | ✅ **Empfohlen** |
| 14B | 9 GB | 16 GB | ⭐⭐⭐⭐⭐ | ⚡⚡ | Power-User |
| 70B | 40 GB | 32 GB | ⭐⭐⭐⭐⭐⭐ | ⚡ | Server/GPU |

---

## 🛠️ Troubleshooting

### **"Ollama not found"**
```bash
# Linux/WSL: Installiere neu
curl -fsSL https://ollama.com/install.sh | sh

# Windows: Starte Ollama Desktop App
```

### **"Connection refused"**
```bash
# Ollama läuft nicht - starte:
ollama serve

# Oder Windows: Starte Ollama App
```

### **"Model not found"**
```bash
# Modell herunterladen
ollama pull deepseek-r1:1.5b

# Verfügbare Modelle anzeigen
ollama list
```

### **Zu langsam / Out of Memory**
```bash
# Wechsel zu kleinerem Modell
ollama pull deepseek-r1:1.5b

# In backend/config.py ändern:
llm_model: str = "deepseek-r1:1.5b"
```

---

## 🎯 Nächste Schritte

1. ✅ Ollama installiert
2. ✅ Modell heruntergeladen
3. ✅ `ollama serve` läuft

**Jetzt:**
```bash
# Backend starten
cd backend
./start-backend.sh

# Frontend starten (neues Terminal)
cd frontend
./start-frontend.sh
```

**Öffne:** http://localhost:5173

---

## 💰 Kosten: $0!

Kein API-Key nötig, alles lokal, **komplett kostenlos**! 🎉

**Später für Railway (Cloud):**
- GPU-Instanz: ~$30-200/Monat (je nach Modell)
- Aber für lokale Entwicklung: **$0**
