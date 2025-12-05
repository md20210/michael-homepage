"""Configuration management"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""

    # API Keys
    resend_api_key: str
    jwt_secret: str

    # Ollama Config (DEPRECATED - nur für lokale Entwicklung mit Ollama)
    ollama_base_url: str = "http://localhost:11434"

    # URLs
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"

    # Database - Unterstützt PostgreSQL + SQLite
    database_url: str = "sqlite+aiosqlite:///./privategpt.db"

    # Email
    from_email: str = "noreply@dabrock.eu"
    magic_link_expiry_minutes: int = 15
    session_expiry_days: int = 30

    # LLM Config - llama-cpp-python mit Qwen2.5-0.5B
    llm_model_path: str = "./models/qwen2.5-0.5b-instruct-q4_k_m.gguf"
    llm_context_size: int = 4096  # Context Window (Qwen2.5 unterstützt bis 32k!)
    llm_max_tokens: int = 512  # Max Output Tokens
    llm_temperature: float = 0.7
    llm_threads: int = 4  # CPU Threads (Railway: 8 vCPUs)

    # Railway Environment Detection
    railway_environment: str | None = None  # Wird automatisch gesetzt

    # Legacy Ollama Model (für lokale Entwicklung mit Ollama)
    llm_model: str = "qwen2.5:0.5b"  # Nur wenn Ollama läuft

    # Limits
    max_file_size_mb: int = 10
    max_files_per_user: int = 50

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
