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
        name="DeepSeek-R1-1.5B (Empfohlen, Railway-sicher)",
        filename="DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf",
        size_gb=1.12,
        params="1.5B",
        quality="High",
        description="DeepSeek-R1 Reasoning Model, optimiert für Railway",
        download_url="https://huggingface.co/unsloth/DeepSeek-R1-Distill-Qwen-1.5B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf"
    ),
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
        name="Qwen3-4B (Sehr gute Qualität, Railway-sicher)",
        filename="qwen3-4b-q4_k_m.gguf",
        size_gb=2.5,
        params="4B",
        quality="Excellent",
        description="Qwen3 mit verbessertem Reasoning & Deutsch-Support, Railway-sicher",
        download_url="https://huggingface.co/Aldaris/Qwen3-4B-Q4_K_M-GGUF/resolve/main/qwen3-4b-q4_k_m.gguf"
    ),
}


# Default model - Qwen2.5-0.5B (kleinste Größe, sollte bereits auf Railway vorhanden sein)
DEFAULT_MODEL = "qwen2.5-0.5b"


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
