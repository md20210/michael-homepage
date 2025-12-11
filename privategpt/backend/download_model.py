"""Download LLM models for Railway deployment"""
import os
import urllib.request
from pathlib import Path
from llm_models import AVAILABLE_MODELS


MODEL_DIR = Path("./models")


def download_model(model_id: str):
    """Download a specific model if not exists"""
    model = AVAILABLE_MODELS[model_id]
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


if __name__ == "__main__":
    download_all_models()
