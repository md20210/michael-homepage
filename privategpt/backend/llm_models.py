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
    "deepseek-r1-7b": LLMModel(
        id="deepseek-r1-7b",
        name="DeepSeek-R1-7B (Beste Qualität, RAM-intensiv)",
        filename="DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf",
        size_gb=4.68,
        params="7B",
        quality="Excellent",
        description="Beste Qualität, aber kann Railway RAM überlasten (Vorsicht!)",
        download_url="https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-7B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf"
    ),
}


# Default model - DeepSeek-R1-1.5B (Railway-sicher, beste Balance)
DEFAULT_MODEL = "deepseek-r1-1.5b"


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
