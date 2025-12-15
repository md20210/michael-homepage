"""Download ALL models in parallel for maximum speed (250 GB Railway Volume)"""
import asyncio
import httpx
from pathlib import Path
from llm_models import AVAILABLE_MODELS
import os

# Use Railway Volume path if available, otherwise local path
if Path("/app/models").exists():
    MODEL_DIR = Path("/app/models")
else:
    MODEL_DIR = Path("./models")


async def download_model_async(model_id: str, semaphore: asyncio.Semaphore):
    """Download a single model asynchronously"""
    async with semaphore:  # Limit concurrent downloads
        model = AVAILABLE_MODELS[model_id]

        # Ensure model directory exists
        MODEL_DIR.mkdir(parents=True, exist_ok=True)

        model_path = MODEL_DIR / model.filename

        if model_path.exists():
            print(f"✅ [OK] {model.name} already exists ({model.size_gb:.2f} GB)")
            return True

        print(f"\n📥 [DOWNLOAD] {model.name}")
        print(f"   Size: {model.size_gb:.2f} GB")
        print(f"   URL: {model.download_url}")
        print(f"   This may take a few minutes...")

        try:
            async with httpx.AsyncClient(timeout=600.0, follow_redirects=True) as client:
                # Stream download to show progress
                async with client.stream("GET", model.download_url) as response:
                    response.raise_for_status()

                    total_size = int(response.headers.get("content-length", 0))
                    downloaded = 0

                    with open(model_path, "wb") as f:
                        async for chunk in response.aiter_bytes(chunk_size=8192):
                            f.write(chunk)
                            downloaded += len(chunk)

                            if total_size > 0:
                                percent = (downloaded / total_size) * 100
                                print(f"\r   {model.name}: {percent:.1f}%", end="", flush=True)

                print(f"\n✅ [OK] {model.name} downloaded successfully!")
                return True

        except Exception as e:
            print(f"\n❌ [ERROR] Error downloading {model.name}: {e}")
            if model_path.exists():
                model_path.unlink()  # Remove partial download
            return False


async def download_all_models_parallel(max_concurrent: int = 3):
    """Download all models in parallel with concurrency limit"""
    print("=" * 80)
    print("🚀 PARALLEL MODEL DOWNLOAD - Railway 250 GB Edition")
    print("=" * 80)
    print()

    # Create model directory
    print(f"📁 Model Directory: {MODEL_DIR}")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    print()

    # Calculate total size
    total_size = sum(model.size_gb for model in AVAILABLE_MODELS.values())
    print(f"📦 Downloading {len(AVAILABLE_MODELS)} models (Total: {total_size:.2f} GB / 250 GB)")
    print(f"⚡ Max concurrent downloads: {max_concurrent}")
    print()

    # List models
    for model_id, model in AVAILABLE_MODELS.items():
        print(f"   - {model.name} ({model.size_gb:.2f} GB)")
    print()
    print("=" * 80)
    print()

    # Create semaphore to limit concurrent downloads
    semaphore = asyncio.Semaphore(max_concurrent)

    # Download all models in parallel
    tasks = [
        download_model_async(model_id, semaphore)
        for model_id in AVAILABLE_MODELS.keys()
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Summary
    success_count = sum(1 for r in results if r is True)
    print()
    print("=" * 80)
    print(f"✅ Downloaded {success_count}/{len(AVAILABLE_MODELS)} models successfully")
    print(f"💾 Total disk usage: ~{total_size:.2f} GB / 250 GB ({(total_size/250)*100:.1f}%)")
    print("=" * 80)

    return success_count == len(AVAILABLE_MODELS)


async def download_recommended_models():
    """Download only recommended models for quick start"""
    print("=" * 80)
    print("⭐ RECOMMENDED MODELS - Quick Start")
    print("=" * 80)
    print()

    # Recommended models (balanced selection)
    recommended = [
        "qwen3-4b",              # Best default (2.5 GB)
        "deepseek-r1-qwen3-8b",  # SOTA reasoning (5.03 GB)
        "llama-3.3-70b",         # Production grade (42.52 GB)
    ]

    total_size = sum(AVAILABLE_MODELS[mid].size_gb for mid in recommended)
    print(f"📦 Downloading {len(recommended)} recommended models (Total: {total_size:.2f} GB)")
    print()

    for model_id in recommended:
        model = AVAILABLE_MODELS[model_id]
        print(f"   - {model.name} ({model.size_gb:.2f} GB)")
    print()
    print("=" * 80)
    print()

    # Download with concurrency limit of 2 for large models
    semaphore = asyncio.Semaphore(2)

    tasks = [download_model_async(mid, semaphore) for mid in recommended]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    success_count = sum(1 for r in results if r is True)
    print()
    print("=" * 80)
    print(f"✅ Downloaded {success_count}/{len(recommended)} recommended models")
    print("=" * 80)

    return success_count == len(recommended)


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        if sys.argv[1] == "--recommended":
            asyncio.run(download_recommended_models())
        elif sys.argv[1] == "--help":
            print("Usage:")
            print("  python download_all_models_parallel.py          # Download ALL models")
            print("  python download_all_models_parallel.py --recommended  # Download recommended models only")
        else:
            print(f"Unknown option: {sys.argv[1]}")
            print("Use --help for usage information")
    else:
        # Default: Download all models
        asyncio.run(download_all_models_parallel(max_concurrent=3))
