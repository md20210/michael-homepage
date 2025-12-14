# 🗺️ PrivateGPT v2.0 - Feature Roadmap & Bugfixes

**Stand:** 2025-12-14
**Basis:** PrivateGPT v1.0 MVP

---

## 📊 Übersicht

Dieses Dokument enthält alle Feature-Requests und Bugfixes, priorisiert nach Dringlichkeit und Komplexität.

---

## 🔴 PHASE 0: Kritische Bugs (SOFORT)

Diese Bugs beeinträchtigen die Kernfunktionalität und müssen sofort behoben werden.

### 🐛 Bug #1: Web-Search funktioniert nicht
**Problem:** LLM sucht nicht im Internet, auch wenn es keine Antwort in Dokumenten findet.
**Erwartung:** Hybrid RAG sollte automatisch Web-Search triggern bei Low-Confidence.
**Komplexität:** Mittel
**Zeitaufwand:** 2-4 Stunden
**Technische Details:**
- `web_search.py` prüfen: Wird `AnswerQualityDetector` korrekt verwendet?
- `rag.py`: Confidence-Threshold korrekt implementiert?
- Logging hinzufügen für Web-Search-Trigger

**Dateien:**
- `privategpt/backend/rag.py`
- `privategpt/backend/web_search.py`

---

### 🐛 Bug #2: DeepSeek-R1-7B lädt nicht (OOM)
**Problem:** 7B Model führt zu Out-of-Memory auf Railway.
**Lösung:** Alternatives deutsches 3B Model (z.B. Mistral-7B-Instruct-v0.3 Q4 oder DiscoLM-German-7B Q4)
**Komplexität:** Niedrig
**Zeitaufwand:** 1 Stunde
**Technische Details:**
- Recherche: Beste deutsche 3B-4B Models
- `llm_models.py`: DeepSeek-R1-7B ersetzen
- Test auf Railway RAM-Limits (8 GB)

**Kandidaten:**
- Mistral-7B-Instruct-v0.3-Q4_K_M (~4 GB)
- DiscoLM-German-7B-v1-Q4_K_M (~4 GB)
- LeoLM-7B-Q4_K_M (~4 GB, speziell für Deutsch)

**Dateien:**
- `privategpt/backend/llm_models.py`

---

### 🐛 Bug #3: LLM antwortet nicht auf Meta-Fragen
**Problem:** LLM kann nicht sagen, wie es heißt oder welches Model geladen ist.
**Lösung:** System-Prompt erweitern mit Model-Info und Capabilities.
**Komplexität:** Niedrig
**Zeitaufwand:** 1 Stunde
**Technische Details:**
- `rag.py`: System-Prompt dynamisch generieren
- Model-Name, Version, Capabilities hinzufügen
- Beispiel: "Du bist ein KI-Assistent basierend auf {model_name}. Du kannst..."

**Dateien:**
- `privategpt/backend/rag.py` (System-Prompt)

---

### 🐛 Bug #4: Dokument-Löschung sehr langsam
**Problem:** Keine Progress-Anzeige beim Löschen von Dokumenten.
**Komplexität:** Niedrig
**Zeitaufwand:** 2 Stunden
**Technische Details:**
- Frontend: Loading-State während Löschung
- Backend: Logging für ChromaDB-Löschung
- Vektor-Löschung prüfen: Wird `collection.delete()` korrekt aufgerufen?

**Dateien:**
- `privategpt/frontend/src/components/DocumentList.jsx`
- `privategpt/backend/rag.py` (ChromaDB delete)

---

## 🟡 PHASE 1: Quick Wins (1-2 Wochen)

Features mit hohem User-Value und moderater Komplexität.

### ✨ Feature #1: Welcome Message
**Beschreibung:** Intro-Message beim ersten Chat-Start.
**Text:** "Hallo! Ich bin Dein persönlicher DSGVO-konformer ChatBot. Ich kann:
- 📄 Deine Dokumente analysieren
- 🔍 Im Internet recherchieren (ohne Deine Daten preiszugeben)
- 💬 Fragen basierend auf hochgeladenen PDFs beantworten

Deine Daten bleiben privat und werden nicht an Dritte weitergegeben."

**Komplexität:** Niedrig
**Zeitaufwand:** 1 Stunde
**Dateien:**
- `privategpt/frontend/src/components/ChatInterface.jsx`

---

### ✨ Feature #2: Antwort-Quellenangabe
**Beschreibung:** Jede AI-Antwort zeigt Quelle an:
- 🤖 "Direkt vom LLM" (kein RAG)
- 📄 "Aus Dokument: {filename}" (RAG)
- 🌐 "Web-Suche + LLM" (Hybrid)

**Komplexität:** Mittel
**Zeitaufwand:** 3-4 Stunden
**Technische Details:**
- Backend: `rag_engine.query()` gibt `source_type` zurück
- Frontend: Source-Badge unter jeder AI-Nachricht
- Icons: 🤖 📄 🌐

**Dateien:**
- `privategpt/backend/rag.py` (Source-Tracking)
- `privategpt/frontend/src/components/ChatMessage.jsx`

---

### ✨ Feature #3: UI-Verbesserungen
**3.1 Kein Pop-up bei Dokument-Upload/Löschen**
**3.2 Neue Dokumente oben anzeigen (sortiert nach Upload-Zeit)**
**3.3 Progress-Bar bei Upload/Löschen**
**3.4 Grüner "Schließen"-Button im Admin-Panel**

**Komplexität:** Niedrig-Mittel
**Zeitaufwand:** 4-6 Stunden
**Dateien:**
- `privategpt/frontend/src/components/DocumentList.jsx`
- `privategpt/frontend/src/components/AdminPanel.jsx`
- `privategpt/frontend/src/components/AdminPanel.css`

---

### ✨ Feature #4: Chat-History persistent
**Beschreibung:** Alle Fragen/Antworten werden gespeichert und bei neuem Chat geladen.
**Komplexität:** Niedrig (bereits implementiert?)
**Zeitaufwand:** 2 Stunden (Verifikation + Bugfixes)
**Prüfen:**
- Werden Messages bereits in DB gespeichert?
- Werden sie beim Reload geladen?

**Dateien:**
- `privategpt/backend/main.py` (Messages-Endpoints)
- `privategpt/frontend/src/components/ChatInterface.jsx`

---

### ✨ Feature #5: "Chat löschen"-Button
**Beschreibung:** Button unten links, löscht aktuellen Chat (nur Messages, keine Dokumente).
**Komplexität:** Niedrig
**Zeitaufwand:** 2 Stunden
**Technische Details:**
- Endpoint: `DELETE /assistants/{id}/messages`
- Frontend: Confirmation-Dialog
- UI: Roter Button unten links

**Dateien:**
- `privategpt/backend/main.py` (neuer Endpoint)
- `privategpt/frontend/src/components/ChatInterface.jsx`

---

## 🟢 PHASE 2: Major Features (2-4 Wochen)

Komplexere Features mit signifikantem Entwicklungsaufwand.

### 🚀 Feature #6: Multi-Format Support
**Beschreibung:** Upload von Word (.docx), Excel (.xlsx), Google Docs.
**Komplexität:** Hoch
**Zeitaufwand:** 8-12 Stunden
**Technische Details:**
- Libraries: `python-docx`, `openpyxl`, `pandas`
- Extraktion: Text aus Word/Excel
- ChromaDB: Gleicher Embedding-Flow
- Frontend: MIME-Type-Validierung erweitern

**Dateien:**
- `privategpt/backend/rag.py` (neue Extraktoren)
- `privategpt/backend/main.py` (MIME-Type-Check)
- `privategpt/frontend/src/components/DocumentUpload.jsx`

---

### 🚀 Feature #7: Bessere Antwortqualität
**Beschreibung:** Konkretere, kürzere Antworten.
**Komplexität:** Mittel
**Zeitaufwand:** 4-6 Stunden
**Technische Details:**
- System-Prompt optimieren:
  - "Antworte präzise und auf den Punkt."
  - "Maximal 3-5 Sätze pro Antwort."
  - "Wenn möglich, strukturiere mit Bullet-Points."
- `llm_max_tokens` reduzieren: 512 → 256
- Temperature senken: 0.7 → 0.5

**Dateien:**
- `privategpt/backend/rag.py` (System-Prompt)
- `privategpt/backend/config.py` (LLM-Settings)

---

### 🚀 Feature #8: Admin - User-Verwaltung
**Beschreibung:** Admin kann neue User einladen (Email + Name).
**Features:**
- User erhält Magic-Link (24h gültig)
- User hat eigenen Chat + Zugriff auf Admin-Dokumente
- User kann eigene Dokumente hochladen (nur für sich sichtbar)
- User hat eingeschränktes Admin-Panel (nur Sprache + Model-Auswahl)

**Komplexität:** Sehr Hoch
**Zeitaufwand:** 16-24 Stunden
**Technische Details:**
- DB-Schema: User-Rollen (Admin, User)
- Document-Ownership: `user_id` + `shared_by_admin` Flag
- ChromaDB: User-spezifische Collections oder Metadata-Filter
- Admin-UI: User-Liste, Invite-Dialog
- Email: Invite-Template

**Dateien:**
- `privategpt/backend/database.py` (neues Schema)
- `privategpt/backend/main.py` (User-Management Endpoints)
- `privategpt/backend/auth.py` (Invite-Links)
- `privategpt/frontend/src/components/AdminPanel.jsx` (neuer Tab)

---

### 🚀 Feature #9: Sprach-Auswahl (DE/EN/ES)
**Beschreibung:** User wählt Sprache → AI antwortet in dieser Sprache.
**Komplexität:** Mittel
**Zeitaufwand:** 4-6 Stunden
**Technische Details:**
- User-Setting: `preferred_language`
- System-Prompt: "Antworte auf Deutsch/Englisch/Spanisch"
- Welcome-Message in gewählter Sprache
- UI: Language-Switcher im Admin-Panel

**Dateien:**
- `privategpt/backend/database.py` (User-Setting)
- `privategpt/backend/rag.py` (dynamischer System-Prompt)
- `privategpt/frontend/src/components/AdminPanel.jsx`

---

### 🚀 Feature #10: Progress-Bar bei Model-Download
**Beschreibung:** Zeigt Download-Fortschritt im Admin-Panel.
**Komplexität:** Hoch (benötigt WebSocket oder SSE)
**Zeitaufwand:** 8-12 Stunden
**Technische Details:**
- Backend: Server-Sent Events (SSE) für Progress
- `download_model.py`: Progress-Callbacks
- Frontend: EventSource-API für SSE
- UI: Progress-Bar-Component

**Dateien:**
- `privategpt/backend/main.py` (SSE-Endpoint)
- `privategpt/backend/download_model.py` (Progress-Tracking)
- `privategpt/frontend/src/components/AdminPanel.jsx`

---

## 🔵 PHASE 3: Advanced Features (4-8 Wochen)

Hochkomplexe Features für spätere Iterationen.

### 🎨 Feature #11: Theme-Customization
**Beschreibung:** 10 vordefinierte Farbschemata pro User.
**Komplexität:** Mittel
**Zeitaufwand:** 6-8 Stunden
**Technische Details:**
- User-Setting: `theme_id`
- CSS-Variables für Themes
- Theme-Switcher im Admin-Panel
- Presets: Dark, Light, Blue, Green, etc.

**Dateien:**
- `privategpt/backend/database.py` (User-Setting)
- `privategpt/frontend/src/styles/themes.css`
- `privategpt/frontend/src/components/AdminPanel.jsx`

---

### 🎤 Feature #12: Speech-to-Text & Text-to-Speech
**Beschreibung:** Voice-Input und Voice-Output.
**Komplexität:** Sehr Hoch
**Zeitaufwand:** 20-30 Stunden
**Technische Optionen:**

**Option A: Browser-basiert (einfach, kostenlos)**
- Speech-to-Text: Web Speech API (`webkitSpeechRecognition`)
- Text-to-Speech: Web Speech API (`speechSynthesis`)
- ✅ Vorteile: Keine Backend-Änderungen, kostenlos
- ❌ Nachteile: Nur Chrome/Edge, eingeschränkte Sprachen

**Option B: Backend-basiert (professionell)**
- Speech-to-Text: OpenAI Whisper API oder Azure Speech
- Text-to-Speech: ElevenLabs, Azure TTS, oder Coqui TTS
- ✅ Vorteile: Bessere Qualität, alle Browser
- ❌ Nachteile: Kostet Geld, komplexer

**Empfehlung:** Start mit Option A (Browser), später Option B.

**Dateien:**
- `privategpt/frontend/src/components/ChatInterface.jsx` (Voice-Buttons)
- `privategpt/frontend/src/utils/speech.js` (Speech-API-Wrapper)

---

### 🗑️ Feature #13: Admin - "Alle Daten löschen"
**Beschreibung:** Admin kann ALLE Daten löschen (User, Dokumente, Chats, ChromaDB).
**Komplexität:** Mittel
**Zeitaufwand:** 4-6 Stunden
**Technische Details:**
- Endpoint: `DELETE /admin/all-data` (Superadmin only)
- Löscht: Users, Assistants, Documents, Messages, ChromaDB-Collections
- UI: Rote Warning + Confirmation-Dialog
- Logging für Audit-Trail

**Dateien:**
- `privategpt/backend/main.py` (neuer Endpoint)
- `privategpt/frontend/src/components/AdminPanel.jsx`

---

## 📐 Technische Architektur-Änderungen

### Multi-Tenancy für User-Verwaltung

**Problem:** Aktuell ein User = ein Assistant. Mit Multi-User brauchen wir:
- User können Dokumente teilen
- User haben separate Chats
- ChromaDB pro User oder Metadata-Filter

**Optionen:**

**Option A: ChromaDB-Collections pro User**
```python
collection_name = f"user_{user.id}_documents"
```
✅ Einfach
❌ Viele Collections (Overhead)

**Option B: Shared Collection + Metadata-Filter**
```python
collection.query(
    query_texts=[query],
    where={"$or": [
        {"user_id": user.id},
        {"shared_by_admin": True}
    ]}
)
```
✅ Effizient
❌ Komplexer

**Empfehlung:** Option B

---

## 🎯 Priorisierte Umsetzungs-Roadmap

### Sprint 1 (Woche 1): Kritische Bugs
- [ ] Bug #1: Web-Search fixen (4h)
- [ ] Bug #2: DeepSeek-R1-7B ersetzen (1h)
- [ ] Bug #3: Meta-Fragen (1h)
- [ ] Bug #4: Dokument-Löschung (2h)

**Total: ~8 Stunden**

---

### Sprint 2 (Woche 2): Quick Wins UI
- [ ] Feature #1: Welcome-Message (1h)
- [ ] Feature #2: Quellenangabe (4h)
- [ ] Feature #3: UI-Verbesserungen (6h)
- [ ] Feature #4: Chat-History (2h)
- [ ] Feature #5: Chat löschen (2h)

**Total: ~15 Stunden**

---

### Sprint 3-4 (Woche 3-4): Major Features
- [ ] Feature #6: Multi-Format Support (12h)
- [ ] Feature #7: Antwortqualität (6h)
- [ ] Feature #9: Sprach-Auswahl (6h)

**Total: ~24 Stunden**

---

### Sprint 5-8 (Woche 5-8): User-Management
- [ ] Feature #8: User-Verwaltung (24h)
- [ ] Feature #10: Progress-Bar Model-Download (12h)

**Total: ~36 Stunden**

---

### Sprint 9+ (Later): Advanced
- [ ] Feature #11: Themes (8h)
- [ ] Feature #12: Speech (30h)
- [ ] Feature #13: Alle Daten löschen (6h)

**Total: ~44 Stunden**

---

## 💰 Kosten-Schätzung

### Externe Dienste (optional)

| Feature | Service | Kosten/Monat |
|---------|---------|--------------|
| Speech-to-Text | OpenAI Whisper API | $0.006/Min (~$10/Monat) |
| Text-to-Speech | ElevenLabs | $5-22/Monat |
| Alternativ: Azure Speech | Pay-as-you-go | $1/1000 Zeichen |

**Ohne Speech:** $0 zusätzlich
**Mit Speech (Browser-basiert):** $0
**Mit Speech (Backend):** ~$15-30/Monat

---

## 🧪 Testing-Strategie

### Kritische Tests nach jedem Sprint

1. **Bug-Fixes:** Manuelle Tests für jedes behobene Problem
2. **RAG-Qualität:** Test-Fragen für Dokument-Retrieval
3. **Web-Search:** Test mit Fragen außerhalb der Dokumente
4. **Multi-User:** Isolation-Tests (User A sieht nicht User B's Dokumente)
5. **Performance:** Load-Test mit 10+ Dokumenten

---

## 📚 Technologie-Stack Updates

### Neue Dependencies (Phase 2+)

```python
# Phase 2
python-docx==1.1.0  # Word-Support
openpyxl==3.1.2  # Excel-Support
pandas==2.1.4  # CSV/Excel-Processing

# Phase 3 (Optional - Speech Backend)
openai==1.6.0  # Whisper API
elevenlabs==0.2.27  # TTS
```

---

## 🎓 Learnings & Best Practices

### Lessons Learned aus MVP

1. **Railway RAM-Limits:** 7B Models = OOM → Prefer 3B-4B Q4
2. **ChromaDB Embedding:** `paraphrase-multilingual-MiniLM-L12-v2` funktioniert gut für DE/EN
3. **LLM-Auswahl:** DeepSeek-R1-1.5B = Sweet-Spot (Qualität/Geschwindigkeit)
4. **Hybrid RAG:** Threshold 0.3 zu niedrig? → Mehr Web-Searches nötig

### Empfehlungen

- **Model-Wechsel:** Nur Railway-safe Models (≤4 GB) als Default
- **Web-Search:** Expliziten "Web-Search"-Button erwägen
- **Progress-Feedback:** Immer Loading-States für User-Actions
- **Logging:** Railway Logs für Debugging essentiell

---

## 🚀 Nächste Schritte

1. **Review dieses Dokuments** mit Stakeholder
2. **Priorisierung** bestätigen
3. **Sprint 1 starten** (Kritische Bugs)
4. **Wöchentliche Reviews** für Feedback
5. **Iteratives Deployment** nach jedem Sprint

---

**Erstellt:** 2025-12-14
**Letzte Aktualisierung:** 2025-12-14
**Version:** 1.0
