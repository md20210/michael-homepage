"""Download LLM models for Railway deployment"""
import os
import urllib.request
import shutil
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

    # Check available disk space
    try:
        stat = shutil.disk_usage(MODEL_DIR)
        available_gb = stat.free / (1024**3)
        required_gb = model.size_gb + 0.5  # Add 500MB buffer

        print(f"📥 [DOWNLOAD] {model.name} from HuggingFace...")
        print(f"   Model Size: ~{model.size_gb:.2f} GB")
        print(f"   Available Space: {available_gb:.2f} GB")

        if available_gb < required_gb:
            error_msg = (
                f"Nicht genügend Speicherplatz! "
                f"Benötigt: {required_gb:.2f} GB, Verfügbar: {available_gb:.2f} GB. "
                f"Railway Volume ist zu klein. Bitte nutze ein kleineres Modell (z.B. Qwen2.5-3B oder DeepSeek-R1-1.5B) "
                f"oder erhöhe das Railway Volume auf mindestens {int(required_gb + 1)} GB."
            )
            print(f"\n❌ [ERROR] {error_msg}")
            raise RuntimeError(error_msg)

        print(f"   This may take a few minutes...")

    except RuntimeError:
        raise  # Re-raise disk space error
    except Exception as e:
        print(f"   ⚠️  Could not check disk space: {e}")
        print(f"   Attempting download anyway...")

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
    """Download Railway-safe models (medium-sized, production ready)"""
    print("=" * 70)
    print("LLM Model Download Script - Railway Safe Models (250 GB)")
    print("=" * 70)
    print()

    # Create model directory
    print(f"📁 Creating model directory: {MODEL_DIR}")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    print()

    # Railway-safe models for 250 GB Volume (excludes 70B Llama)
    safe_models = [
        "qwen2.5-0.5b",          # 0.35 GB - Fast fallback
        "deepseek-r1-1.5b",      # 1.12 GB - Reasoning
        "qwen2.5-3b",            # 2.0 GB - Good quality
        "qwen3-4b",              # 2.5 GB - Best default ⭐
        "deepseek-r1-7b",        # 4.92 GB - Reasoning powerhouse
        "qwen3-8b",              # 5.03 GB - Excellent quality
        "deepseek-r1-qwen3-8b",  # 5.03 GB - SOTA reasoning
        "mistral-7b-instruct",   # 4.37 GB - Allrounder
    ]

    total_size = sum(AVAILABLE_MODELS[mid].size_gb for mid in safe_models)
    print(f"📦 Downloading {len(safe_models)} Railway-safe models (Total: ~{total_size:.2f} GB / 250 GB):")
    for model_id in safe_models:
        model = AVAILABLE_MODELS[model_id]
        default_marker = " ⭐ DEFAULT" if model_id == "qwen3-4b" else ""
        print(f"   - {model.name} ({model.size_gb:.2f} GB){default_marker}")
    print()

    success_count = 0
    for model_id in safe_models:
        if download_model(model_id):
            success_count += 1
        print()

    print("=" * 70)
    print(f"✅ Downloaded {success_count}/{len(safe_models)} models successfully")
    print(f"💾 Disk usage: {total_size:.2f} GB / 250 GB ({(total_size/250)*100:.1f}%)")
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
