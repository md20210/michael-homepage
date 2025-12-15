"""LLM Model Registry - Verfügbare Modelle für Admin-Panel"""
from typing import Dict, List
from dataclasses import dataclass
from pathlib import Path


@dataclass
class LLMModel:
    """LLM Model Definition"""
    id: str  # Unique identifier
    name: str  # Display name
    filename: str  # GGUF filename
    size_gb: float  # Model size in GB
    params: str  # Parameter count (e.g., "500M", "3B")
    quality: str  # Quality rating: "Low", "Medium", "High", "Excellent"
    description: str  # Short description
    download_url: str  # HuggingFace download URL


# Registry of available LLM models
AVAILABLE_MODELS: Dict[str, LLMModel] = {
    # === SMALL MODELS (< 2 GB) - Fast, Lower Quality ===
    "qwen2.5-0.5b": LLMModel(
        id="qwen2.5-0.5b",
        name="Qwen2.5-0.5B (Schnell, niedrige Qualität)",
        filename="qwen2.5-0.5b-instruct-q4_k_m.gguf",
        size_gb=0.35,
        params="500M",
        quality="Low",
        description="Kleinstes Modell, schnell aber schlechte deutsche Grammatik",
        download_url="https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf"
    ),
    "deepseek-r1-1.5b": LLMModel(
        id="deepseek-r1-1.5b",
        name="DeepSeek-R1-1.5B (Reasoning, schnell)",
        filename="DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf",
        size_gb=1.12,
        params="1.5B",
        quality="Medium",
        description="DeepSeek-R1 Reasoning Model, optimiert für Mathematik",
        download_url="https://huggingface.co/unsloth/DeepSeek-R1-Distill-Qwen-1.5B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf"
    ),

    # === MEDIUM MODELS (2-5 GB) - Balanced Quality & Speed ===
    "qwen2.5-3b": LLMModel(
        id="qwen2.5-3b",
        name="Qwen2.5-3B (Gute Qualität)",
        filename="qwen2.5-3b-instruct-q4_k_m.gguf",
        size_gb=2.0,
        params="3B",
        quality="High",
        description="6x größer als 0.5B, deutlich besseres Deutsch",
        download_url="https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf"
    ),
    "qwen3-4b": LLMModel(
        id="qwen3-4b",
        name="Qwen3-4B (Sehr gute Qualität) ⭐",
        filename="qwen3-4b-q4_k_m.gguf",
        size_gb=2.5,
        params="4B",
        quality="Excellent",
        description="Qwen3 Gen: Verbesserte Reasoning, 100+ Sprachen, Multilingual-Deutsch",
        download_url="https://huggingface.co/Aldaris/Qwen3-4B-Q4_K_M-GGUF/resolve/main/qwen3-4b-q4_k_m.gguf"
    ),
    "deepseek-r1-7b": LLMModel(
        id="deepseek-r1-7b",
        name="DeepSeek-R1-7B (Reasoning Powerhouse)",
        filename="DeepSeek-R1-q4_k_m.gguf",
        size_gb=4.92,
        params="7B",
        quality="Excellent",
        description="OpenAI-o1 Level Reasoning: Mathematik, Code, logisches Denken",
        download_url="https://huggingface.co/calcuis/deepseek-r1/resolve/main/DeepSeek-R1-q4_k_m.gguf"
    ),

    # === LARGE MODELS (5-10 GB) - High Quality ===
    "qwen3-8b": LLMModel(
        id="qwen3-8b",
        name="Qwen3-8B (Exzellente Qualität)",
        filename="qwen3-8b-q4_k_m.gguf",
        size_gb=5.03,
        params="8B",
        quality="Excellent",
        description="Qwen3 Gen: Top Reasoning, 100+ Sprachen, perfektes Deutsch",
        download_url="https://huggingface.co/Triangle104/Qwen3-8B-Q4_K_M-GGUF/resolve/main/qwen3-8b-q4_k_m.gguf"
    ),
    "deepseek-r1-qwen3-8b": LLMModel(
        id="deepseek-r1-qwen3-8b",
        name="DeepSeek-R1-Qwen3-8B (SOTA Reasoning) ⭐",
        filename="DeepSeek-R1-0528-Qwen3-8B-Q4_K_M.gguf",
        size_gb=5.03,
        params="8B",
        quality="Excellent",
        description="SOTA Open-Source: DeepSeek-R1 + Qwen3, übertrifft Qwen3-235B",
        download_url="https://huggingface.co/unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/resolve/main/DeepSeek-R1-0528-Qwen3-8B-Q4_K_M.gguf"
    ),
    "mistral-7b-instruct": LLMModel(
        id="mistral-7b-instruct",
        name="Mistral-7B-Instruct-v0.3 (Allrounder)",
        filename="mistral-7b-instruct-v0.3.Q4_K_M.gguf",
        size_gb=4.37,
        params="7B",
        quality="High",
        description="Mistral AI Foundation Model: Instruktions-Tuning, Multilingual",
        download_url="https://huggingface.co/bartowski/Mistral-7B-Instruct-v0.3-GGUF/resolve/main/Mistral-7B-Instruct-v0.3-Q4_K_M.gguf"
    ),

    # === HUGE MODELS (40+ GB) - Best Quality, Slow ===
    "llama-3.3-70b": LLMModel(
        id="llama-3.3-70b",
        name="Llama-3.3-70B-Instruct (Production Grade) 🚀",
        filename="Llama-3.3-70B-Instruct-Q4_K_M.gguf",
        size_gb=42.52,
        params="70B",
        quality="Outstanding",
        description="Meta Llama 3.3: 8 Sprachen (inkl. Deutsch), SOTA Performance, Production Ready",
        download_url="https://huggingface.co/bartowski/Llama-3.3-70B-Instruct-GGUF/resolve/main/Llama-3.3-70B-Instruct-Q4_K_M.gguf"
    ),
}


# Default model - Qwen3-4B (beste Balance: Qualität, Größe, Speed)
DEFAULT_MODEL = "qwen3-4b"


def get_model(model_id: str) -> LLMModel:
    """Get model by ID"""
    return AVAILABLE_MODELS.get(model_id, AVAILABLE_MODELS[DEFAULT_MODEL])


def get_all_models() -> List[Dict]:
    """Get all models as list of dicts (for API)"""
    return [
        {
            "id": model.id,
            "name": model.name,
            "filename": model.filename,
            "size_gb": model.size_gb,
            "params": model.params,
            "quality": model.quality,
            "description": model.description
        }
        for model in AVAILABLE_MODELS.values()
    ]


def get_model_path(model_id: str) -> str:
    """Get full path to model file"""
    model = get_model(model_id)

    # Use Railway Volume path if available, otherwise local path
    if Path("/app/models").exists():
        return f"/app/models/{model.filename}"
    else:
        return f"./models/{model.filename}"
