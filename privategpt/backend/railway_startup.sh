#!/bin/bash
set -e

echo "🚂 Railway Startup - PrivateGPT Backend"

# 1. Download Qwen2.5-0.5B Model (if not exists)
echo "📦 Checking Qwen2.5-0.5B model..."
python3 download_model.py

# 2. Run Database Migrations
echo "🗄️  Running database migrations..."
python3 -c "import asyncio; from database import init_db; asyncio.run(init_db())"

# 3. Start FastAPI Server
echo "🚀 Starting FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port $PORT
