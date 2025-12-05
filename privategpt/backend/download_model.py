"""Download Qwen2.5-0.5B model for Railway deployment"""
import os
import urllib.request
from pathlib import Path

MODEL_URL = "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf"
MODEL_DIR = Path("./models")
MODEL_PATH = MODEL_DIR / "qwen2.5-0.5b-instruct-q4_k_m.gguf"


def download_model():
    """Download Qwen2.5-0.5B model if not exists"""
    if MODEL_PATH.exists():
        print(f"[OK] Model already exists at {MODEL_PATH}")
        return

    print(f"Creating model directory: {MODEL_DIR}")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    print(f"[DOWNLOAD] Qwen2.5-0.5B model from {MODEL_URL}...")
    print("This may take a few minutes (file size: ~390MB)")

    def progress(block_num, block_size, total_size):
        downloaded = block_num * block_size
        if total_size > 0:
            percent = min(downloaded * 100 / total_size, 100)
            print(f"\rProgress: {percent:.1f}%", end="", flush=True)

    try:
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH, progress)
        print(f"\n[OK] Model downloaded successfully to {MODEL_PATH}")
    except Exception as e:
        print(f"\n[ERROR] Error downloading model: {e}")
        print("Please download manually from:")
        print(MODEL_URL)
        if MODEL_PATH.exists():
            MODEL_PATH.unlink()  # Remove partial download
        raise


if __name__ == "__main__":
    download_model()
