#!/bin/bash
# Download models directly on Railway Volume

echo "========================================"
echo "Railway Model Download - Direct Execution"
echo "========================================"
echo ""

# Recommended models for 50 GB volume
MODELS=(
    "qwen2.5-0.5b"
    "deepseek-r1-1.5b"
    "qwen3-4b"
    "qwen3-8b"
    "deepseek-r1-qwen3-8b"
)

echo "Will download 5 models (~14 GB):"
for model in "${MODELS[@]}"; do
    echo "  - $model"
done
echo ""

# Import and run download function
python3 << 'PYTHON_SCRIPT'
from download_model import download_model, AVAILABLE_MODELS

models = [
    "qwen2.5-0.5b",
    "deepseek-r1-1.5b",
    "qwen3-4b",
    "qwen3-8b",
    "deepseek-r1-qwen3-8b"
]

print("Starting downloads...")
print()

success_count = 0
for model_id in models:
    if download_model(model_id):
        success_count += 1
    print()

print("=" * 70)
print(f"✅ Downloaded {success_count}/{len(models)} models successfully")
print("=" * 70)
PYTHON_SCRIPT
