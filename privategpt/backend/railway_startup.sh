#!/bin/bash
set -e

echo "🚂 Railway Startup - PrivateGPT Backend v2.2 (Multi-Model Support)"

# 1. Download Railway-safe models (0.5B, 1.5B, 3B - excludes RAM-intensive 7B)
echo "📦 Downloading Railway-safe LLM models..."
python3 download_model.py --railway

# 2. Run Database Migrations
echo "🗄️  Running database migrations..."
python3 -c "import asyncio; from database import init_db; asyncio.run(init_db())"

# 3. Start FastAPI Server
echo "🚀 Starting FastAPI server..."
PORT=${PORT:-8000}
echo "   Binding to port $PORT"
uvicorn main:app --host 0.0.0.0 --port $PORT
