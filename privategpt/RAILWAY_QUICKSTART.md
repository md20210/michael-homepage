# Railway Quick-Start (5 Minuten Setup)

Schnellste Methode um PrivateGPT mit Qwen3-0.6B auf Railway zu deployen.

## 1. Railway Account erstellen

1. Gehe zu [railway.app](https://railway.app)
2. **Sign up** mit GitHub Account
3. **Pro Plan** aktivieren ($20/Monat) - empfohlen für stabilen Betrieb

## 2. Neues Projekt erstellen

```bash
# Im Railway Dashboard:
New Project → Deploy from GitHub repo → michael-homepage
```

Railway erkennt automatisch das Monorepo und findet beide Services!

## 3. PostgreSQL hinzufügen

```bash
# Im Railway Dashboard:
New → Database → Add PostgreSQL
```

Railway erstellt automatisch die `DATABASE_URL` Environment Variable.

## 4. Backend Service konfigurieren

### Service Settings:
- **Root Directory**: `privategpt/backend`
- **Build Command**: Automatisch via `nixpacks.toml`
- **Start Command**: Automatisch via `railway_startup.sh`

### Environment Variables setzen:

```bash
# Automatisch von Railway:
DATABASE_URL=postgresql://...  # Wird automatisch gesetzt!
PORT=8000                       # Wird automatisch gesetzt!

# Manuell setzen:
RESEND_API_KEY=re_xxx
JWT_SECRET=xxx  # NEU GENERIEREN für Production!
FRONTEND_URL=https://dein-frontend.up.railway.app  # Nach Frontend-Deploy
BACKEND_URL=https://dein-backend.up.railway.app    # Von Railway

# LLM Config:
LLM_MODEL_PATH=/app/models/qwen2.5-0.5b-instruct-q4_k_m.gguf
LLM_CONTEXT_SIZE=4096
LLM_MAX_TOKENS=512
LLM_TEMPERATURE=0.7
LLM_THREADS=8

# Paths:
CHROMA_DB_PATH=/data/chroma_db

# Email:
FROM_EMAIL=onboarding@resend.dev
MAGIC_LINK_EXPIRY_MINUTES=15
SESSION_EXPIRY_DAYS=30
```

### Persistent Volumes:

1. **Settings** → **Volumes** → **Add Volume**:
   - `/data` - 1GB (ChromaDB)
   - `/app/models` - 1GB (Qwen3 Model)
   - `/app/uploads` - 2GB (PDFs)

## 5. Frontend Service konfigurieren

### Service Settings:
- **Root Directory**: `privategpt/frontend`
- **Build Command**: Automatisch via `nixpacks.toml`
- **Start Command**: `npx serve -s dist -l $PORT`

### Environment Variables:

```bash
VITE_API_URL=https://dein-backend.up.railway.app
```

## 6. Deploy!

Railway deployt automatisch beide Services nach Git Push.

**Deployment-Zeit**:
- Frontend: ~2 Minuten
- Backend: ~5 Minuten (Model Download)

## 7. URLs aktualisieren

Nach dem ersten Deploy:

1. Kopiere die Backend URL: `https://xxx-backend-production.up.railway.app`
2. Kopiere die Frontend URL: `https://xxx-frontend-production.up.railway.app`
3. Setze im Backend Service:
   - `BACKEND_URL=https://xxx-backend-production.up.railway.app`
   - `FRONTEND_URL=https://xxx-frontend-production.up.railway.app`
4. Setze im Frontend Service:
   - `VITE_API_URL=https://xxx-backend-production.up.railway.app`
5. **Redeploy** beide Services (Settings → Redeploy)

## 8. Testen

```bash
# Backend Health Check:
https://dein-backend.up.railway.app/docs

# Frontend:
https://dein-frontend.up.railway.app
```

## Troubleshooting

### Model Download schlägt fehl
**Logs prüfen**: Railway Dashboard → Backend Service → Logs
**Fix**: Volume `/app/models` korrekt gemountet?

### Database Connection Error
**Fix**: PostgreSQL Plugin hinzugefügt? `DATABASE_URL` gesetzt?

### CORS Error
**Fix**: `FRONTEND_URL` im Backend korrekt gesetzt?

### Out of Memory
**Fix**: Pro Plan erforderlich (Starter hat nur 512MB RAM)

---

**Fertig!** Dein PrivateGPT läuft jetzt 100% privat auf Railway mit Qwen3-0.6B.

Für detaillierte Infos siehe: `RAILWAY_DEPLOYMENT_GUIDE.md`
