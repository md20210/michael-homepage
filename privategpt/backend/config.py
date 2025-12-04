"""Configuration management"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""

    # API Keys
    resend_api_key: str
    jwt_secret: str

    # Ollama Config (local LLM)
    ollama_base_url: str = "http://localhost:11434"

    # URLs
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"

    # Database
    database_url: str = "sqlite+aiosqlite:///./privategpt.db"

    # Email
    from_email: str = "noreply@dabrock.eu"
    magic_link_expiry_minutes: int = 15
    session_expiry_days: int = 30

    # LLM Config (Ollama)
    llm_model: str = "deepseek-r1:1.5b"  # Using 1.5B for faster CPU inference (prototype)
    # Alternative: "deepseek-r1:7b" (better quality, slower) or "deepseek-r1:14b" (best quality, very slow)

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
