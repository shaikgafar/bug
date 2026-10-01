import os
from pydantic_settings import BaseSettings
from typing import Optional

def get_default_db_url() -> str:
    raw_db = os.getenv("DATABASE_URL", "")
    if not raw_db or "sqlite" in raw_db:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        db_path = os.path.join(base_dir, "bugtriage.db").replace("\\", "/")
        return f"sqlite+aiosqlite:///{db_path}"
    return raw_db

class Settings(BaseSettings):
    PROJECT_NAME: str = "Intelligent Software Bug Triage Agent"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = get_default_db_url()
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-bug-triage-jwt-key-2026-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # LLM Keys
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY", None)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    
    # Vector store & demo
    CHROMA_PATH: str = os.getenv("CHROMA_PATH") or os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "chroma_db"))
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    ENABLE_LIVE_SELENIUM: bool = os.getenv("ENABLE_LIVE_SELENIUM", "false").lower() in ("true", "1", "yes")
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
