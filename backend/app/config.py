from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    APP_NAME: str = "ConvoTracker"
    APP_VERSION: str = "1.0.0"
    DATABASE_URL: str = "sqlite+aiosqlite:///./convotracker.db"
    SCRAPING_INTERVAL_HOURS: int = 24
    SCRAPING_ENABLED: bool = True
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]
    PDF_OUTPUT_DIR: str = str(Path(__file__).parent.parent / "reports")
    
    class Config:
        env_file = ".env"

settings = Settings()
