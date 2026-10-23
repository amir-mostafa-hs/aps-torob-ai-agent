import os
import json
from pathlib import Path
from typing import Union, List, Any
from pydantic import field_validator
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
    CORS_ORIGINS: Any = ["*"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if v.strip() in ("*", '["*"]', "['*']"):
                return ["*"]
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

settings = Settings()
