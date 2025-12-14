#!/bin/bash
set -e

echo "🚀 [START] PrivateGPT Backend Starting..."
echo ""

# Check if models directory exists and has models
MODEL_DIR="/app/models"
DEFAULT_MODEL="DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf"

if [ ! -d "$MODEL_DIR" ]; then
    echo "📁 [START] Creating models directory..."
    mkdir -p "$MODEL_DIR"
fi

# Check if default model exists
if [ ! -f "$MODEL_DIR/$DEFAULT_MODEL" ]; then
    echo "📥 [START] Default model not found, downloading..."
    echo ""
    python download_model.py
    echo ""
    echo "✅ [START] Model download complete!"
else
    echo "✅ [START] Default model found: $DEFAULT_MODEL"
fi

echo ""
echo "🎯 [START] Starting FastAPI server..."
echo ""

# Start the FastAPI application
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
