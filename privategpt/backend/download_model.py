"""Download LLM models for Railway deployment"""
import os
import urllib.request
from pathlib import Path
from llm_models import AVAILABLE_MODELS


# Use Railway Volume path if available, otherwise local path
if Path("/app/models").exists():
    MODEL_DIR = Path("/app/models")
else:
    MODEL_DIR = Path("./models")


def download_model(model_id: str):
    """Download a specific model if not exists"""
    model = AVAILABLE_MODELS[model_id]

    # Ensure model directory exists
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    model_path = MODEL_DIR / model.filename

    if model_path.exists():
        print(f"✅ [OK] {model.name} already exists at {model_path}")
        return True

    print(f"📥 [DOWNLOAD] {model.name} from HuggingFace...")
    print(f"   Size: ~{model.size_gb:.2f} GB")
    print(f"   This may take a few minutes...")

    def progress(block_num, block_size, total_size):
        downloaded = block_num * block_size
        if total_size > 0:
            percent = min(downloaded * 100 / total_size, 100)
            print(f"\r   Progress: {percent:.1f}%", end="", flush=True)

    try:
        urllib.request.urlretrieve(model.download_url, model_path, progress)
        print(f"\n✅ [OK] {model.name} downloaded successfully!")
        return True
    except Exception as e:
        print(f"\n❌ [ERROR] Error downloading {model.name}: {e}")
        print(f"   Please download manually from:")
        print(f"   {model.download_url}")
        if model_path.exists():
            model_path.unlink()  # Remove partial download
        return False


def download_all_models():
    """Download all available models"""
    print("=" * 70)
    print("LLM Model Download Script")
    print("=" * 70)
    print()

    # Create model directory
    print(f"📁 Creating model directory: {MODEL_DIR}")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    print()

    # Download each model
    success_count = 0
    for model_id in AVAILABLE_MODELS.keys():
        if download_model(model_id):
            success_count += 1
        print()

    # Summary
    print("=" * 70)
    print(f"✅ Downloaded {success_count}/{len(AVAILABLE_MODELS)} models successfully")
    print("=" * 70)


def download_default_model():
    """Download only the default model (DeepSeek-R1-1.5B) for quick startup"""
    print("=" * 70)
    print("LLM Model Download Script - Default Model Only")
    print("=" * 70)
    print()

    # Create model directory
    print(f"📁 Creating model directory: {MODEL_DIR}")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    print()

    # Download default model (DeepSeek-R1-1.5B)
    from llm_models import DEFAULT_MODEL
    print(f"📦 Downloading default model: {DEFAULT_MODEL}")
    success = download_model(DEFAULT_MODEL)

    print()
    print("=" * 70)
    if success:
        print("✅ Default model ready!")
        print("ℹ️  Other models can be downloaded via Admin Panel when needed")
    else:
        print("❌ Failed to download default model")
    print("=" * 70)

    return success


def download_railway_safe_models():
    """Download Railway-safe models (excludes RAM-intensive 7B)"""
    print("=" * 70)
    print("LLM Model Download Script - Railway Safe Models")
    print("=" * 70)
    print()

    # Create model directory
    print(f"📁 Creating model directory: {MODEL_DIR}")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    print()

    # Railway-safe models (alle Modelle sind nun Railway-sicher)
    safe_models = ["qwen2.5-0.5b", "deepseek-r1-1.5b", "qwen2.5-3b", "qwen3-4b"]

    total_size = sum(AVAILABLE_MODELS[mid].size_gb for mid in safe_models)
    print(f"📦 Downloading {len(safe_models)} Railway-safe models (Total: ~{total_size:.2f} GB):")
    for model_id in safe_models:
        model = AVAILABLE_MODELS[model_id]
        default_marker = " ⭐ DEFAULT" if model_id == "deepseek-r1-1.5b" else ""
        print(f"   - {model.name} ({model.size_gb:.2f} GB){default_marker}")
    print()

    success_count = 0
    for model_id in safe_models:
        if download_model(model_id):
            success_count += 1
        print()

    print("=" * 70)
    print(f"✅ Downloaded {success_count}/{len(safe_models)} models successfully")
    print("=" * 70)

    return success_count == len(safe_models)


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        if sys.argv[1] == "--all":
            download_all_models()
        elif sys.argv[1] == "--railway":
            download_railway_safe_models()
        else:
            print(f"Unknown option: {sys.argv[1]}")
            print("Usage: python download_model.py [--all|--railway]")
    else:
        download_default_model()
