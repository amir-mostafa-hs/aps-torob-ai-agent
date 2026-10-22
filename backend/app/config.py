import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Resolve base directories
ROOT_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Torob In-Person Shopping Assistant"
    DEBUG: bool = False
    
    # Dataset Paths
    SOURCE_DB_PATH: str = str(ROOT_DIR / "torob-dataset" / "processed_data" / "torob_agent.sqlite")
    MALLS_PATH: str = str(ROOT_DIR / "torob-dataset" / "processed_data" / "tehran_malls_directory.json")
    BAZAARS_PATH: str = str(ROOT_DIR / "torob-dataset" / "processed_data" / "tehran_bazaar_hubs_by_category.json")
    GUIDES_PATH: str = str(ROOT_DIR / "torob-dataset" / "processed_data" / "product_reviews_and_buying_guides.json")
    
    # Session Persistence
    SESSION_DB_PATH: str = str(ROOT_DIR / "backend" / "session_store.sqlite")
    SESSION_TTL_HOURS: int = 4
    
    # LLM Providers
    BOXAPI_BASE_URL: str = "https://ai.boxapi.ir/ai/v1"
    BOXAPI_API_KEY: str = os.getenv("BOXAPI_API_KEY", "")
    BOXAPI_MODEL: str = os.getenv("BOXAPI_MODEL", "gpt-5-mini")
    
    GEMINI_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini") # 'boxapi' or 'gemini' or 'mock'
    
    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("PORT", 8000))
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
