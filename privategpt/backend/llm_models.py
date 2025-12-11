"""LLM Model Registry - Verfügbare Modelle für Admin-Panel"""
from typing import Dict, List
from dataclasses import dataclass


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
    "qwen2.5-3b": LLMModel(
        id="qwen2.5-3b",
        name="Qwen2.5-3B (Empfohlen, gute Qualität)",
        filename="qwen2.5-3b-instruct-q4_k_m.gguf",
        size_gb=2.0,
        params="3B",
        quality="High",
        description="6x größer, deutlich besseres Deutsch, empfohlen für Produktion",
        download_url="https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf"
    ),
}


# Default model
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
    return f"./models/{model.filename}"
