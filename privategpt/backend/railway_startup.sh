#!/bin/bash
set -e

echo "🚂 Railway Startup - PrivateGPT Backend v2.2 (Multi-Model Support + Email Verification)"

# 1. Download Railway-safe models IN BACKGROUND (to avoid Railway startup timeout)
echo "📦 Starting background download of Railway-safe LLM models..."
nohup python3 download_model.py --railway > /tmp/model_download.log 2>&1 &
echo "   Download running in background (PID: $!)"
echo "   Check progress: tail -f /tmp/model_download.log"

# 2. Run Database Migrations
echo "🗄️  Running database migrations..."
python3 -c "import asyncio; from database import init_db; asyncio.run(init_db())"

# 2.1. Add password_hash column if missing
echo "🔐 Checking password_hash column..."
python3 migrate_add_password.py

# 2.2. Add email_verified column if missing
echo "✉️  Checking email_verified column..."
python3 migrate_add_email_verified.py

# 3. Start FastAPI Server (models will continue downloading in background)
echo "🚀 Starting FastAPI server..."
PORT=${PORT:-8000}
echo "   Binding to port $PORT"
echo "   Note: LLM models are downloading in background"
uvicorn main:app --host 0.0.0.0 --port $PORT
