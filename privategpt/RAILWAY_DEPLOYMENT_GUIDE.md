# 🚂 Railway Deployment Guide für PrivateGPT

**100% Private, DSGVO-konforme Deployment mit Qwen3-0.6B**

Dieser Guide führt dich Schritt für Schritt durch das Deployment deines PrivateGPT-Projekts auf Railway mit vollständiger Datenkontrolle und On-Platform LLM-Inferenz.

---

## 📋 Inhaltsverzeichnis

1. [Übersicht & Architektur](#übersicht--architektur)
2. [Voraussetzungen](#voraussetzungen)
3. [Railway Setup](#railway-setup)
4. [Backend Code-Änderungen](#backend-code-änderungen)
5. [Frontend Code-Änderungen](#frontend-code-änderungen)
6. [Deployment Konfiguration](#deployment-konfiguration)
7. [Deployment Durchführen](#deployment-durchführen)
8. [Testing & Troubleshooting](#testing--troubleshooting)
9. [Kosten & Performance](#kosten--performance)
10. [Maintenance & Updates](#maintenance--updates)

---

## 🏗️ Übersicht & Architektur

### Was wird geändert?

| Component | Lokal (IST) | Railway (SOLL) |
|-----------|-------------|----------------|
| **Datenbank** | SQLite (File) | PostgreSQL (Railway Plugin) |
| **Vector DB** | ChromaDB (File) | ChromaDB (Persistent Volume) |
| **LLM** | Ollama (lokal) | **llama-cpp-python + Qwen3-0.6B** |
| **File Storage** | Lokales Dateisystem | Persistent Volume |
| **Frontend** | Vite Dev Server | Static Build auf Railway |

### Warum Qwen3-0.6B?

✅ **100% privat** - Läuft komplett auf deinem Railway Server
✅ **DSGVO-konform** - Keine Daten verlassen die Plattform
✅ **Keine externen API-Calls** - Vollständige Kontrolle
✅ **Schneller als TinyLlama** - Nur 0.6B Parameter = 5-15 Sekunden/Antwort
✅ **Besser für Deutsch** - Multilingual optimiert (Qwen3 2024)
✅ **Geringerer RAM-Bedarf** - ~1GB statt 2GB (könnte mit Starter Plan laufen!)
⚠️ **Eingeschränkte Qualität** - 0.6B Parameter vs. 70B+ bei Cloud-LLMs

---

## ✅ Voraussetzungen

### 1. Railway Account
- Registriere dich auf [railway.app](https://railway.app)
- **Qwen3-0.6B Vorteil**: Könnte sogar mit **Starter Plan** laufen! ($5/Monat)
  - Starter Plan: bis 512MB RAM (knapp, aber machbar)
  - **Empfohlen: Pro Plan** ($20/Monat) für 8GB RAM + 8 vCPUs (sicherer)

### 2. Lokales Setup
- Git installiert und Repository auf GitHub
- Node.js 18+ für Frontend-Build
- Python 3.11+ für Backend-Testing

### 3. API Keys
- **Resend API Key** (für Magic-Link E-Mails)
  - Erstelle einen Account auf [resend.com](https://resend.com)
  - 3000 E-Mails/Monat kostenlos

---

## 🚀 Railway Setup

### Schritt 1: Projekt erstellen

1. Login auf Railway
2. **New Project** → **Deploy from GitHub repo**
3. Wähle dein `michael-homepage` Repository
4. Railway erstellt automatisch ein Projekt

### Schritt 2: PostgreSQL Datenbank hinzufügen

1. Im Railway Dashboard: **New** → **Database** → **Add PostgreSQL**
2. Railway erstellt automatisch:
   - PostgreSQL Instanz
   - Environment Variable `DATABASE_URL`
3. Notiere dir die Connection Details (für lokales Testing)

### Schritt 3: Services konfigurieren

Railway erkennt automatisch Monorepos. Du musst 2 Services konfigurieren:

#### Backend Service
- **Root Directory**: `privategpt/backend`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Port**: `8000` (wird automatisch gesetzt via `$PORT`)

#### Frontend Service
- **Root Directory**: `privategpt/frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npx serve -s dist -l $PORT`
- **Port**: `3000` (wird automatisch gesetzt via `$PORT`)

---

## 🔧 Backend Code-Änderungen

### 1. requirements.txt erweitern

**Datei**: `backend/requirements.txt`

```txt
# FastAPI Backend
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6

# Database - PostgreSQL Support hinzufügen
sqlalchemy==2.0.25
aiosqlite==0.19.0  # Behalten für lokale Entwicklung
asyncpg==0.29.0  # NEU: Async PostgreSQL Driver
psycopg2-binary==2.9.9  # NEU: PostgreSQL Driver (Fallback)

# Vector Database
chromadb>=0.5.0

# Document Processing
PyPDF2==3.0.1
python-docx==1.1.0

# LLM & Embeddings - llama-cpp-python hinzufügen
httpx==0.27.0  # Behalten für ChromaDB
langchain==0.1.6
langchain-community>=0.0.18
llama-cpp-python==0.2.90  # NEU: TinyLlama Integration

# Auth & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic[email]==2.5.3
pydantic-settings==2.1.0

# Email (Magic-Link)
resend==0.7.0

# Utils
python-dotenv==1.0.0
```

### 2. config.py anpassen

**Datei**: `backend/config.py`

**Ersetze die gesamte Datei**:

```python
"""Configuration management"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""

    # API Keys
    resend_api_key: str
    jwt_secret: str

    # URLs
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"

    # Database - NEU: Unterstützt PostgreSQL + SQLite
    database_url: str = "sqlite+aiosqlite:///./privategpt.db"

    # Email
    from_email: str = "noreply@dabrock.eu"
    magic_link_expiry_minutes: int = 15
    session_expiry_days: int = 30

    # LLM Config - NEU: llama-cpp-python mit Qwen3-0.6B
    llm_model_path: str = "./models/qwen2.5-0.5b-instruct-q4_k_m.gguf"  # Lokaler Pfad
    llm_context_size: int = 4096  # Context Window (Qwen3 unterstützt bis 32k!)
    llm_max_tokens: int = 512  # Max Output Tokens
    llm_temperature: float = 0.7
    llm_threads: int = 4  # CPU Threads (Railway: 8 vCPUs)

    # Railway Environment Detection
    railway_environment: str | None = None  # Wird automatisch gesetzt

    # Limits
    max_file_size_mb: int = 10
    max_files_per_user: int = 50

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
```

### 3. database.py anpassen

**Datei**: `backend/database.py`

**Keine Änderung nötig!** SQLAlchemy unterstützt automatisch PostgreSQL wenn `DATABASE_URL` mit `postgresql://` beginnt.

### 4. rag.py komplett umschreiben

**Datei**: `backend/rag.py`

**Ersetze die gesamte Datei**:

```python
"""RAG (Retrieval Augmented Generation) Logic - Railway Version mit llama-cpp-python"""
import os
from typing import List, Dict
import PyPDF2
import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain.text_splitter import RecursiveCharacterTextSplitter

# NEU: llama-cpp-python statt httpx/Ollama
from llama_cpp import Llama

from config import get_settings

settings = get_settings()

# Initialize ChromaDB - NEU: Persistent Path für Railway Volume
chroma_db_path = os.getenv("CHROMA_DB_PATH", "./chroma_db")
chroma_client = chromadb.PersistentClient(
    path=chroma_db_path,
    settings=ChromaSettings(anonymized_telemetry=False)
)

# NEU: Global LLM Instance (lazy loading)
_llm_instance = None


def get_llm() -> Llama:
    """Get or create LLM instance (singleton)"""
    global _llm_instance
    if _llm_instance is None:
        print(f"Loading Qwen2.5-0.5B model from {settings.llm_model_path}...")
        _llm_instance = Llama(
            model_path=settings.llm_model_path,
            n_ctx=settings.llm_context_size,
            n_threads=settings.llm_threads,
            verbose=False
        )
        print("Qwen2.5-0.5B loaded successfully!")
    return _llm_instance


class DocumentProcessor:
    """Process documents and create embeddings"""

    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            raise
        return text

    def split_text(self, text: str) -> List[str]:
        """Split text into chunks"""
        chunks = self.text_splitter.split_text(text)
        return chunks

    async def process_document(self, file_path: str, document_id: int) -> int:
        """Process document: extract text, split, and store in vector DB"""
        # Extract text
        text = self.extract_text_from_pdf(file_path)

        if not text.strip():
            raise ValueError("No text could be extracted from PDF")

        # Split into chunks
        chunks = self.split_text(text)

        # Get or create collection for this document
        collection_name = f"doc_{document_id}"
        try:
            collection = chroma_client.get_collection(collection_name)
            # Delete existing collection if it exists
            chroma_client.delete_collection(collection_name)
        except:
            pass

        collection = chroma_client.create_collection(
            name=collection_name,
            metadata={"document_id": document_id}
        )

        # Create embeddings and store
        collection.add(
            documents=chunks,
            ids=[f"chunk_{i}" for i in range(len(chunks))],
            metadatas=[{"chunk_index": i, "document_id": document_id} for i in range(len(chunks))]
        )

        return len(chunks)


class RAGEngine:
    """RAG Engine for querying documents"""

    def __init__(self):
        self.processor = DocumentProcessor()

    async def query(
        self,
        question: str,
        assistant_id: int,
        document_ids: List[int],
        max_results: int = 3
    ) -> Dict[str, any]:
        """Query documents and generate answer"""

        if not document_ids:
            # No documents, return general response
            response = await self._generate_response_without_context(question)
            return {
                "answer": response,
                "sources": [],
                "context_used": False
            }

        # Retrieve relevant chunks from all documents
        all_chunks = []
        sources = []

        for doc_id in document_ids:
            collection_name = f"doc_{doc_id}"
            try:
                collection = chroma_client.get_collection(collection_name)

                # Query collection
                results = collection.query(
                    query_texts=[question],
                    n_results=max_results
                )

                # Add to chunks
                if results and results['documents']:
                    for i, doc in enumerate(results['documents'][0]):
                        all_chunks.append(doc)
                        sources.append({
                            "document_id": doc_id,
                            "chunk_index": i,
                            "distance": results['distances'][0][i] if results['distances'] else None
                        })

            except Exception as e:
                print(f"Error querying collection {collection_name}: {e}")
                continue

        # Generate answer using LLM
        if all_chunks:
            response = await self._generate_response_with_context(question, all_chunks)
            context_used = True
        else:
            response = await self._generate_response_without_context(question)
            context_used = False

        return {
            "answer": response,
            "sources": sources,
            "context_used": context_used
        }

    async def _generate_response_with_context(
        self,
        question: str,
        context_chunks: List[str]
    ) -> str:
        """Generate response using llama-cpp-python with context"""

        # Build context
        context = "\n\n".join(context_chunks[:5])  # Use top 5 chunks

        # Create prompt (Qwen2.5 ChatML Format)
        prompt = f"""<|im_start|>system
Du bist ein hilfreicher KI-Assistent. Beantworte die Frage basierend auf den folgenden Dokumenten-Auszügen.
Wenn die Antwort nicht in den Dokumenten enthalten ist, sage das ehrlich.<|im_end|>
<|im_start|>user
DOKUMENTE:
{context}

FRAGE: {question}<|im_end|>
<|im_start|>assistant
"""

        # Call llama-cpp-python
        try:
            llm = get_llm()
            output = llm(
                prompt,
                max_tokens=settings.llm_max_tokens,
                temperature=settings.llm_temperature,
                stop=["<|im_end|>", "<|im_start|>"],
                echo=False
            )
            return output['choices'][0]['text'].strip()

        except Exception as e:
            print(f"Error calling LLM: {e}")
            return f"Fehler bei der LLM-Anfrage: {str(e)}"

    async def _generate_response_without_context(self, question: str) -> str:
        """Generate response using llama-cpp-python without document context"""

        prompt = f"""<|im_start|>system
Du bist ein hilfreicher KI-Assistent.<|im_end|>
<|im_start|>user
{question}<|im_end|>
<|im_start|>assistant
"""

        try:
            llm = get_llm()
            output = llm(
                prompt,
                max_tokens=settings.llm_max_tokens,
                temperature=settings.llm_temperature,
                stop=["<|im_end|>", "<|im_start|>"],
                echo=False
            )
            return output['choices'][0]['text'].strip()

        except Exception as e:
            print(f"Error calling LLM: {e}")
            return f"Fehler bei der LLM-Anfrage: {str(e)}"


# Global instance
rag_engine = RAGEngine()
```

### 5. Qwen3-0.6B Model Download Script erstellen

**Neue Datei**: `backend/download_model.py`

```python
"""Download Qwen2.5-0.5B model for Railway deployment"""
import os
import urllib.request
from pathlib import Path

MODEL_URL = "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf"
MODEL_DIR = Path("./models")
MODEL_PATH = MODEL_DIR / "qwen2.5-0.5b-instruct-q4_k_m.gguf"


def download_model():
    """Download Qwen2.5-0.5B model if not exists"""
    if MODEL_PATH.exists():
        print(f"Model already exists at {MODEL_PATH}")
        return

    print(f"Creating model directory: {MODEL_DIR}")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Downloading Qwen2.5-0.5B model from {MODEL_URL}...")
    print("This may take a few minutes (file size: ~390MB)")

    def progress(block_num, block_size, total_size):
        downloaded = block_num * block_size
        percent = min(downloaded * 100 / total_size, 100)
        print(f"\rProgress: {percent:.1f}%", end="")

    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH, progress)
    print(f"\n✅ Model downloaded successfully to {MODEL_PATH}")


if __name__ == "__main__":
    download_model()
```

### 6. Startup Script erstellen

**Neue Datei**: `backend/railway_startup.sh`

```bash
#!/bin/bash
set -e

echo "🚂 Railway Startup - PrivateGPT Backend"

# 1. Download Qwen2.5-0.5B Model (if not exists)
echo "📦 Checking Qwen2.5-0.5B model..."
python download_model.py

# 2. Run Database Migrations
echo "🗄️  Running database migrations..."
python -c "import asyncio; from database import init_db; asyncio.run(init_db())"

# 3. Start FastAPI Server
echo "🚀 Starting FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Ausführbar machen**:
```bash
chmod +x backend/railway_startup.sh
```

---

## 🎨 Frontend Code-Änderungen

### 1. Environment Variable für Backend URL

**Datei**: `frontend/src/api.js` (oder wo immer deine API Calls sind)

**Suche nach**:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

**Ersetze mit**:
```javascript
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
```

### 2. Vite Config anpassen

**Datei**: `frontend/vite.config.js`

**Falls nicht vorhanden, erstelle**:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

### 3. Static Server Package hinzufügen

**Datei**: `frontend/package.json`

**Füge zu `dependencies` hinzu**:
```json
{
  "dependencies": {
    ...existing dependencies...,
    "serve": "^14.2.1"
  }
}
```

---

## ⚙️ Deployment Konfiguration

### 1. Backend .env für Railway

**In Railway Dashboard → Backend Service → Variables**:

```bash
# Database (automatisch gesetzt durch Railway PostgreSQL Plugin)
DATABASE_URL=postgresql://...  # Wird automatisch gesetzt!

# Resend (Magic-Link E-Mails)
RESEND_API_KEY=re_gR4DbfhT_NTnbMoH8JFApqLhuzW8vG7Ua

# JWT Secret (generiere neu für Production!)
JWT_SECRET=ERSETZE_MICH_MIT_EINEM_SICHEREN_RANDOM_STRING

# URLs (werden nach Deployment angepasst)
FRONTEND_URL=https://dein-frontend.up.railway.app
BACKEND_URL=https://dein-backend.up.railway.app

# Email Config
FROM_EMAIL=onboarding@resend.dev
MAGIC_LINK_EXPIRY_MINUTES=15
SESSION_EXPIRY_DAYS=30

# LLM Config (llama-cpp-python mit Qwen2.5-0.5B)
LLM_MODEL_PATH=/app/models/qwen2.5-0.5b-instruct-q4_k_m.gguf
LLM_CONTEXT_SIZE=4096
LLM_MAX_TOKENS=512
LLM_TEMPERATURE=0.7
LLM_THREADS=8

# ChromaDB Path (Persistent Volume)
CHROMA_DB_PATH=/data/chroma_db

# Railway Environment
RAILWAY_ENVIRONMENT=production
```

### 2. Frontend .env für Railway

**In Railway Dashboard → Frontend Service → Variables**:

```bash
VITE_BACKEND_URL=https://dein-backend.up.railway.app
```

### 3. Railway Service Konfiguration

#### Backend nixpacks.toml

**Neue Datei**: `backend/nixpacks.toml`

```toml
[phases.setup]
nixPkgs = ["python311", "gcc", "g++"]

[phases.install]
cmds = [
  "pip install --upgrade pip",
  "pip install -r requirements.txt"
]

[phases.build]
cmds = [
  "python download_model.py"
]

[start]
cmd = "bash railway_startup.sh"
```

#### Frontend nixpacks.toml

**Neue Datei**: `frontend/nixpacks.toml`

```toml
[phases.setup]
nixPkgs = ["nodejs-18"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npx serve -s dist -l $PORT"
```

### 4. Persistent Volumes konfigurieren

**Im Railway Dashboard**:

#### Backend Service:
1. **Settings** → **Volumes**
2. **Add Volume**:
   - **Mount Path**: `/data`
   - **Size**: 1GB (für ChromaDB)
3. **Add Volume**:
   - **Mount Path**: `/app/models`
   - **Size**: 1GB (für TinyLlama)
4. **Add Volume**:
   - **Mount Path**: `/app/uploads`
   - **Size**: 2GB (für PDF Uploads)

---

## 🚀 Deployment Durchführen

### Schritt 1: Code vorbereiten

```bash
cd /mnt/e/Project20250615/portfolio-website/michael-homepage/privategpt

# Alle neuen Dateien hinzufügen
git add .

# Commit
git commit -m "Railway Deployment Setup mit TinyLlama 1.1B

- PostgreSQL Support (asyncpg)
- llama-cpp-python statt Ollama
- TinyLlama 1.1B Q4_K_M Model Download
- Railway Startup Scripts
- Persistent Volumes Config
- Frontend Static Build

✅ 100% private, DSGVO-konform"

# Push
git push origin main
```

### Schritt 2: Railway Deployment

1. **Railway Dashboard öffnen**
2. Railway erkennt automatisch den neuen Code
3. **Backend Service**:
   - Warte bis Model Download abgeschlossen ist (~5 Minuten)
   - Prüfe Logs: "TinyLlama loaded successfully!"
4. **Frontend Service**:
   - Build sollte in 1-2 Minuten fertig sein
5. **Domain URLs kopieren** und in Environment Variables eintragen:
   - Backend URL → Frontend `VITE_BACKEND_URL`
   - Frontend URL → Backend `FRONTEND_URL`
6. **Beide Services neu deployen** (damit URLs aktiv werden)

### Schritt 3: PostgreSQL Migration (einmalig)

**Lokal testen**:
```bash
# PostgreSQL Connection String aus Railway kopieren
export DATABASE_URL="postgresql://..."

# Migration ausführen
cd backend
python -c "import asyncio; from database import init_db; asyncio.run(init_db())"
```

**Auf Railway**: Wird automatisch durch `railway_startup.sh` ausgeführt

---

## 🧪 Testing & Troubleshooting

### 1. Backend Health Check

**URL**: `https://dein-backend.up.railway.app/docs`

- Sollte FastAPI Swagger UI zeigen
- Teste `/api/health` Endpoint

### 2. LLM Test

**Im Railway Backend Logs**:
```
TinyLlama loaded successfully!
```

**Falls Fehler**:
- Model nicht gefunden → Prüfe `/app/models` Volume
- Out of Memory → Upgrade auf Pro Plan
- Timeout → Erhöhe CPU Threads in Environment Variables

### 3. Frontend Test

**URL**: `https://dein-frontend.up.railway.app`

- Magic-Link Login sollte funktionieren
- PDF Upload testen
- Chat Antwort sollte in 10-30 Sekunden kommen

### 4. Häufige Fehler

#### "Database connection failed"
- **Ursache**: PostgreSQL Plugin nicht verbunden
- **Lösung**: Railway Dashboard → Backend → Variables → Database URL prüfen

#### "Model not found"
- **Ursache**: Volume nicht gemountet oder Download fehlgeschlagen
- **Lösung**: Logs prüfen, Model Download manuell triggern

#### "Out of memory"
- **Ursache**: TinyLlama braucht mindestens 2GB RAM
- **Lösung**: Railway Pro Plan erforderlich

#### "CORS Error"
- **Ursache**: Frontend URL nicht in Backend CORS Config
- **Lösung**: `FRONTEND_URL` Environment Variable prüfen

---

## 💰 Kosten & Performance

### Railway Kosten (Pro Plan)

**Monatliche Kosten** (ca. $25-35):
- Pro Plan: $20/Monat (Basis)
- PostgreSQL: $5/Monat (512MB)
- Storage (Volumes): $0.25/GB/Monat
  - ChromaDB: 1GB = $0.25
  - Models: 1GB = $0.25
  - Uploads: 2GB = $0.50
- **Traffic**: $0.10/GB (Railway gibt 100GB/Monat free)
- **Compute**: $0.000463/vCPU-Minute (ca. $5-10/Monat bei moderater Nutzung)

**Gesamt**: ca. $25-35/Monat

### Performance Erwartungen

**Qwen2.5-0.5B (CPU-only)**:
- **Antwortzeit**: 5-15 Sekunden (2x schneller als TinyLlama!)
- **Qualität**: Gut für einfache Fragen, starke Multilingual-Performance (DE/EN)
- **Context**: 4096 Tokens (~3000 Wörter)
- **Concurrent Users**: 2-3 gleichzeitig (dank geringerer Last)

**Verbesserungsmöglichkeiten**:
1. **GPU Upgrade** (Railway unterstützt GPUs):
   - 10x schneller (1-3 Sekunden/Antwort)
   - Kosten: +$50-100/Monat
2. **Größeres Model** (z.B. Llama-2-7B):
   - Bessere Qualität
   - Braucht mindestens 8GB RAM + GPU
3. **Response Streaming**:
   - Gefühlte Performance besser
   - Token-by-Token Anzeige

---

## 🔄 Maintenance & Updates

### Model Update (z.B. auf Llama-2-7B)

1. **Model URL ändern** in `download_model.py`
2. **LLM_MODEL_PATH** Environment Variable anpassen
3. **Git Push** → Railway deployt automatisch neu
4. **Volume Size erhöhen** wenn nötig

### Code Updates

```bash
# Lokale Änderungen commiten
git add .
git commit -m "Feature: XYZ"
git push origin main

# Railway deployt automatisch
```

### Backup Strategie

**PostgreSQL**:
- Railway macht automatische Backups (7 Tage retention)
- Manuell: `pg_dump` über Railway CLI

**ChromaDB**:
- Volume Snapshots über Railway Dashboard
- Oder: Backup Script mit `rsync`

**Uploads**:
- Regelmäßige Backups nach S3/Wasabi empfohlen

---

## 🎯 Nächste Schritte nach Deployment

1. **Custom Domain** hinzufügen:
   - Railway Dashboard → Settings → Domains
   - CNAME Record: `privategpt.dabrock.eu` → Railway URL

2. **SSL Zertifikat**: Automatisch durch Railway

3. **Monitoring** einrichten:
   - Railway Dashboard → Metrics
   - Sentry für Error Tracking

4. **Performance Optimierung**:
   - Response Streaming implementieren
   - LLM Response Cache hinzufügen
   - Async Job Queue für PDF Processing

5. **Security Hardening**:
   - Rate Limiting hinzufügen
   - JWT Rotation implementieren
   - File Upload Validierung verschärfen

---

## 📚 Ressourcen

- [Railway Docs](https://docs.railway.app)
- [llama-cpp-python Docs](https://llama-cpp-python.readthedocs.io)
- [TinyLlama Model Card](https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [ChromaDB Docs](https://docs.trychroma.com)

---

## ✅ Deployment Checklist

### Vor dem Deployment
- [ ] Railway Pro Account aktiviert
- [ ] Resend API Key erstellt
- [ ] JWT Secret generiert
- [ ] Alle Code-Änderungen committet
- [ ] PostgreSQL Plugin hinzugefügt
- [ ] Persistent Volumes konfiguriert

### Backend Deployment
- [ ] `requirements.txt` erweitert (asyncpg, llama-cpp-python)
- [ ] `config.py` angepasst (LLM Config)
- [ ] `rag.py` umgeschrieben (llama-cpp-python)
- [ ] `download_model.py` erstellt
- [ ] `railway_startup.sh` erstellt
- [ ] `nixpacks.toml` erstellt
- [ ] Environment Variables gesetzt

### Frontend Deployment
- [ ] API Base URL auf Environment Variable umgestellt
- [ ] `vite.config.js` erstellt
- [ ] `serve` Package hinzugefügt
- [ ] `nixpacks.toml` erstellt
- [ ] Environment Variables gesetzt

### Nach dem Deployment
- [ ] Backend Logs geprüft (Model geladen?)
- [ ] Frontend erreichbar
- [ ] Login funktioniert (Magic-Link)
- [ ] PDF Upload funktioniert
- [ ] Chat Antwort funktioniert (LLM Test)
- [ ] PostgreSQL Migration erfolgreich
- [ ] Custom Domain konfiguriert (optional)

---

**🎉 Fertig! Dein PrivateGPT ist jetzt 100% privat und DSGVO-konform auf Railway deployed.**

Bei Fragen oder Problemen: Prüfe zuerst die Railway Logs, dann Troubleshooting Sektion in diesem Guide.
